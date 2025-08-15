import React, { useEffect, useState } from 'react';
import { View, TextInput, Text, Image, TouchableOpacity, Modal } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '@/app/(redux)/store';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import PhoneInput, {
  ICountry,
  getCountryByPhoneNumber,
  isValidPhoneNumber,
} from 'react-native-international-phone-number';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import {
  darkMainColor,
  darkTextColor,
  lightMainColor,
  lightTextColor,
  userImageDefault,
} from '@/settings';
import { commonStyles } from '@/constants/commonStyles';
import { clientSetMessage } from '@/app/(redux)/clientSlice';
import { commonStylesForm } from '@/constants/commonStylesForm';
import CustomAddress from '../CustomAddress';
import { ThemedSecondaryView } from '../ThemedSecondaryView';
import { useClientActions } from '@/hooks';

interface ClientFormProps {
  action?: any;
  id?: string;
}

interface Errors {
  name?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export default function ClientForm({ action }: ClientFormProps) {
  const { color, darkTheme, business } = useSelector((state: RootState) => state.settings);
  const { clientError, client } = useSelector((state: RootState) => state.client);
  const [name, setName] = useState(action === 'create' ? '' : client.name);
  const [lastName, setLastName] = useState(action === 'create' ? '' : client.last_name);
  const [phone, setPhone] = useState(action === 'create' ? '' : client.phone);
  const [email, setEmail] = useState(action === 'create' ? '' : client.email);
  const [address, setAddress] = useState(action === 'create' ? '' : client.address);
  const [image, setImage] = useState(action === 'create' ? userImageDefault : client.image);
  const [selectedCountry, setSelectedCountry] = useState<null | ICountry>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();

  // Usar el hook de acciones de cliente
  const { createUpdateClient } = useClientActions();

  /* function handlePhoneInputValue(phoneNumber: string) {
    setPhone(selectedCountry?.callingCode + phoneNumber);
  } */

  function handleSelectedCountry(country: ICountry) {
    setSelectedCountry(country);
  }

  function removeCountryCode(phone: string, callingCode: string): string {
    if (phone.startsWith('+' + callingCode)) {
      return phone.slice(callingCode.length + 1);
    }
    if (phone.startsWith(callingCode)) {
      return phone.slice(callingCode.length);
    }
    return phone;
  }

  useEffect(() => {
    if (phone) {
      const localNumber = removeCountryCode(
        phone,
        getCountryByPhoneNumber(phone)?.callingCode || '',
      );
      setPhone(localNumber);
    }
  }, [phone]);

  const validateForm = () => {
    let errors: Errors = {};
    if (!name) errors.name = 'Name is required';
    if (email) {
      if (!/\S+@\S+\.\S+/.test(email)) {
        errors.email = 'Email is invalid!';
      }
    }
    /* if (!address) errors.address = "Address is required"; */
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

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

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const hasImage = image && image !== null;
      const phoneWithCountry = phone ? selectedCountry?.callingCode + phone : '';

      let result;
      const formData = new FormData();
      formData.append('action', action);
      formData.append('id', client.id ?? '');
      formData.append('business', business.name);
      formData.append('name', name);
      formData.append('last_name', lastName);
      formData.append('phone', phoneWithCountry);
      formData.append('email', email || '');
      formData.append('address', address || '');
      if (image) {
        const uriParts = image.split('.');
        const fileType = uriParts[uriParts.length - 1];
        const fileName = `${name}ProfilePicture.${fileType}`;
        formData.append('image', {
          uri: image,
          name: fileName,
          type: `image/${fileType}`,
        } as unknown as Blob);
      }
      result = await createUpdateClient(formData);
      if (result) {
        dispatch(clientSetMessage('Client created successfully'));
        router.replace('/(app)/(clients)');
      }
    } catch (error: any) {
      console.error(`Error ${action === 'new' ? 'creating' : 'updating'} client:`, error);
    }
  };

  const handleImageOptions = () => setImageModalVisible(true);

