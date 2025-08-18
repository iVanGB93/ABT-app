import { useState, useEffect } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import axiosInstance from '@/axios';

interface BiometricAuthState {
  isAvailable: boolean;
  isEnrolled: boolean;
  supportedTypes: LocalAuthentication.AuthenticationType[];
  isEnabled: boolean;
  loading: boolean;
  error: string | null;
  hasStoredCredentials: boolean;
}

interface StoredCredentials {
  username: string;
  password: string; // Add password for fallback login
  token: string;
  refreshToken: string;
}

interface BiometricAuthActions {
  authenticate: (reason?: string) => Promise<boolean>;
  enableBiometric: (credentials: StoredCredentials) => Promise<boolean>;
  disableBiometric: () => Promise<void>;
  checkBiometricStatus: () => Promise<void>;
  getBiometricTypeNames: () => string[];
  authenticateAndGetCredentials: (reason?: string) => Promise<StoredCredentials | null>;
  getStoredUserInfo: () => Promise<{ username: string } | null>;
  refreshStoredTokens: () => Promise<StoredCredentials | null>;
  loginWithStoredCredentials: () => Promise<StoredCredentials | null>;
}

const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';
const STORED_CREDENTIALS_KEY = 'biometric_credentials';

export const useBiometricAuth = (): BiometricAuthState & BiometricAuthActions => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [supportedTypes, setSupportedTypes] = useState<LocalAuthentication.AuthenticationType[]>([]);
  const [isEnabled, setIsEnabled] = useState(false);
  const [hasStoredCredentials, setHasStoredCredentials] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check biometric availability and enrollment status
  const checkBiometricStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if device supports biometric authentication
      const compatible = await LocalAuthentication.hasHardwareAsync();
      setIsAvailable(compatible);

      if (compatible) {
        // Check if user has enrolled biometric credentials
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        setIsEnrolled(enrolled);

        // Get supported authentication types
        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        setSupportedTypes(types);

        // Check if user has enabled biometric login in the app
        const enabled = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
        setIsEnabled(enabled === 'true');

        // Check if credentials are stored
        const storedCreds = await SecureStore.getItemAsync(STORED_CREDENTIALS_KEY);
        setHasStoredCredentials(!!storedCreds);
      }
    } catch (err: any) {
      setError(err.message || 'Error checking biometric status');
    } finally {
      setLoading(false);
    }
  };

  // Basic authenticate (just check biometric, no credentials)
  const authenticate = async (reason?: string): Promise<boolean> => {
    try {
      setError(null);

      if (!isAvailable || !isEnrolled) {
        setError('Biometric authentication not available or not enrolled');
        return false;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: reason || 'Authenticate to access the app',
        fallbackLabel: 'Use password instead',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      if (result.success) {
        return true;
      } else {
        // Handle different error types
        if (result.error === 'user_cancel') {
          setError('Authentication was cancelled');
        } else if (result.error === 'user_fallback') {
          setError('User chose to use fallback authentication');
        } else if (result.error === 'system_cancel') {
          setError('Authentication was cancelled by the system');
        } else if (result.error === 'app_cancel') {
          setError('Authentication was cancelled by the app');
        } else if (result.error === 'not_available') {
          setError('Biometric authentication is unavailable');
        } else if (result.error === 'not_enrolled') {
          setError('No biometric credentials are enrolled');
        } else if (result.error === 'lockout') {
          setError('Too many failed attempts, biometric authentication is locked');
        } else if (result.error === 'authentication_failed') {
          setError('Authentication failed');
        } else {
          setError('Authentication failed');
        }
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error');
      return false;
    }
  };

  // Authenticate and return stored credentials with auto-refresh
  const authenticateAndGetCredentials = async (reason?: string): Promise<StoredCredentials | null> => {
    try {
      setError(null);

      if (!isAvailable || !isEnrolled || !isEnabled || !hasStoredCredentials) {
        setError('Biometric authentication not available or not set up');
        return null;
      }

      const authSuccess = await authenticate(reason);
      if (!authSuccess) {
        return null;
      }

      // Get stored credentials
      const storedCredsString = await SecureStore.getItemAsync(STORED_CREDENTIALS_KEY);
      if (!storedCredsString) {
        setError('No stored credentials found');
        return null;
      }

      let credentials = JSON.parse(storedCredsString) as StoredCredentials;

      // Strategy 1: Try to refresh tokens using refresh token
      console.log('Strategy 1: Attempting to refresh tokens...');
      try {
        const refreshedCredentials = await refreshStoredTokens();
        
        if (refreshedCredentials) {
          console.log('✅ Tokens refreshed successfully with refresh token');
          return refreshedCredentials;
        }
      } catch (refreshError) {
        console.log('❌ Refresh token strategy failed:', refreshError);
      }

      // Strategy 2: If refresh fails, try login with stored username/password
      console.log('Strategy 2: Attempting login with stored credentials...');
      try {
        const loginCredentials = await loginWithStoredCredentials();
        
        if (loginCredentials) {
          console.log('✅ Login successful with stored username/password');
          return loginCredentials;
        }
      } catch (loginError) {
        console.log('❌ Username/password login strategy failed:', loginError);
      }

      // Strategy 3: If all fails, return current credentials as last resort
      // This might still work if axiosInstance handles token refresh automatically
      console.log('Strategy 3: Using current tokens as fallback (axiosInstance will handle refresh)');
      return credentials;

    } catch (err: any) {
      setError(err.message || 'Error retrieving credentials');
      return null;
    }
  };

  // Enable biometric authentication and store credentials
  const enableBiometric = async (credentials: StoredCredentials): Promise<boolean> => {
    try {
      setError(null);

      if (!isAvailable || !isEnrolled) {
        setError('Biometric authentication not available');
        return false;
      }

      // Authenticate first to enable biometric login
      const authenticated = await authenticate('Enable biometric login');
      
      if (authenticated) {
        // Store credentials securely
        await SecureStore.setItemAsync(STORED_CREDENTIALS_KEY, JSON.stringify(credentials));
        await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, 'true');
        
        setIsEnabled(true);
        setHasStoredCredentials(true);
        return true;
      }
      
      return false;
    } catch (err: any) {
      setError(err.message || 'Error enabling biometric authentication');
      return false;
    }
  };

  // Disable biometric authentication and clear stored credentials
  const disableBiometric = async (): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(BIOMETRIC_ENABLED_KEY);
      await SecureStore.deleteItemAsync(STORED_CREDENTIALS_KEY);
      
      setIsEnabled(false);
      setHasStoredCredentials(false);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error disabling biometric authentication');
    }
  };

  // Get stored user info (username only, without authentication)
  const getStoredUserInfo = async (): Promise<{ username: string } | null> => {
    try {
      if (!hasStoredCredentials) {
        return null;
      }

      const storedCredsString = await SecureStore.getItemAsync(STORED_CREDENTIALS_KEY);
      if (storedCredsString) {
        const credentials = JSON.parse(storedCredsString) as StoredCredentials;
        return { username: credentials.username };
      }

      return null;
    } catch (err: any) {
      setError(err.message || 'Error retrieving user info');
      return null;
    }
  };

  // Refresh stored tokens using refreshToken
  const refreshStoredTokens = async (): Promise<StoredCredentials | null> => {
    try {
      setError(null);

      if (!hasStoredCredentials) {
        setError('No stored credentials to refresh');
        return null;
      }

      // Get current stored credentials
      const storedCredsString = await SecureStore.getItemAsync(STORED_CREDENTIALS_KEY);
      if (!storedCredsString) {
        setError('No stored credentials found');
        return null;
      }

      const currentCredentials = JSON.parse(storedCredsString) as StoredCredentials;

      // Use refresh token to get new access token
      const response = await axiosInstance.post('token/refresh/', {
        refresh: currentCredentials.refreshToken
      });

      if (response.data.access) {
        // Create new credentials with refreshed token
        const newCredentials: StoredCredentials = {
          ...currentCredentials,
          token: response.data.access,
          // If refresh token is also renewed, update it
          refreshToken: response.data.refresh || currentCredentials.refreshToken
        };

        // Store the new credentials
        await SecureStore.setItemAsync(STORED_CREDENTIALS_KEY, JSON.stringify(newCredentials));
        
        return newCredentials;
      } else {
        setError('Failed to refresh token');
        return null;
      }
    } catch (err: any) {
      // If refresh token is also expired, we need to clear stored credentials
      if (err.response?.status === 401) {
        setError('Refresh token expired. Please login again.');
        await disableBiometric(); // Clear stored credentials
        return null;
      }
      
      setError(err.message || 'Error refreshing tokens');
      return null;
    }
  };

  // Login with stored username and password (fallback method)
  const loginWithStoredCredentials = async (): Promise<StoredCredentials | null> => {
    try {
      setError(null);

      if (!hasStoredCredentials) {
        setError('No stored credentials available');
        return null;
      }

      // Get stored credentials
      const storedCredsString = await SecureStore.getItemAsync(STORED_CREDENTIALS_KEY);
      if (!storedCredsString) {
        setError('No stored credentials found');
        return null;
      }

      const credentials = JSON.parse(storedCredsString) as StoredCredentials;

      // Make login request with username and password
      const response = await axiosInstance.post('token/', {
        username: credentials.username,
        password: credentials.password
      });

      if (response.data.access && response.data.refresh) {
        // Create new credentials with fresh tokens
        const newCredentials: StoredCredentials = {
          ...credentials, // Keep username and password
          token: response.data.access,
          refreshToken: response.data.refresh
        };

        // Update stored credentials with new tokens
        await SecureStore.setItemAsync(STORED_CREDENTIALS_KEY, JSON.stringify(newCredentials));
        
        return newCredentials;
      } else {
        setError('Login response missing tokens');
        return null;
      }
    } catch (err: any) {
      // If login fails due to invalid credentials, clear stored data
      if (err.response?.status === 401) {
        setError('Stored credentials are invalid. Please login again.');
        await disableBiometric(); // Clear invalid credentials
        return null;
      }
      
      setError(err.message || 'Error during fallback login');
      return null;
    }
  };

  // Get human-readable biometric type names
  const getBiometricTypeNames = (): string[] => {
    return supportedTypes.map(type => {
      switch (type) {
        case LocalAuthentication.AuthenticationType.FINGERPRINT:
          return 'Fingerprint';
        case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
          return 'Face Recognition';
        case LocalAuthentication.AuthenticationType.IRIS:
          return 'Iris Recognition';
        default:
          return 'Biometric';
      }
    });
  };

  // Initialize on hook mount
  useEffect(() => {
    checkBiometricStatus();
  }, []);

  return {
    // State
    isAvailable,
    isEnrolled,
    supportedTypes,
    isEnabled,
    hasStoredCredentials,
    loading,
    error,
    // Actions
    authenticate,
    enableBiometric,
    disableBiometric,
    checkBiometricStatus,
    getBiometricTypeNames,
    authenticateAndGetCredentials,
    getStoredUserInfo,
    refreshStoredTokens,
    loginWithStoredCredentials,
  };
};
