import React, { useEffect, useState } from 'react';
import {
  View,
  Switch,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { RootState } from '@/app/(redux)/store';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ThemedSecondaryView } from '@/components/ThemedSecondaryView';
import { useBiometricAuth } from '@/hooks/useBiometricAuth';
import { commonStyles } from '@/constants/commonStyles';
import { useRouter } from 'expo-router';
import axiosInstance from '@/axios';

export default function BiometricSettings() {
  const { color, darkTheme } = useSelector((state: RootState) => state.settings);
  const { userName } = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  
  // Password confirmation modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  
  const {
    isAvailable,
    isEnrolled,
    supportedTypes,
    isEnabled,
    hasStoredCredentials,
    loading,
    error,
    authenticate,
    enableBiometric,
    disableBiometric,
    checkBiometricStatus,
    getBiometricTypeNames,
  } = useBiometricAuth();

  useEffect(() => {
    checkBiometricStatus();
  }, []);

  const handleToggleBiometric = async () => {
    if (isEnabled) {
      Alert.alert(
        'Disable Biometric Login',
        'Are you sure you want to disable biometric login?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disable',
            style: 'destructive',
            onPress: async () => {
              await disableBiometric();
            },
          },
        ]
      );
    } else {
      // Check if user is logged in
      if (!userName) {
        Alert.alert('Error', 'You must be logged in to enable biometric authentication');
        return;
      }

      // Show password confirmation modal
      setShowPasswordModal(true);
    }
  };

  const handlePasswordConfirmation = async () => {
    if (!confirmPassword) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    setIsConfirming(true);
    try {
      // Verify password by making a login request
      const response = await axiosInstance.post('token/', {
        username: userName,
        password: confirmPassword
      });

      if (response.data.access) {
        // Password is correct, enable biometric
        const credentials = {
          username: userName!, // Non-null assertion since we checked above
          password: confirmPassword,
        };

        const success = await enableBiometric(credentials);
        if (success) {
          Alert.alert('Success', 'Biometric login has been enabled successfully!');
          setShowPasswordModal(false);
          setConfirmPassword('');
        }
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        Alert.alert('Error', 'Invalid password. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to verify password. Please try again.');
      }
    } finally {
      setIsConfirming(false);
    }
  };

  const handleTestBiometric = async () => {
    const success = await authenticate('Test biometric authentication');
    if (success) {
      Alert.alert('Success', 'Biometric authentication successful!');
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

  const getStatusColor = () => {
    if (!isAvailable || !isEnrolled) return '#ff6b6b';
    if (isEnabled) return '#51cf66';
    return '#ffd43b';
  };

  const getStatusText = () => {
    if (!isAvailable) return 'Not Available';
    if (!isEnrolled) return 'Not Enrolled';
    if (isEnabled && hasStoredCredentials) return 'Enabled';
    if (isEnabled && !hasStoredCredentials) return 'Enabled (No Credentials)';
    return 'Disabled';
  };

  if (loading) {
    return (
      <ThemedView style={[commonStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={color} />
        <ThemedText style={{ marginTop: 16 }}>Checking biometric availability...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={commonStyles.container}>
        <ThemedView style={commonStyles.tabHeader}>
            <TouchableOpacity
            onPress={() => {
                router.back();
            }}
            >
            <Ionicons name="arrow-back" size={24} color={darkTheme ? '#fff' : '#000'} />
            </TouchableOpacity>
            <ThemedText type="subtitle">Biometric Authentication</ThemedText>
            <ThemedText type="subtitle"></ThemedText>
        </ThemedView>

      <ThemedSecondaryView style={styles.section}>
        <View style={styles.statusRow}>
          <View style={styles.iconContainer}>
            <Ionicons 
              name={getBiometricIcon()} 
              size={32} 
              color={getStatusColor()} 
            />
          </View>
          <View style={styles.statusInfo}>
            <ThemedText type="defaultSemiBold">Status</ThemedText>
            <ThemedText style={{ color: getStatusColor() }}>
              {getStatusText()}
            </ThemedText>
          </View>
        </View>
      </ThemedSecondaryView>

      {error && (
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </View>
      )}

      {isAvailable && (
        <ThemedSecondaryView style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Available Methods
          </ThemedText>
          {getBiometricTypeNames().map((type: string, index: number) => (
            <View key={index} style={styles.methodRow}>
              <Ionicons 
                name="checkmark-circle" 
                size={20} 
                color="#51cf66" 
              />
              <ThemedText style={styles.methodText}>{type}</ThemedText>
            </View>
          ))}
        </ThemedSecondaryView>
      )}

      {/* Show current user */}
      {isEnabled && hasStoredCredentials && (
        <ThemedSecondaryView style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Biometric Login Active
          </ThemedText>
          <View style={styles.userInfoRow}>
            <View style={styles.userInfoIcon}>
              <Ionicons name="person-circle" size={24} color={color} />
            </View>
            <View style={styles.userInfoText}>
              <ThemedText type="defaultSemiBold">{userName}</ThemedText>
              <ThemedText style={styles.userInfoSubtext}>
                Biometric login is enabled for this account
              </ThemedText>
            </View>
            <Ionicons name="checkmark-circle" size={20} color="#51cf66" />
          </View>
        </ThemedSecondaryView>
      )}

      {isAvailable && isEnrolled && (
        <ThemedSecondaryView style={styles.section}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <ThemedText type="defaultSemiBold">Enable Biometric Login</ThemedText>
              <ThemedText style={styles.settingDescription}>
                Use your {getBiometricTypeNames().join(' or ').toLowerCase()} to login quickly
              </ThemedText>
            </View>
            <Switch
              trackColor={{ false: '#767577', true: color }}
              thumbColor={isEnabled ? '#ffffff' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={handleToggleBiometric}
              value={isEnabled}
            />
          </View>
        </ThemedSecondaryView>
      )}

      {isAvailable && isEnrolled && (
        <TouchableOpacity
          style={[
            styles.testButton,
            { borderColor: color, backgroundColor: darkTheme ? '#333' : '#f8f9fa' }
          ]}
          onPress={handleTestBiometric}
        >
          <Ionicons name="play-circle" size={24} color={color} />
          <ThemedText style={{ marginLeft: 12, color }}>
            Test Biometric Authentication
          </ThemedText>
        </TouchableOpacity>
      )}

      {!isAvailable && (
        <ThemedSecondaryView style={styles.section}>
          <View style={styles.infoContainer}>
            <Ionicons name="information-circle" size={24} color="#ffd43b" />
            <ThemedText style={styles.infoText}>
              Biometric authentication is not available on this device.
            </ThemedText>
          </View>
        </ThemedSecondaryView>
      )}

      {isAvailable && !isEnrolled && (
        <ThemedSecondaryView style={styles.section}>
          <View style={styles.infoContainer}>
            <Ionicons name="warning" size={24} color="#ff6b6b" />
            <ThemedText style={styles.infoText}>
              No biometric credentials are enrolled on this device. Please set up fingerprint or face recognition in your device settings.
            </ThemedText>
          </View>
        </ThemedSecondaryView>
      )}
      
      {/* Password Confirmation Modal */}
      <Modal
        visible={showPasswordModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowPasswordModal(false);
          setConfirmPassword('');
        }}
      >
        <View style={styles.modalOverlay}>
          <ThemedSecondaryView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Ionicons name={getBiometricIcon()} size={48} color={color} />
              <ThemedText type="title" style={styles.modalTitle}>
                Enable Biometric Login
              </ThemedText>
              <ThemedText style={styles.modalDescription}>
                Please confirm your password to enable {getBiometricTypeNames().join(' or ').toLowerCase()} login
              </ThemedText>
            </View>

            <View style={styles.passwordInputContainer}>
              <ThemedText style={styles.inputLabel}>Current Password</ThemedText>
              <View style={[styles.passwordInput, { borderColor: darkTheme ? '#444' : '#ddd' }]}>
                <Ionicons 
                  name="lock-closed" 
                  size={20} 
                  color={darkTheme ? '#888' : '#666'} 
                />
                <TextInput
                  style={[
                    styles.textInput,
                    { color: darkTheme ? '#fff' : '#000' }
                  ]}
                  placeholder="Enter your password"
                  placeholderTextColor={darkTheme ? '#888' : '#666'}
                  secureTextEntry={secureTextEntry}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  autoCapitalize="none"
                  autoFocus
                />
                <TouchableOpacity onPress={() => setSecureTextEntry(!secureTextEntry)}>
                  <Ionicons
                    name={secureTextEntry ? 'eye-off' : 'eye'}
                    size={20}
                    color={darkTheme ? '#888' : '#666'}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowPasswordModal(false);
                  setConfirmPassword('');
                }}
                disabled={isConfirming}
              >
                <ThemedText>Cancel</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.confirmButton,
                  { backgroundColor: color }
                ]}
                onPress={handlePasswordConfirmation}
                disabled={isConfirming || !confirmPassword}
              >
                {isConfirming ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <ThemedText style={{ color: '#fff' }}>Confirm</ThemedText>
                )}
              </TouchableOpacity>
            </View>
          </ThemedSecondaryView>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  section: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 16,
  },
  statusInfo: {
    flex: 1,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  methodText: {
    marginLeft: 8,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    lineHeight: 20,
  },
  errorContainer: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 12,
    backgroundColor: '#ff6b6b',
    borderRadius: 8,
  },
  errorText: {
    color: '#ffffff',
    textAlign: 'center',
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userInfoIcon: {
    marginRight: 12,
  },
  userInfoText: {
    flex: 1,
  },
  userInfoSubtext: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 2,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 8,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 6,
  },
  warningText: {
    fontSize: 12,
    color: '#ff6b6b',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  modalDescription: {
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 20,
  },
  passwordInputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  passwordInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  confirmButton: {
    // backgroundColor set dynamically
  },
});
