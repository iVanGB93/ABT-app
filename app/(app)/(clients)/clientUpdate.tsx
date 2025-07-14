import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Text,
  Platform,
  ActivityIndicator,
  Image,
  ScrollView,
} from 'react-native';
import axiosInstance from '@/axios';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { RootState, useAppDispatch } from '@/app/(redux)/store';
import { useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import {
  baseImageURL,
  darkMainColor,
  darkTtextColor,
  lightMainColor,
  lightTextColor,
} from '@/settings';
import { ThemedView } from '@/components/ThemedView';
import { ThemedSecondaryView } from '@/components/ThemedSecondaryView';
import { ThemedText } from '@/components/ThemedText';
import { commonStyles } from '@/constants/commonStyles';
import { clientSetMessage, setClient } from '@/app/(redux)/clientSlice';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import PhoneInput from 'react-native-phone-number-input';
import ClientForm from '@/components/clients/ClientForm';
import { commonStylesForm } from '@/constants/commonStylesForm';

interface Errors {
  name?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export default function ClientUpdate() {
  const { color, darkTheme } = useSelector((state: RootState) => state.settings);
  const { userName } = useSelector((state: RootState) => state.auth);
  const { client } = useSelector((state: RootState) => state.client);
  const [name, setName] = useState(client.name);
  const [lastName, setLastName] = useState(client.last_name);
  const [phone, setPhone] = useState(client.phone);
  const [email, setEmail] = useState(client.email);
  const [address, setAddress] = useState(client.address);
  const [image, setImage] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();

  const validateForm = () => {
    let errors: Errors = {};
    if (!name) errors.name = 'Name is required';
    if (email) {
      if (!/\S+@\S+\.\S+/.test(email)) {
        errors.email = 'Email is invalid!';
      }
    }
    if (!address) errors.address = 'Address is required';
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      const formData = new FormData();
      formData.append('action', 'update');
      formData.append('id', client.id);
      formData.append('name', name);
      formData.append('last_name', lastName);
      formData.append('phone', phone);
      formData.append('email', email);
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
      setIsLoading(true);
      await axiosInstance
        .post(`clients/update/${userName}/`, formData, {
          headers: {
            'content-Type': 'multipart/form-data',
          },
        })
        .then(function (response) {
          let data = response.data;
          if (data.OK) {
            dispatch(setClient(data.client));
            dispatch(clientSetMessage(data.message));
            router.push('/(app)/(clients)/clientDetails');
          }
          setError(response.data.message);
          setIsLoading(false);
        })
        .catch(function (error) {
          console.error('Error updating a client:', error.config);
          setIsLoading(false);
          setError(error.message);
        });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      style={[
        commonStyles.container,
        { backgroundColor: darkTheme ? darkMainColor : lightMainColor },
      ]}
    >
      {isLoading ? (
        <ActivityIndicator style={commonStyles.loading} size="large" />
      ) : (
        <ThemedSecondaryView
          style={[commonStylesForm.form, { shadowColor: darkTheme ? '#fff' : '#000' }]}
        >
          <ScrollView keyboardShouldPersistTaps={'handled'} contentContainerStyle={{ flexGrow: 1 }}>
            <ClientForm
              name={name}
              setName={setName}
              lastName={lastName}
              setLastName={setLastName}
              phone={phone}
              setPhone={setPhone}
              email={email}
              setEmail={setEmail}
              address={address}
              setAddress={setAddress}
              errors={errors}
            />
            {image ? (
              <Image source={{ uri: image }} style={commonStyles.image} />
            ) : (
              <Image source={{ uri: baseImageURL + client.image }} style={commonStyles.image} />
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
                <ThemedText style={{ color: color }}>
                  Add image
                </ThemedText>
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
                <ThemedText style={{ color: color }}>
                  Take Photo
                </ThemedText>
              </TouchableOpacity>
            </View>
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
                onPress={() => handleSubmit()}
              >
                <ThemedText style={{ color: color }}>
                  Update
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  commonStyles.button,
                  {
                    borderColor: 'red',
                    backgroundColor: darkTheme ? darkMainColor : lightMainColor,
                  },
                ]}
                onPress={() => router.back()}
              >
                <ThemedText style={{ color: 'red' }}>
                  Cancel
                </ThemedText>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </ThemedSecondaryView>
      )}
    </KeyboardAvoidingView>
  );
}
