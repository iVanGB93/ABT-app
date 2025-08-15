import { useState, useEffect } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

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

  // Authenticate and return stored credentials
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
      if (storedCredsString) {
        return JSON.parse(storedCredsString) as StoredCredentials;
      }

      setError('No stored credentials found');
      return null;
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
  };
};
