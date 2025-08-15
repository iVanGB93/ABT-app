import { useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useBiometricAuth } from './useBiometricAuth';

const STORED_CREDENTIALS_KEY = 'stored_credentials';

interface StoredCredentials {
  username: string;
  token: string;
  refreshToken: string;
}

interface SecureAuthState {
  hasStoredCredentials: boolean;
  loading: boolean;
  error: string | null;
}

interface SecureAuthActions {
  storeCredentials: (credentials: StoredCredentials) => Promise<boolean>;
  getStoredCredentials: () => Promise<StoredCredentials | null>;
  clearStoredCredentials: () => Promise<void>;
  authenticateWithBiometric: () => Promise<StoredCredentials | null>;
}

export const useSecureAuth = (): SecureAuthState & SecureAuthActions => {
  const [hasStoredCredentials, setHasStoredCredentials] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { 
    isAvailable, 
    isEnrolled, 
    isEnabled, 
    authenticate 
  } = useBiometricAuth();

  // Check if credentials are stored
  const checkStoredCredentials = async () => {
    try {
      setLoading(true);
      const stored = await SecureStore.getItemAsync(STORED_CREDENTIALS_KEY);
      setHasStoredCredentials(!!stored);
    } catch (err: any) {
      setError(err.message || 'Error checking stored credentials');
      setHasStoredCredentials(false);
    } finally {
      setLoading(false);
    }
  };

  // Store credentials securely
  const storeCredentials = async (credentials: StoredCredentials): Promise<boolean> => {
    try {
      setError(null);
      
      if (!isAvailable || !isEnrolled || !isEnabled) {
        setError('Biometric authentication not available');
        return false;
      }

      const credentialsString = JSON.stringify(credentials);
      await SecureStore.setItemAsync(STORED_CREDENTIALS_KEY, credentialsString);
      setHasStoredCredentials(true);
      return true;
    } catch (err: any) {
      setError(err.message || 'Error storing credentials');
      return false;
    }
  };

  // Get stored credentials
  const getStoredCredentials = async (): Promise<StoredCredentials | null> => {
    try {
      setError(null);
      const stored = await SecureStore.getItemAsync(STORED_CREDENTIALS_KEY);
      if (stored) {
        return JSON.parse(stored) as StoredCredentials;
      }
      return null;
    } catch (err: any) {
      setError(err.message || 'Error retrieving credentials');
      return null;
    }
  };

  // Clear stored credentials
  const clearStoredCredentials = async (): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(STORED_CREDENTIALS_KEY);
      setHasStoredCredentials(false);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error clearing credentials');
    }
  };

  // Authenticate with biometric and return stored credentials
  const authenticateWithBiometric = async (): Promise<StoredCredentials | null> => {
    try {
      setError(null);

      if (!hasStoredCredentials) {
        setError('No stored credentials found');
        return null;
      }

      if (!isAvailable || !isEnrolled || !isEnabled) {
        setError('Biometric authentication not available');
        return null;
      }

      const success = await authenticate('Access your saved credentials');
      
      if (success) {
        return await getStoredCredentials();
      } else {
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
      return null;
    }
  };

  // Initialize on hook mount
  useEffect(() => {
    checkStoredCredentials();
  }, []);

  return {
    // State
    hasStoredCredentials,
    loading,
    error,
    // Actions
    storeCredentials,
    getStoredCredentials,
    clearStoredCredentials,
    authenticateWithBiometric,
  };
};
