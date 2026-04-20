import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  View,
  TouchableOpacity,
  Text,
  TextInput,
  ActivityIndicator,
  Image,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as LocalAuthentication from 'expo-local-authentication';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ThemedSecondaryView } from '@/components/ThemedSecondaryView';
import BiometricLogin from '@/components/BiometricLogin';
import { RootState, useAppDispatch } from '../(redux)/store';
import { authSuccess } from '../(redux)/authSlice';
import { commonStyles } from '@/constants/commonStyles';
import CustomAlert from '@/constants/customAlert';
import axiosInstance from '@/axios';
import { useBiometricAuth } from '@/hooks';
import {
  darkThirdColor,
  darkTextColor,
  darkTextSecondColor,
  lightMainColor,
  lightTextColor,
  version,
} from '@/settings';

interface Errors {
  username?: string;
  password?: string;
}

export default function Login() {
  const { color, darkTheme } = useSelector((state: RootState) => state.settings);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [errors, setErrors] = useState<Errors>({});
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [showBiometricOption, setShowBiometricOption] = useState(false);
  const [loginCredentials, setLoginCredentials] = useState<any>(null);
  const [enableBiometricAfterLogin, setEnableBiometricAfterLogin] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { isAvailable, isEnrolled, isEnabled, hasStoredCredentials, enableBiometric, disableBiometric } = useBiometricAuth();

  const validateForm = () => {
    let errors: Errors = {};
    if (!username) errors.username = 'Username is required!';
    if (!password) errors.password = 'Password is required!';
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      setLoading(true);
      
      try {
        const response = await axiosInstance.post('token/', { 
          username: username, 
          password: password 
        });
        
        if (response.data.access !== undefined) {
          const credentials = {
            username: username,
            password: password, // Add password for biometric fallback
            token: response.data.access,
            refreshToken: response.data.refresh,
          };
          
          dispatch(authSuccess(credentials));
          setLoading(false);
          
          // Check if we should offer biometric setup
          const shouldShowBiometricSetup = isAvailable && isEnrolled && 
            (enableBiometricAfterLogin || !isEnabled);
              
          if (shouldShowBiometricSetup) {
            // If user explicitly requested biometric (checkbox), enable directly
            if (enableBiometricAfterLogin) {
              setLoading(true); // Show loading while setting up biometric
              
              try {
                const success = await enableBiometric({
                  username: credentials.username,
                  refreshToken: credentials.refreshToken
                });                  setLoading(false);
                  
                  if (success) {
                    // Show brief success message and navigate
                    Alert.alert(
                      'Biometric Login Enabled!', 
                      'You can now use biometric authentication for quick login.',
                      [{ text: 'Great!', onPress: () => router.navigate('/(onboarding)') }]
                    );
                  } else {
                    Alert.alert(
                      'Setup Failed', 
                      'Could not enable biometric login. You can try again from Settings.',
                      [{ text: 'OK', onPress: () => router.navigate('/(onboarding)') }]
                    );
                  }
                } catch (error) {
                  setLoading(false);
                  console.error('Error enabling biometric:', error);
                  Alert.alert(
                    'Setup Error', 
                    'An error occurred while setting up biometric login.',
                    [{ text: 'OK', onPress: () => router.navigate('/(onboarding)') }]
                  );
                }
              } else {
                // Fallback: if bioauth is available but user didn't explicitly request it
                // (this might happen if !isEnabled but user didn't check box)
                Alert.alert(
                  "Enable Biometric Login?",
                  "Use your biometric authentication to login quickly and securely next time.",
                  [
                    { 
                      text: "Maybe Later", 
                      onPress: () => router.navigate('/(onboarding)')
                    },
                    { 
                      text: "Enable Now", 
                      onPress: async () => {
                        try {
                          const success = await enableBiometric({
                            username: credentials.username,
                            refreshToken: credentials.refreshToken
                          });
                          
                          if (success) {
                            Alert.alert('Success', '✅ Biometric login enabled successfully!');
                          } else {
                            Alert.alert('Error', '❌ Failed to enable biometric login.');
                          }
                        } catch (error) {
                          Alert.alert('Error', '❌ Error enabling biometric login.');
                        }
                        router.navigate('/(onboarding)');
                      }
                    }
                  ]
                );
              }
              
              // Keep the original modal setup for later debugging
              setLoginCredentials(credentials);
              setShowBiometricOption(true);
          } else {
            console.log('Navigating to onboarding');
            router.navigate('/(onboarding)');
          }
        } else {
          setError(response.data.message);
          setAlertVisible(true);
          setLoading(false);
        }
      } catch (error: any) {
        if (typeof error.response === 'undefined') {
          setError(
            'A server/network error occurred. ' +
              'Sorry about this - try again in a few minutes.',
          );
        } else {
          if (error.response.status === 401) {
            setError('Username or Password incorrect');
          } else {
            setError(error.message);
          }
        }
        setAlertVisible(true);
        setLoading(false);
      }
    }
  };  const handleBiometricSetupClose = () => {
    setShowBiometricOption(false);
    // Clear sensitive data from memory
    setLoginCredentials(null);
    router.navigate('/(onboarding)');
  };

  const handleBiometricSuccess = async (credentials: { username: string; refreshToken: string }) => {
    // Use the stored refresh token to obtain a new access token (no password stored)
    setLoading(true);
    
    try {
      const response = await axiosInstance.post('token/refresh/', {
        refresh: credentials.refreshToken,
      });
      
      if (response.data.access !== undefined) {
        const newRefreshToken = response.data.refresh ?? credentials.refreshToken;
        dispatch(authSuccess({
          username: credentials.username,
          token: response.data.access,
          refreshToken: newRefreshToken,
        }));
        setLoading(false);
        router.navigate('/(onboarding)');
      } else {
        // Refresh failed — disable biometric so the user re-enables after a fresh login
        await disableBiometric();
        setError('Biometric session expired. Please log in with your password.');
        setAlertVisible(true);
        setLoading(false);
      }
    } catch (error: any) {
      if (typeof error.response === 'undefined') {
        setError(
          'A server/network error occurred. ' +
            'Sorry about this - try again in a few minutes.',
        );
      } else {
        if (error.response.status === 401) {
          // Invalid credentials - disable biometric auth
          await disableBiometric();
          setError('Stored biometric credentials are invalid. Biometric authentication has been disabled. Please login manually.');
        } else {
          setError(error.message);
        }
      }
      setAlertVisible(true);
      setLoading(false);
    }
  };

  const handleBiometricError = async (error: string) => {
    // If the error indicates invalid credentials, disable biometric auth
    if (error.includes('invalid') || 
        error.includes('incorrect') || 
        error.includes('failed') ||
        error.includes('expired') ||
        error.toLowerCase().includes('credential')) {
      
      // Clear stored biometric credentials
      await disableBiometric();
      
      // Update error message to be more informative
      setError('Stored biometric credentials are no longer valid. Please login manually to re-enable biometric authentication.');
    } else {
      setError(error);
    }
    
    setAlertVisible(true);
  };

  return (
    <ThemedView style={commonStyles.container}>
      <View style={commonStyles.header}>
        <Image style={commonStyles.imageCircle} source={require('../../assets/images/logo.png')} />
        <ThemedText type="title" style={commonStyles.text_header}>
          Welcome!
        </ThemedText>
        <ThemedText type="subtitle" style={commonStyles.sub_text_header}>
          Advance Business Tools
        </ThemedText>
      </View>
      <ThemedSecondaryView style={[commonStyles.footer, { borderColor: color }]}>
        <ScrollView keyboardShouldPersistTaps="handled">
          <ThemedText style={commonStyles.text_action} type="subtitle">
            Username
          </ThemedText>
          <View
            style={[commonStyles.action, { borderBottomColor: darkTheme ? '#f2f2f2' : '#000' }]}
          >
            <Ionicons name="person" color={darkTheme ? darkTextColor : lightTextColor} size={18} />
            <TextInput
              onChangeText={text => setUsername(text.replace(/\s+$/, ''))}
              value={username}
              placeholder="type your username..."
              placeholderTextColor={darkTheme ? darkTextSecondColor : lightTextColor}
              style={[
                commonStyles.textInput,
                { color: darkTheme ? darkTextColor : lightTextColor },
              ]}
            />
            {username ? <Ionicons name="checkmark-circle-outline" color={color} /> : null}
          </View>
          {errors.username ? <Text style={commonStyles.errorMsg}>{errors.username}</Text> : null}
          <ThemedText style={commonStyles.text_action} type="subtitle">
            Password
          </ThemedText>
          <View
            style={[commonStyles.action, { borderBottomColor: darkTheme ? '#f2f2f2' : '#000' }]}
          >
            <Ionicons
              name="lock-closed"
              color={darkTheme ? darkTextColor : lightTextColor}
              size={18}
            />
            <TextInput
              onChangeText={setPassword}
              value={password}
              placeholder="type your password..."
              placeholderTextColor={darkTheme ? darkTextSecondColor : lightTextColor}
              secureTextEntry={secureTextEntry ? true : false}
              style={[
                commonStyles.textInput,
                { color: darkTheme ? darkTextColor : lightTextColor },
              ]}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setSecureTextEntry(!secureTextEntry)}>
              {secureTextEntry ? (
                <Ionicons
                  size={20}
                  name="eye-off-outline"
                  color={darkTheme ? darkTextColor : lightTextColor}
                />
              ) : (
                <Ionicons
                  size={20}
                  name="eye-outline"
                  color={darkTheme ? darkTextColor : lightTextColor}
                />
              )}
            </TouchableOpacity>
          </View>
          {errors.password ? <Text style={commonStyles.errorMsg}>{errors.password}</Text> : null}
          {loading ? (
            <ActivityIndicator style={[commonStyles.loading, { marginTop: 50 }]} size="large" color={color} />
          ) : (
            <>
              {/* Biometric Authentication Section */}
              {isAvailable && isEnrolled && hasStoredCredentials && (
                <BiometricLogin
                  onSuccess={handleBiometricSuccess}
                  onError={handleBiometricError}
                  showPrompt={false} // Don't auto-prompt, let user choose
                />
              )}

              {/* Checkbox to enable biometric after login if no credentials exist */}
              {isAvailable && isEnrolled && !hasStoredCredentials && (
                <View style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  marginTop: 20,
                  marginBottom: 10,
                  paddingHorizontal: 5 
                }}>
                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      flex: 1,
                    }}
                    onPress={() => {
                      setEnableBiometricAfterLogin(!enableBiometricAfterLogin);
                    }}
                  >
                    <View style={{
                      width: 24,
                      height: 24,
                      borderRadius: 4,
                      borderWidth: 2,
                      borderColor: color,
                      backgroundColor: enableBiometricAfterLogin ? color : 'transparent',
                      marginRight: 12,
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}>
                      {enableBiometricAfterLogin && (
                        <Ionicons name="checkmark" size={16} color="#fff" />
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <ThemedText type="subtitle" style={{ fontSize: 16 }}>
                        Enable biometric login
                      </ThemedText>
                      <ThemedText style={{ 
                        fontSize: 12, 
                        opacity: 0.7,
                        marginTop: 2
                      }}>
                        Use biometric authentication for quick access
                      </ThemedText>
                    </View>
                  </TouchableOpacity>
                  <Ionicons 
                    name="finger-print" 
                    size={24} 
                    color={color} 
                    style={{ opacity: enableBiometricAfterLogin ? 1 : 0.5 }} 
                  />
                </View>
              )}

              <TouchableOpacity
                style={[
                  commonStyles.button,
                  {
                    borderColor: color,
                    marginTop: 40,
                    backgroundColor: darkTheme ? darkThirdColor : lightMainColor,
                  },
                ]}
                onPress={handleSubmit}
              >
                <ThemedText type="subtitle">Login</ThemedText>
              </TouchableOpacity>
              <View style={commonStyles.linkSection}>
                <ThemedText type="subtitle">I'm new, </ThemedText>
                <TouchableOpacity onPress={() => router.navigate('/(auth)/register')}>
                  <ThemedText type="subtitle" style={{ color: color }}>
                    {' '}
                    create account!!
                  </ThemedText>
                </TouchableOpacity>
              </View>
              <View style={commonStyles.linkSection}>
                <TouchableOpacity onPress={() => router.navigate('/(auth)/forgotPassword')}>
                  <ThemedText type="subtitle" style={{ color: color }}>
                    Forgot your password?
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>
        <ThemedText style={{ position: 'absolute', bottom: 5, right: 5 }}>{version}</ThemedText>
      </ThemedSecondaryView>
      <CustomAlert
        title="Login error"
        visible={alertVisible}
        message={error}
        onClose={() => setAlertVisible(false)}
      />
      
      {/* Biometric Setup Option - Simple approach */}
      {loginCredentials && showBiometricOption && (
        <Modal
          visible={showBiometricOption}
          transparent
          animationType="fade"
          onRequestClose={handleBiometricSetupClose}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
            <ThemedSecondaryView style={{ borderRadius: 20, padding: 24, width: '100%', maxWidth: 400, alignItems: 'center', borderColor: color, borderWidth: 2 }}>
              <Ionicons name="finger-print" size={64} color={color} style={{ marginBottom: 16 }} />
              <ThemedText type="title" style={{ textAlign: 'center', marginBottom: 12 }}>
                Enable Biometric Login?
              </ThemedText>
              <ThemedText style={{ textAlign: 'center', marginBottom: 24, opacity: 0.8 }}>
                Use your biometric authentication to login quickly and securely next time.
              </ThemedText>
              
              <View style={{ width: '100%', gap: 12 }}>
                <TouchableOpacity
                  style={[commonStyles.button, { backgroundColor: color, borderColor: color }]}
                  onPress={async () => {
                    try {
                      const success = await enableBiometric({
                        username: loginCredentials.username,
                        refreshToken: loginCredentials.refreshToken
                      });
                      
                      handleBiometricSetupClose();
                      
                      if (success) {
                        setError('✅ Biometric login enabled successfully!');
                      } else {
                        setError('❌ Failed to enable biometric login. Try again later.');
                      }
                      setAlertVisible(true);
                    } catch (error) {
                      handleBiometricSetupClose();
                      setError('❌ Error enabling biometric login.');
                      setAlertVisible(true);
                    }
                  }}
                >
                  <ThemedText type="subtitle" style={{ color: '#fff' }}>Enable Now</ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[commonStyles.button, { backgroundColor: 'transparent', borderColor: darkTheme ? '#666' : '#ccc', borderWidth: 1 }]}
                  onPress={handleBiometricSetupClose}
                >
                  <ThemedText type="subtitle">Maybe Later</ThemedText>
                </TouchableOpacity>
              </View>
            </ThemedSecondaryView>
          </View>
        </Modal>
      )}
    </ThemedView>
  );
}