  return (
    <View>
      {clientError ? <ThemedText style={commonStyles.errorMsg}>{clientError}</ThemedText> : null}
      <ThemedText style={commonStylesForm.label}>Name</ThemedText>
      <View
        style={[
          commonStylesForm.action,
          { borderBottomColor: darkTheme ? darkTextColor : lightTextColor },
        ]}
      >
        <Ionicons
          style={{ marginBottom: 5, fontSize: 16 }}
          name="person"
          color={darkTheme ? darkTextColor : lightTextColor}
        />
        <TextInput
          style={[
            commonStylesForm.textInput,
            { color: darkTheme ? darkTextColor : lightTextColor },
          ]}
          placeholder={name ? name : "Enter client's name"}
          placeholderTextColor={darkTheme ? darkTextColor : lightTextColor}
          value={name}
          onChangeText={setName}
        />
      </View>
      {errors.name ? <Text style={commonStyles.errorMsg}>{errors.name}</Text> : null}
      <ThemedText style={commonStylesForm.label}>Last Name</ThemedText>
      <View
        style={[
          commonStylesForm.action,
          { borderBottomColor: darkTheme ? darkTextColor : lightTextColor },
        ]}
      >
        <Ionicons
          style={{ marginBottom: 5, fontSize: 16 }}
          name="person-add"
          color={darkTheme ? darkTextColor : lightTextColor}
        />
        <TextInput
          style={[
            commonStylesForm.textInput,
            { color: darkTheme ? darkTextColor : lightTextColor },
          ]}
          placeholder={lastName ? lastName : "Enter client's last name"}
          placeholderTextColor={darkTheme ? darkTextColor : lightTextColor}
          value={lastName}
          onChangeText={setLastName}
        />
      </View>
      {errors.lastName ? <Text style={commonStyles.errorMsg}>{errors.lastName}</Text> : null}
      <ThemedText style={commonStylesForm.label}>Phone</ThemedText>
      <PhoneInput
        defaultCountry="US"
        value={phone}
        onChangePhoneNumber={setPhone}
        selectedCountry={selectedCountry}
        onChangeSelectedCountry={handleSelectedCountry}
        theme={darkTheme ? 'dark' : 'light'}
        placeholder={phone ? phone : "Enter client's phone"}
        phoneInputStyles={{
          flagContainer: {
            margin: 0,
            width: 90,
            padding: 0,
          },
          caret: {
            fontSize: 16,
            width: 3,
          },
          callingCode: {
            fontSize: 16,
          },
        }}
      />
      {errors.phone ? <Text style={commonStyles.errorMsg}>{errors.phone}</Text> : null}
      <ThemedText style={commonStylesForm.label}>Email</ThemedText>
      <View
        style={[
          commonStylesForm.action,
          { borderBottomColor: darkTheme ? darkTextColor : lightTextColor },
        ]}
      >
        <Ionicons
          style={{ marginBottom: 5, fontSize: 16 }}
          name="mail"
          color={darkTheme ? darkTextColor : lightTextColor}
        />
        <TextInput
          style={[
            commonStylesForm.textInput,
            { color: darkTheme ? darkTextColor : lightTextColor },
          ]}
          placeholder="Enter client's email"
          placeholderTextColor={darkTheme ? darkTextColor : lightTextColor}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
      </View>
      {errors.email ? <Text style={commonStyles.errorMsg}>{errors.email}</Text> : null}
      <ThemedText style={commonStylesForm.label}>Address</ThemedText>
      <View
        style={[
          commonStylesForm.action,
          { borderBottomColor: darkTheme ? '#f2f2f2' : '#000', marginBottom: 5 },
        ]}
      >
        <Ionicons
          style={{ marginBottom: 5, fontSize: 16 }}
          name="location"
          color={darkTheme ? darkTextColor : lightTextColor}
        />
        <CustomAddress
          placeholder={address ? address : "Client's address"}
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
          <ThemedText>{action === 'new' ? 'Create' : 'Update'}</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            commonStyles.button,
            {
              borderColor: 'red',
              backgroundColor: darkTheme ? darkMainColor : lightMainColor,
            },
          ]}
          onPress={
            action === 'new' ? () => router.replace('/(app)/(clients)') : () => router.back()
          }
        >
          <ThemedText style={{ color: 'red' }}>Cancel</ThemedText>
        </TouchableOpacity>
      </View>
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
              {action === 'new' ? 'Add Photo' : 'Change Photo'}
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
    </View>
  );
}
