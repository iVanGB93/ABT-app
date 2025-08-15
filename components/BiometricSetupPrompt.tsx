import React, { useState } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedSecondaryView } from '@/components/ThemedSecondaryView';
import { RootState } from '@/app/(redux)/store';
import { useBiometricAuth } from '@/hooks/useBiometricAuth';

interface BiometricSetupPromptProps {
  visible: boolean;
  onClose: () => void;
  credentials: {
    username: string;
    token: string;
    refreshToken: string;
  };
}

export default function BiometricSetupPrompt({ 
  visible, 
  onClose, 
  credentials 
}: BiometricSetupPromptProps) {
  const { color, darkTheme } = useSelector((state: RootState) => state.settings);
  const [isSettingUp, setIsSettingUp] = useState(false);
  
  const {
    isAvailable,
    isEnrolled,
    supportedTypes,
    enableBiometric,
    getBiometricTypeNames,
  } = useBiometricAuth();

  const getBiometricIcon = () => {
    if (supportedTypes.includes(1)) { // FINGERPRINT
      return 'finger-print';
    } else if (supportedTypes.includes(2)) { // FACIAL_RECOGNITION
      return 'scan';
    } else {
      return 'shield-checkmark';
    }
  };

  const handleSetupBiometric = async () => {
    setIsSettingUp(true);
    try {
      const success = await enableBiometric(credentials);
      if (success) {
        Alert.alert(
          'Success!', 
          'Biometric login has been enabled. You can now use your ' + 
          getBiometricTypeNames().join(' or ').toLowerCase() + 
          ' to login quickly.',
          [{ text: 'Great!', onPress: onClose }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to enable biometric authentication. You can try again later in Settings.');
    } finally {
      setIsSettingUp(false);
    }
  };

  // Don't show if biometric is not available
  if (!isAvailable || !isEnrolled) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <ThemedSecondaryView style={styles.container}>
          <View style={styles.iconContainer}>
            <Ionicons 
              name={getBiometricIcon()} 
              size={64} 
              color={color} 
            />
          </View>
          
          <ThemedText type="title" style={styles.title}>
            Enable Quick Login?
          </ThemedText>
          
          <ThemedText style={styles.description}>
            Use your {getBiometricTypeNames().join(' or ').toLowerCase()} to login quickly and securely next time.
          </ThemedText>

          <View style={styles.features}>
            <View style={styles.feature}>
              <Ionicons name="flash" size={20} color="#51cf66" />
              <ThemedText style={styles.featureText}>Faster login</ThemedText>
            </View>
            <View style={styles.feature}>
              <Ionicons name="shield-checkmark" size={20} color="#51cf66" />
              <ThemedText style={styles.featureText}>Secure authentication</ThemedText>
            </View>
            <View style={styles.feature}>
              <Ionicons name="phone-portrait" size={20} color="#51cf66" />
              <ThemedText style={styles.featureText}>No passwords to remember</ThemedText>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.button,
                styles.primaryButton,
                { backgroundColor: color }
              ]}
              onPress={handleSetupBiometric}
              disabled={isSettingUp}
            >
              <ThemedText style={[styles.buttonText, { color: '#fff' }]}>
                {isSettingUp ? 'Setting up...' : 'Enable Biometric Login'}
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.secondaryButton,
                { borderColor: darkTheme ? '#666' : '#ccc' }
              ]}
              onPress={onClose}
              disabled={isSettingUp}
            >
              <ThemedText style={styles.buttonText}>
                Maybe Later
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedSecondaryView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
    opacity: 0.8,
  },
  features: {
    marginBottom: 32,
    width: '100%',
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    marginLeft: 12,
    fontSize: 16,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButton: {
    // backgroundColor set dynamically
  },
  secondaryButton: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
