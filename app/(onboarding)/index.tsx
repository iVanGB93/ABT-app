import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Image,
  Modal,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useRouter, usePathname } from 'expo-router';
import { useAppDispatch, RootState } from '../(redux)/store';
import PhoneInput, {
  ICountry,
  getCountryByPhoneNumber,
  isValidPhoneNumber,
} from 'react-native-international-phone-number';
import * as ImagePicker from 'expo-image-picker';

import Ionicons from '@expo/vector-icons/Ionicons';
import { commonStyles } from '@/constants/commonStyles';
import CustomAlert from '@/constants/customAlert';
import axiosInstance from '@/axios';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import {
  darkSecondColor,
  darkThirdColor,
  darkTextColor,
  lightMainColor,
  lightSecondColor,
  lightTextColor,
  darkMainColor,
  userImageDefault,
} from '@/settings';
import { setMessage, setProfile } from '../(redux)/settingSlice';
import CustomAddress from '@/components/CustomAddress';
import { ThemedSecondaryView } from '@/components/ThemedSecondaryView';

interface Errors {
  phone?: string;
  address?: string;
}

export default function OnboardingIndex() {
  const { color, darkTheme, profile } = useSelector((state: RootState) => state.settings);
  const { userName, token } = useSelector((state: RootState) => state.auth);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [image, setImage] = useState(userImageDefault);
  const [selectedCountry, setSelectedCountry] = useState<null | ICountry>(null);
  const [updateProfile, setUpdateProfile] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [errors, setErrors] = useState<Errors>({});
  const [alertVisible, setAlertVisible] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);

  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!updateProfile) {
      router.navigate('/(onboarding)/businessList');
    }
  }, [updateProfile]);

  const handleImageOptions = () => setImageModalVisible(true);

  function handleSelectedCountry(country: ICountry) {
    setSelectedCountry(country);
  }

  const getProfile = async () => {
    await axiosInstance
      .get(`user/account/${userName}/`)
      .then(function (response) {
        if (response.data) {
          dispatch(setProfile(response.data));
          if (response.data.phone || response.data.address) {
            setUpdateProfile(false);
          }
        } else {
          setError(response.data.message);
        }
        setLoading(false);
      })
      .catch(function (error) {
        console.error('Error fetching profile:', error);
        try {
          const message = error.data.message;
          setError(message);
        } catch (e) {
          setError('Error getting your profile.');
        }
        setLoading(false);
      });
  };

  useEffect(() => {
    getProfile();
  }, []);

  const handleImage = async () => {
    let result: ImagePicker.ImagePickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    let permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      alert('Permission to access camera is required!');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    console.log(result);
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const validateForm = () => {
    let errors: Errors = {};
    if (!phone) errors.phone = 'Phone number is required!';
    if (!address) errors.address = 'Address is required!';
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      setLoading(true);
      const formData = new FormData();
      formData.append('phone', phone ? selectedCountry?.callingCode + phone : '');
      formData.append('address', address);
      if (image !== null) {
        const uriParts = image.split('.');
        const fileType = uriParts[uriParts.length - 1];
        const fileName = `${profile.name}ProfilePicture.${fileType}`;
        formData.append('image', {
          uri: image,
          name: fileName,
          type: `image/${fileType}`,
        } as unknown as Blob);
      }
      await axiosInstance
        .post(`user/account/update/${userName}/`, formData, {
          headers: {
            'content-Type': 'multipart/form-data',
          },
        })
        .then(function (response) {
          let data = response.data;
          if (response.status === 200) {
            dispatch(setMessage(data.message));
            router.navigate('/(app)/(business)');
          } else {
            setError(data.message);
          }
          setLoading(false);
        })
        .catch(function (error) {
          console.error('Error logging in:', error.response, error.message);
          dispatch(setMessage('Account created but error logging in.'));
          router.push('/');
          setAlertVisible(false);
          setLoading(false);
        });
    }
  };

  if (!updateProfile) return null;

  return (
    <ThemedView style={commonStyles.container}>
      <View
        style={[
          commonStyles.footerBottom,
          { backgroundColor: darkTheme ? darkSecondColor : lightSecondColor, borderColor: color },
        ]}
      >
        {loading ? (
          <ActivityIndicator style={commonStyles.loading} size="large" color={color} />
        ) : (
          <>
            <ThemedText type="title" style={{ marginVertical: 20 }}>
              Complete your profile!
            </ThemedText>
            <ScrollView keyboardShouldPersistTaps="handled">
              <ThemedText style={commonStyles.text_action} type="subtitle">
                Phone
              </ThemedText>
              <PhoneInput
                defaultCountry="US"
                value={phone}
                onChangePhoneNumber={setPhone}
                selectedCountry={selectedCountry}
                onChangeSelectedCountry={handleSelectedCountry}
                theme={darkTheme ? 'dark' : 'light'}
                placeholder={phone ? phone : 'Enter your phone'}
                phoneInputStyles={{
                  flagContainer: {
                    margin: 0,
                    width: 90,
                    padding: 0,
                  },
                  caret: {
                    fontSize: 12,
                    width: 3,
                  },
                  callingCode: {
                    fontSize: 12,
                  },
                }}
              />
              {errors.phone ? <Text style={commonStyles.errorMsg}>{errors.phone}</Text> : null}
              <ThemedText style={commonStyles.text_action} type="subtitle">
                Address
              </ThemedText>
              <View
                style={[
                  commonStyles.action,
                  { borderBottomColor: darkTheme ? '#f2f2f2' : '#000', marginBottom: 5 },
                ]}
              >
                <Ionicons
                  style={{ marginBottom: 5, fontSize: 16 }}
                  name="location"
                  color={darkTheme ? darkTextColor : lightTextColor}
                />
                <CustomAddress
                  placeholder={address ? address : 'Enter your address'}
                  address={address}
                  setAddress={setAddress}
                />
              </View>
              {errors.address ? <Text style={commonStyles.errorMsg}>{errors.address}</Text> : null}
              <View style={{ alignItems: 'center', marginTop: 15 }}>
                <View style={{ position: 'relative' }}>
                  <TouchableOpacity onPress={handleImageOptions} activeOpacity={0.8}>
                    <Image source={{ uri: image }} style={commonStyles.imageCircle} />
                    <View
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        backgroundColor: color,
                        borderRadius: 16,
                        width: 32,
                        height: 32,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: 2,
                        borderColor: darkTheme ? darkMainColor : lightMainColor,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.2,
                        shadowRadius: 2,
                        elevation: 3,
                      }}
                    >
                      <Ionicons name="add" size={20} color="#fff" />
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              {loading ? (
                <ActivityIndicator style={commonStyles.loading} size="large" color={color} />
              ) : (
                <>
                  <TouchableOpacity
                    style={[
                      commonStyles.button,
                      {
                        borderColor: color,
                        marginTop: 50,
                        backgroundColor: darkTheme ? darkThirdColor : lightMainColor,
                      },
                    ]}
                    onPress={handleSubmit}
                  >
                    <ThemedText type="subtitle" style={{ color: color }}>
                      Save
                    </ThemedText>
                  </TouchableOpacity>
                  <View style={commonStyles.linkSection}>
                    <ThemedText type="subtitle">Skip and </ThemedText>
                    <TouchableOpacity onPress={() => router.navigate('/(onboarding)/businessList')}>
                      <ThemedText type="subtitle" style={{ color: color }}>
                        Continue!
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </ScrollView>
          </>
        )}
      </View>
      <CustomAlert
        title="Registration"
        visible={alertVisible}
        message={error}
        onClose={() => setAlertVisible(false)}
      />
      <Modal
        visible={imageModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setImageModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.4)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ThemedSecondaryView
            style={{
              borderRadius: 16,
              padding: 24,
              minWidth: 250,
              alignItems: 'center',
            }}
          >
            <ThemedText type="subtitle" style={{ marginBottom: 16 }}>
              Add Photo
            </ThemedText>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-evenly',
                marginTop: 15,
              }}
            >
              <Image source={{ uri: image }} style={commonStyles.imageCircle} />
              <View>
                <TouchableOpacity
                  style={[
                    commonStyles.button,
                    { borderColor: color, marginBottom: 10, width: 180 },
                  ]}
                  onPress={() => {
                    setImageModalVisible(false);
                    handleImage();
                  }}
                >
                  <Ionicons name="image" size={20} color={color} />
                  <ThemedText>Choose from Gallery</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    commonStyles.button,
                    { borderColor: color, marginBottom: 10, width: 180 },
                  ]}
                  onPress={() => {
                    setImageModalVisible(false);
                    takePhoto();
                  }}
                >
                  <Ionicons name="camera" size={20} color={color} />
                  <ThemedText>Take Photo</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity
              style={[
                commonStyles.button,
                {
                  borderColor: 'red',
                  marginTop: 15,
                  backgroundColor: darkTheme ? darkMainColor : lightMainColor,
                },
              ]}
              onPress={() => setImageModalVisible(false)}
            >
              <ThemedText style={{ color: 'red' }}>Cancel</ThemedText>
            </TouchableOpacity>
          </ThemedSecondaryView>
        </View>
      </Modal>
    </ThemedView>
  );
}
