import React, { useEffect, useState } from 'react';
import {
  Text,
  View,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Image,
  ScrollView,
  Modal,
  Linking,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { useAppDispatch, RootState } from '@/app/(redux)/store';
import { setBusiness, setError, setProfile } from '@/app/(redux)/settingSlice';
import { authLogout } from '@/app/(redux)/authSlice';
import { darkSecondColor, darkTextColor, lightSecondColor, lightTextColor } from '@/settings';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { commonStyles } from '@/constants/commonStyles';
import { useRouter } from 'expo-router';
import { ThemedSecondaryView } from '@/components/ThemedSecondaryView';
import { commonStylesCards } from '@/constants/commonStylesCard';
import axiosInstance from '@/axios';
import { StatusBar } from 'expo-status-bar';

export default function Profile() {
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

  return (
    <>
      <ThemedView style={commonStyles.container}>
        <View style={commonStyles.tabHeader}>
        </View>
        {loading ? (
          <ActivityIndicator style={commonStyles.containerCentered} size="large" color={color} />
        ) : (
          <ScrollView>
            <View style={styles.rowContainerLast}>
              <Image
                source={{ uri: business.logo }}
                style={[styles.image, { borderColor: color }]}
              />
              <View style={styles.info}>
                <ThemedText type="title">{userName}</ThemedText>
                <ThemedText type="subtitle">{business.name}</ThemedText>
              </View>
            </View>
            <ThemedSecondaryView style={styles.sectionContainer}>
              <View style={styles.rowContainer}>
                <Text
                  style={[styles.optionText, { color: darkTheme ? darkTextColor : lightTextColor }]}
                >
                  <Ionicons
                    style={[
                      styles.optionText,
                      { color: darkTheme ? darkTextColor : lightTextColor },
                    ]}
                    name="person-circle-outline"
                  />{' '}
                  Username
                </Text>
                <Text
                  style={[
                    styles.optionTextRight,
                    { color: darkTheme ? darkTextColor : lightTextColor },
                  ]}
                >
                  {userName}
                </Text>
              </View>
              <View style={styles.rowContainer}>
                <Text
                  style={[styles.optionText, { color: darkTheme ? darkTextColor : lightTextColor }]}
                >
                  <Ionicons
                    style={[
                      styles.optionText,
                      { color: darkTheme ? darkTextColor : lightTextColor },
                    ]}
                    name="mail-outline"
                  />{' '}
                  Email
                </Text>
                <Text
                  style={[
                    styles.optionTextRight,
                    { color: darkTheme ? darkTextColor : lightTextColor },
                  ]}
                >
                  {profile.email ? profile.email : 'no email saved'}
                </Text>
              </View>
              <View style={styles.rowContainer}>
                <Text
                  style={[styles.optionText, { color: darkTheme ? darkTextColor : lightTextColor }]}
                >
                  <Ionicons
                    style={[
                      styles.optionText,
                      { color: darkTheme ? darkTextColor : lightTextColor },
                    ]}
                    name="call-outline"
                  />{' '}
                  Phone
                </Text>
                <Text
                  style={[
                    styles.optionTextRight,
                    { color: darkTheme ? darkTextColor : lightTextColor },
                  ]}
                >
                  {profile.phone ? profile.phone : 'no phone saved'}
                </Text>
              </View>
              <View style={styles.rowContainer}>
                <Text
                  style={[styles.optionText, { color: darkTheme ? darkTextColor : lightTextColor }]}
                >
                  <Ionicons
                    style={[
                      styles.optionText,
                      { color: darkTheme ? darkTextColor : lightTextColor },
                    ]}
                    name="location-outline"
                  />{' '}
                  Address
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ maxWidth: '60%' }}
                  contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}
                >
                  <Text
                    style={[
                      styles.optionTextRight,
                      { color: darkTheme ? darkTextColor : lightTextColor },
                    ]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {profile.address ? profile.address : 'no address saved'}
                  </Text>
                </ScrollView>
              </View>
              <View style={{ alignSelf: 'flex-end' }}>
                <TouchableOpacity
                  onPress={() => router.navigate('/(app)/(profile)/profileSettings')}
                >
                  <ThemedText type="link">
                    <Ionicons name="pencil" /> Edit
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </ThemedSecondaryView>
            <ThemedSecondaryView style={styles.sectionContainer}>
              <View style={styles.rowContainer}>
                <TouchableOpacity
                  onPress={() => setContactModalVisible(true)}
                  style={{ flexDirection: 'row', alignItems: 'center' }}
                >
                  <Ionicons
                    style={[
                      styles.optionText,
                      { color: darkTheme ? darkTextColor : lightTextColor, marginRight: 5 },
                    ]}
                    name="person"
                  />
                  <ThemedText type="subtitle">Contact</ThemedText>
                </TouchableOpacity>
              </View>
              <View style={styles.rowContainer}>
                <Text
                  style={[styles.optionText, { color: darkTheme ? darkTextColor : lightTextColor }]}
                >
                  <Ionicons
                    style={[
                      styles.optionText,
                      { color: darkTheme ? darkTextColor : lightTextColor },
                    ]}
                    name="document-lock-outline"
                  />{' '}
                  Privacy Policy
                </Text>
              </View>
              <View style={styles.rowContainer}>
                <TouchableOpacity onPress={() => router.push('/(app)/(profile)/businessSettings')}>
                  <Text
                    style={[
                      styles.optionText,
                      { color: darkTheme ? darkTextColor : lightTextColor },
                    ]}
                  >
                    <Ionicons
                      style={[
                        styles.optionText,
                        { color: darkTheme ? darkTextColor : lightTextColor },
                      ]}
                      name="settings"
                    />{' '}
                    Business settings
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.rowContainer}>
                <TouchableOpacity onPress={() => router.push('/(app)/(profile)/biometricSettings')}>
                  <Text
                    style={[
                      styles.optionText,
                      { color: darkTheme ? darkTextColor : lightTextColor },
                    ]}
                  >
                    <Ionicons
                      style={[
                        styles.optionText,
                        { color: darkTheme ? darkTextColor : lightTextColor },
                      ]}
                      name="finger-print"
                    />{' '}
                    Biometric Authentication
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.rowContainerLast}>
                <TouchableOpacity onPress={() => router.push('/(app)/(profile)/styleSettings')}>
                  <Text
                    style={[
                      styles.optionText,
                      { color: darkTheme ? darkTextColor : lightTextColor },
                    ]}
                  >
                    <Ionicons
                      style={[
                        styles.optionText,
                        { color: darkTheme ? darkTextColor : lightTextColor },
                      ]}
                      name="settings"
                    />{' '}
                    Account settings
                  </Text>
                </TouchableOpacity>
              </View>
            </ThemedSecondaryView>
            <TouchableOpacity
              style={[
                commonStyles.button,
                {
                  borderColor: color,
                  alignSelf: 'center',
                  margin: 15,
                  backgroundColor: darkTheme ? darkSecondColor : lightSecondColor,
                },
              ]}
              onPress={handleLogout}
            >
              <ThemedText type="subtitle">Logout</ThemedText>
            </TouchableOpacity>
            <Modal
              visible={contactModalVisible}
              transparent
              animationType="slide"
              onRequestClose={() => setContactModalVisible(false)}
            >
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'rgba(0,0,0,0.3)',
                }}
              >
                <View
                  style={{
                    backgroundColor: darkTheme ? darkSecondColor : '#fff',
                    padding: 20,
                    borderRadius: 16,
                    marginHorizontal: 10,
                    minWidth: 250,
                    alignItems: 'center',
                  }}
                >
                  <ThemedText type="subtitle">
                    For questions, suggestions, feedback or bugs, please contact me:
                  </ThemedText>
                  <View style={[commonStylesCards.dataContainer, { margin: 10 }]}>
                    <ThemedText
                      style={[
                        commonStylesCards.LabelText,
                        { color: darkTheme ? darkTextColor : lightTextColor },
                      ]}
                    >
                      Phone:{' '}
                    </ThemedText>
                    <TouchableOpacity onPress={() => Linking.openURL(`tel:+17866129974`)}>
                      <ThemedText type="link">+1 786-612-9974</ThemedText>
                    </TouchableOpacity>
                  </View>
                  <View style={[commonStylesCards.dataContainer, { margin: 10 }]}>
                    <ThemedText
                      style={[
                        commonStylesCards.LabelText,
                        { color: darkTheme ? darkTextColor : lightTextColor },
                      ]}
                    >
                      Email:{' '}
                    </ThemedText>
                    <TouchableOpacity onPress={() => Linking.openURL(`mailto:admin@qbared.com`)}>
                      <ThemedText type="link">admin@qbared.com</ThemedText>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    style={[commonStyles.button, { borderColor: color, marginTop: 15 }]}
                    onPress={() => setContactModalVisible(false)}
                  >
                    <ThemedText type="subtitle" style={{ color: color }}>
                      Close
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </ScrollView>
        )}
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  image: {
    width: 100,
    height: 100,
    borderWidth: 2,
    margin: 2,
    borderRadius: 15,
  },
  sectionContainer: {
    padding: 10,
    margin: 5,
    borderRadius: 15,
    width: '95%',
    alignItems: 'center',
    alignSelf: 'center',
  },
  header: {
    justifyContent: 'flex-end',
    paddingHorizontal: 10,
    paddingBottom: 10,
    fontWeight: 'bold',
    fontSize: 25,
  },
  textInput: {
    height: 40,
    width: '80%',
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 5,
    padding: 10,
    borderRadius: 5,
  },
  button: {
    padding: 10,
    borderRadius: 16,
    margin: 5,
    width: 100,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowOffset: { width: 2, height: 2 },
        shadowColor: '#333',
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  rowContainerLast: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  info: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginRight: 10,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 5,
    borderBottomWidth: 1,
  },
  infoText: {
    fontSize: 25,
  },
  optionText: {
    fontSize: 20,
  },
  optionTextRight: {
    fontSize: 16,
  },
});
