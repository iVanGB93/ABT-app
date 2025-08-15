import React, { useEffect, useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Vibration,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { RootState } from '@/app/(redux)/store';
import { useBiometricAuth } from '@/hooks/useBiometricAuth';

interface StoredCredentials {
  username: string;
  token: string;
  refreshToken: string;
}

interface BiometricLoginProps {
  onSuccess: (credentials: StoredCredentials) => void;
  onError?: (error: string) => void;
  showPrompt?: boolean;
}

export default function BiometricLogin({ 
  onSuccess, 
  onError, 
  showPrompt = true 
}: BiometricLoginProps) {
  const { color, darkTheme } = useSelector((state: RootState) => state.settings);
  const {
    isAvailable,
    isEnrolled,
    isEnabled,
    hasStoredCredentials,
    supportedTypes,
    authenticateAndGetCredentials,
    error,
  } = useBiometricAuth();

  const [animatedValue] = useState(new Animated.Value(1));
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Auto-trigger biometric authentication when component mounts if conditions are met
  useEffect(() => {
    if (isAvailable && isEnrolled && isEnabled && hasStoredCredentials && showPrompt) {
      handleBiometricLogin();
    }
  }, [isAvailable, isEnrolled, isEnabled, hasStoredCredentials, showPrompt]);

  // Handle error reporting
  useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  };

  const stopPulseAnimation = () => {
    animatedValue.stopAnimation();
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const handleBiometricLogin = async () => {
    if (!isAvailable || !isEnrolled || !isEnabled || !hasStoredCredentials) {
      onError && onError('Biometric authentication not available or not set up');
      return;
    }

    try {
      setIsAuthenticating(true);
      startPulseAnimation();

      const credentials = await authenticateAndGetCredentials('Login with biometric authentication');
      
      if (credentials) {
        Vibration.vibrate(50);
        onSuccess(credentials);
      } else {
        Vibration.vibrate([100, 50, 100]);
      }
    } catch (err: any) {
      Vibration.vibrate([100, 50, 100]);
      onError && onError(err.message || 'Authentication failed');
    } finally {
      setIsAuthenticating(false);
      stopPulseAnimation();
    }
  };

  const getBiometricIcon = () => {
    if (supportedTypes.includes(1)) { // FINGERPRINT
      return 'finger-print';
    } else if (supportedTypes.includes(2)) { // FACIAL_RECOGNITION
      return 'scan';
    } else {
      return 'shield-checkmark';
    }
  };

  const getBiometricLabel = () => {
    if (supportedTypes.includes(1)) {
      return 'Login with Fingerprint';
    } else if (supportedTypes.includes(2)) {
      return 'Login with Face Recognition';
    } else {
      return 'Login with Biometric';
    }
  };

  // Don't render if biometric is not available or not enabled or no stored credentials
  if (!isAvailable || !isEnrolled || !isEnabled || !hasStoredCredentials) {
    return null;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.biometricButton,
          { 
            borderColor: color,
            backgroundColor: darkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
          }
        ]}
        onPress={handleBiometricLogin}
        disabled={isAuthenticating}
        activeOpacity={0.7}
      >
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [{ scale: animatedValue }],
            },
          ]}
        >
          <Ionicons
            name={getBiometricIcon()}
            size={32}
            color={isAuthenticating ? color : (darkTheme ? '#fff' : '#000')}
          />
        </Animated.View>
        <ThemedText style={[styles.buttonText, { marginTop: 8 }]}>
          {isAuthenticating ? 'Authenticating...' : getBiometricLabel()}
        </ThemedText>
      </TouchableOpacity>

      {/* Quick access button - minimal version */}
      <TouchableOpacity
        style={[
          styles.quickButton,
          { backgroundColor: color }
        ]}
        onPress={handleBiometricLogin}
        disabled={isAuthenticating}
      >
        <Ionicons
          name={getBiometricIcon()}
          size={20}
          color="#fff"
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 16,
  },
  biometricButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 12,
    minWidth: 200,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  quickButton: {
    position: 'absolute',
    right: -60,
    top: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
