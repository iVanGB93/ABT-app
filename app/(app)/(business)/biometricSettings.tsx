import React, { useEffect, useState } from 'react';
import {
  View,
  Switch,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
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

export default function BiometricSettings() {
  const { color, darkTheme } = useSelector((state: RootState) => state.settings);
  const { userName, token, refreshToken } = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  const [storedUserInfo, setStoredUserInfo] = useState<{ username: string } | null>(null);
  
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
    getStoredUserInfo,
  } = useBiometricAuth();

  useEffect(() => {
    checkBiometricStatus();
    loadStoredUserInfo();
  }, []);

  const loadStoredUserInfo = async () => {
    if (hasStoredCredentials) {
      const userInfo = await getStoredUserInfo();
      setStoredUserInfo(userInfo);
    }
  };

  // Reload user info when credentials status changes
  useEffect(() => {
    loadStoredUserInfo();
  }, [hasStoredCredentials]);

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
      // Check if user is logged in and has credentials
      if (!userName || !token || !refreshToken) {
        Alert.alert('Error', 'You must be logged in to enable biometric authentication');
        return;
      }

      const credentials = {
        username: userName,
        password: '', // Add empty password since we're using token-based auth
        token: token,
        refreshToken: refreshToken,
      };

      const success = await enableBiometric(credentials);
      if (success) {
        Alert.alert('Success', 'Biometric login has been enabled successfully!');
        // Reload stored user info
        await loadStoredUserInfo();
      }
    }
  };

  const handleTestBiometric = async () => {
    const success = await authenticate('Test biometric authentication');
    if (success) {
      Alert.alert('Success', 'Biometric authentication successful!');
    }
  };

  const handleViewStoredCredentials = async () => {
    try {
      const credentials = await getStoredUserInfo();
      if (credentials) {
        Alert.alert(
          'Stored User Information',
          `Username: ${credentials.username}\n\nNote: Token details are encrypted and secure.`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('No Credentials', 'No stored credentials found.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to retrieve stored credentials.');
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

      {/* Show stored user info */}
      {isEnabled && hasStoredCredentials && storedUserInfo && (
        <ThemedSecondaryView style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Stored Account
          </ThemedText>
          <View style={styles.userInfoRow}>
            <View style={styles.userInfoIcon}>
              <Ionicons name="person-circle" size={24} color={color} />
            </View>
            <View style={styles.userInfoText}>
              <ThemedText type="defaultSemiBold">{storedUserInfo.username}</ThemedText>
              <ThemedText style={styles.userInfoSubtext}>
                This account will be used for biometric login
              </ThemedText>
            </View>
            {userName === storedUserInfo.username && (
              <Ionicons name="checkmark-circle" size={20} color="#51cf66" />
            )}
          </View>
          {userName !== storedUserInfo.username && (
            <View style={styles.warningContainer}>
              <Ionicons name="warning" size={16} color="#ff6b6b" />
              <ThemedText style={[styles.warningText, { marginLeft: 8 }]}>
                Different from current user ({userName})
              </ThemedText>
            </View>
          )}
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

      {/* View stored credentials button */}
      {isEnabled && hasStoredCredentials && (
        <TouchableOpacity
          style={[
            styles.testButton,
            { borderColor: '#007AFF', backgroundColor: darkTheme ? '#333' : '#f8f9fa' }
          ]}
          onPress={handleViewStoredCredentials}
        >
          <Ionicons name="information-circle" size={24} color="#007AFF" />
          <ThemedText style={{ marginLeft: 12, color: '#007AFF' }}>
            View Stored User Info
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
});
