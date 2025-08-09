import React, { useState, useEffect, use } from 'react';
import { Text, View, TouchableOpacity, ActivityIndicator, ScrollView, Image } from 'react-native';
import { useSelector } from 'react-redux';
import { useRouter, usePathname } from 'expo-router';
import { useAppDispatch, RootState } from '../../(redux)/store';
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
} from '@/settings';
import { setMessage, setProfile } from '../../(redux)/settingSlice';
import CustomAddress from '@/components/CustomAddress';

interface Errors {
  phone?: string;
  address?: string;
}

export default function AccountDetails() {
  const { color, darkTheme, profile } = useSelector((state: RootState) => state.settings);
  const { userName, token } = useSelector((state: RootState) => state.auth);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [image, setImage] = useState<string | null>(profile.image || null);
  const [selectedCountry, setSelectedCountry] = useState<null | ICountry>(null);
  const [updateProfile, setUpdateProfile] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [errors, setErrors] = useState<Errors>({});
  const [alertVisible, setAlertVisible] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    if (token || userName) {
      router.navigate('/accountDetails');
    } else {
      router.navigate('/(auth)/login');
    }
  }, [token, userName]);

  useEffect(() => {
    if (!updateProfile) {
      router.navigate('/(app)/(business)');
    }
  }, [updateProfile]);

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
        const fileName = `${name}ProfilePicture.${fileType}`;
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
              {image && (
                <Image
                  source={{ uri: image }}
                  style={[commonStyles.imageCircle, { marginTop: 15 }]}
                />
              )}
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  justifyContent: 'space-evenly',
                  marginTop: 15,
                }}
              >
                <TouchableOpacity
                  style={[
                    commonStyles.button,
                    {
                      borderColor: color,
                      backgroundColor: darkTheme ? darkMainColor : lightMainColor,
                    },
                  ]}
                  onPress={() => handleImage()}
                >
                  <ThemedText style={{ color: color }}>Add image</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    commonStyles.button,
                    {
                      borderColor: color,
                      backgroundColor: darkTheme ? darkMainColor : lightMainColor,
                    },
                  ]}
                  onPress={() => takePhoto()}
                >
                  <ThemedText style={{ color: color }}>Take Photo</ThemedText>
                </TouchableOpacity>
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
                    <TouchableOpacity onPress={() => router.navigate('/(app)/(business)')}>
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
    </ThemedView>
  );
}
