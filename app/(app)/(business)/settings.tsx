import React, { useEffect, useState } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  Modal,
  Linking,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useAppDispatch, RootState } from '@/app/(redux)/store';
import { setBusiness, setError, setProfile } from '@/app/(redux)/settingSlice';
import { authLogout } from '@/app/(redux)/authSlice';
import { darkSecondColor, darkTextColor, lightSecondColor, lightTextColor } from '@/settings';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { commonStyles } from '@/constants/commonStyles';
import { ThemedSecondaryView } from '@/components/ThemedSecondaryView';
import axiosInstance from '@/axios';

export default function Settings() {
  const { color, darkTheme, business, profile } = useSelector((state: RootState) => state.settings);
  const { userName } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(false);
  const [contactModalVisible, setContactModalVisible] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleLogout = async () => {
    dispatch(setBusiness({}));
    dispatch(authLogout());
    router.replace('/(auth)/login');
  };

  const getProfile = async () => {
    await axiosInstance
      .get(`user/account/${userName}/`)
      .then(function (response) {
        if (response.data) {
          dispatch(setProfile(response.data));
        } else {
          dispatch(setError(response.data.message));
        }
        setLoading(false);
      })
      .catch(function (error) {
        console.error('Error fetching profile:', error);
        try {
          const message = error.data.message;
          dispatch(setError(message));
        } catch (e) {
          dispatch(setError('Error getting your profile.'));
        }
        setLoading(false);
      });
  };

  useEffect(() => {
    setLoading(true);
    getProfile();
  }, []);

  const SettingItem = ({ 
    icon, 
    title, 
    onPress, 
    showChevron = true,
    isDestructive = false 
  }: {
    icon: string;
    title: string;
    onPress: () => void;
    showChevron?: boolean;
    isDestructive?: boolean;
  }) => (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: darkTheme ? '#333' : '#f0f0f0',
      }}
      onPress={onPress}
    >
      <Ionicons
        name={icon as any}
        size={24}
        color={isDestructive ? '#ff4444' : (darkTheme ? darkTextColor : lightTextColor)}
        style={{ marginRight: 16 }}
      />
      <ThemedText 
        style={{ 
          flex: 1, 
          fontSize: 16,
          color: isDestructive ? '#ff4444' : (darkTheme ? darkTextColor : lightTextColor)
        }}
      >
        {title}
      </ThemedText>
      {showChevron && (
        <Ionicons
          name="chevron-forward"
          size={20}
          color={darkTheme ? '#666' : '#999'}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <ThemedView style={commonStyles.container}>
      <View style={commonStyles.tabHeader}>
        <ThemedText type="subtitle">Settings</ThemedText>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={color} />
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <ActivityIndicator style={commonStyles.containerCentered} size="large" color={color} />
      ) : (
        <ScrollView style={{ flex: 1 }}>
          {/* Business Settings */}
          <ThemedSecondaryView style={{
            margin: 16,
            marginTop: 8,
            borderRadius: 12,
            overflow: 'hidden',
          }}>
            <View style={{ padding: 8 }}>
              <ThemedText 
                style={{ 
                  fontSize: 18,
                  fontWeight: '600',
                  marginBottom: 8,
                  marginLeft: 8,
                  color: color
                }}
              >
                Business
              </ThemedText>
              <SettingItem
                icon="business"
                title="Business Information"
                onPress={() => router.push('/(app)/(business)/businessSettings')}
              />
              <SettingItem
                icon="card"
                title="Payment Methods"
                onPress={() => router.navigate('/(app)/(business)/(paymentMethods)')}
              />
              <SettingItem
                icon="person-circle"
                title="Profile Settings"
                onPress={() => router.push('/(app)/(business)/profileEdit')}
              />
            </View>
          </ThemedSecondaryView>

          {/* App Settings */}
          <ThemedSecondaryView style={{
            margin: 16,
            marginTop: 8,
            borderRadius: 12,
            overflow: 'hidden',
          }}>
            <View style={{ padding: 8 }}>
              <ThemedText 
                style={{ 
                  fontSize: 18,
                  fontWeight: '600',
                  marginBottom: 8,
                  marginLeft: 8,
                  color: color
                }}
              >
                App Settings
              </ThemedText>
              <SettingItem
                icon="color-palette"
                title="Theme & Style"
                onPress={() => router.push('/(app)/(business)/styleSettings')}
              />
              <SettingItem
                icon="finger-print"
                title="Biometric Authentication"
                onPress={() => router.push('/(app)/(business)/biometricSettings')}
              />
            </View>
          </ThemedSecondaryView>

          {/* Support & Info */}
          <ThemedSecondaryView style={{
            margin: 16,
            marginTop: 8,
            borderRadius: 12,
            overflow: 'hidden',
          }}>
            <View style={{ padding: 8 }}>
              <ThemedText 
                style={{ 
                  fontSize: 18,
                  fontWeight: '600',
                  marginBottom: 8,
                  marginLeft: 8,
                  color: color
                }}
              >
                Support
              </ThemedText>
              <SettingItem
                icon="help-circle"
                title="Contact Support"
                onPress={() => setContactModalVisible(true)}
              />
              <SettingItem
                icon="document-text"
                title="Privacy Policy"
                onPress={() => {/* TODO: Add privacy policy */}}
              />
            </View>
          </ThemedSecondaryView>

          {/* Logout */}
          <ThemedSecondaryView style={{
            margin: 16,
            marginTop: 8,
            marginBottom: 32,
            borderRadius: 12,
            overflow: 'hidden',
          }}>
            <View style={{ padding: 8 }}>
              <SettingItem
                icon="log-out"
                title="Logout"
                onPress={handleLogout}
                showChevron={false}
                isDestructive={true}
              />
            </View>
          </ThemedSecondaryView>

          {/* Contact Modal */}
          <Modal
            visible={contactModalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setContactModalVisible(false)}
          >
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(0,0,0,0.5)',
              }}
            >
              <ThemedSecondaryView
                style={{
                  padding: 24,
                  borderRadius: 16,
                  marginHorizontal: 20,
                  minWidth: 280,
                  alignItems: 'center',
                }}
              >
                <ThemedText 
                  type="title" 
                  style={{ 
                    textAlign: 'center', 
                    marginBottom: 16,
                    fontSize: 20
                  }}
                >
                  Contact Support
                </ThemedText>
                <ThemedText 
                  style={{ 
                    textAlign: 'center', 
                    marginBottom: 20,
                    lineHeight: 22
                  }}
                >
                  For questions, suggestions, feedback or bugs, please contact:
                </ThemedText>
                
                <View style={{ width: '100%', marginBottom: 12 }}>
                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 12,
                      backgroundColor: darkTheme ? '#333' : '#f5f5f5',
                      borderRadius: 8,
                      marginBottom: 8,
                    }}
                    onPress={() => Linking.openURL(`tel:+17866129974`)}
                  >
                    <Ionicons name="call" size={20} color={color} style={{ marginRight: 12 }} />
                    <ThemedText style={{ color: color, fontSize: 16 }}>
                      +1 786-612-9974
                    </ThemedText>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 12,
                      backgroundColor: darkTheme ? '#333' : '#f5f5f5',
                      borderRadius: 8,
                    }}
                    onPress={() => Linking.openURL(`mailto:admin@qbared.com`)}
                  >
                    <Ionicons name="mail" size={20} color={color} style={{ marginRight: 12 }} />
                    <ThemedText style={{ color: color, fontSize: 16 }}>
                      admin@qbared.com
                    </ThemedText>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={{
                    backgroundColor: color,
                    paddingHorizontal: 24,
                    paddingVertical: 12,
                    borderRadius: 8,
                    marginTop: 8,
                  }}
                  onPress={() => setContactModalVisible(false)}
                >
                  <ThemedText style={{ color: '#fff', fontWeight: '600' }}>
                    Close
                  </ThemedText>
                </TouchableOpacity>
              </ThemedSecondaryView>
            </View>
          </Modal>
        </ScrollView>
      )}
    </ThemedView>
  );
}
