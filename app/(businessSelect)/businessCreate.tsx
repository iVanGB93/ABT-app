import React, { useEffect, useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Text,
  Platform,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import axiosInstance from '@/axios';
import * as ImagePicker from 'expo-image-picker';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '@/app/(redux)/store';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';

import { ThemedSecondaryView } from '@/components/ThemedSecondaryView';
import { ThemedText } from '@/components/ThemedText';
import { darkMainColor, darkTtextColor, lightMainColor, lightTextColor } from '@/settings';
import { commonStyles } from '@/constants/commonStyles';
import BusinessForm from '@/components/business/BusinessForm';
import { businessSetMessage } from '@/app/(redux)/businessSlice';
import { setBusiness } from '../(redux)/settingSlice';
import { commonStylesForm } from '@/constants/commonStylesForm';

interface Errors {
  name?: string;
  description?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export default function BusinessCreate() {
  const { userName } = useSelector((state: RootState) => state.auth);
  const [owners, setOwners] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { color, darkTheme } = useSelector((state: RootState) => state.settings);
  const dispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error,
      });
      setError(null);
    }
  }, [error]);

  const validateForm = () => {
    let errors: Errors = {};
    if (!name) errors.name = 'Name is required';
    //if (!description) errors.description = 'Description is required';
    if (!email) errors.email = 'Email is required';
    if (email) {
      if (!/\S+@\S+\.\S+/.test(email)) {
        errors.email = 'Email is invalid!';
      }
    }
    //if (!phone) errors.phone = "Phone is required";
    if (!address) errors.address = 'Address is required';
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleImage = async () => {
    let result: ImagePicker.ImagePickerResult = await ImagePicker.launchImageLibraryAsync({
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
      formData.append('action', 'new');
      formData.append('owners', JSON.stringify(owners));
      formData.append('name', name);
      formData.append('description', description);
      formData.append('phone', phone);
      formData.append('email', email);
      formData.append('address', address);
      if (image !== null) {
        const uriParts = image.split('.');
        const fileType = uriParts[uriParts.length - 1];
        const fileName = `${name}BusinessLogo.${fileType}`;
        formData.append('image', {
          uri: image,
          name: fileName,
          type: `image/${fileType}`,
        } as unknown as Blob);
      }
      setIsLoading(true);
      await axiosInstance
        .post(`business/create/${userName}/`, formData, {
          headers: {
            'content-Type': 'multipart/form-data',
          },
        })
        .then(function (response) {
          let data = response.data;
          dispatch(businessSetMessage(data.message));
          if (data.OK) {
            console.log(data);
            dispatch(setBusiness(data.business));
            dispatch(businessSetMessage(data.message));
            router.navigate('/(app)/(business)/businessDetails');
          } else {
            setError(data.message);
          }
          setIsLoading(false);
        })
        .catch(function (error) {
          console.error('Error creating a business:', error);
          if (typeof error.response === 'undefined') {
            setError('Error creating a business, undefined');
          } else {
            if (error.response.status === 401) {
              router.navigate('/');
            } else {
              setError(error.message);
            }
          }
          setIsLoading(false);
        });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 50}
      style={[
        commonStyles.container,
        {
          backgroundColor: darkTheme ? darkMainColor : lightMainColor,
          marginTop: 50,
        },
      ]}
    >
      <ThemedText type="title">Create New Business</ThemedText>
      {isLoading ? (
        <ActivityIndicator style={commonStyles.loading} size="large" />
      ) : (
        <ThemedSecondaryView
          style={[commonStylesForm.form, { shadowColor: darkTheme ? '#fff' : '#000' }]}
        >
          <ScrollView keyboardShouldPersistTaps={'handled'} contentContainerStyle={{ flexGrow: 1 }}>
            <BusinessForm
              owners={owners}
              setOwners={setOwners}
              name={name}
              setName={setName}
              description={description}
              setDescription={setDescription}
              phone={phone}
              setPhone={setPhone}
              email={email}
              setEmail={setEmail}
              address={address}
              setAddress={setAddress}
              errors={errors}
            />
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                justifyContent: 'space-evenly',
                alignItems: 'center',
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
                <ThemedText style={{ color: color }}>Add Logo</ThemedText>
              </TouchableOpacity>
              {image && <Image source={{ uri: image }} style={commonStylesForm.image} />}
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
                <ThemedText style={{ color: color }}>Create</ThemedText>
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
                <ThemedText style={{ color: 'red' }}>Cancel</ThemedText>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </ThemedSecondaryView>
      )}
    </KeyboardAvoidingView>
  );
}
