import React, { useEffect, useState } from 'react';
import {
  View,
  TextInput,
  Modal,
  Text,
  TouchableOpacity,
  Switch,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '@/app/(redux)/store';
import { Ionicons } from '@expo/vector-icons';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import PhoneInput, {
  ICountry,
  getCountryByPhoneNumber,
} from 'react-native-international-phone-number';
import Constants from 'expo-constants';
const GOOGLE_PLACES_API_KEY = Constants.expoConfig?.extra?.googlePlacesApiKey;
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import axiosInstance from '@/axios';
import {
  darkTextColor,
  lightTextColor,
  darkMainColor,
  lightMainColor,
} from '@/settings';
import { commonStyles } from '@/constants/commonStyles';
import { ThemedSecondaryView } from '../ThemedSecondaryView';
import { businessSetError, businessSetMessage } from '@/app/(redux)/businessSlice';
import { setBusiness } from '@/app/(redux)/settingSlice';
import { commonStylesForm } from '@/constants/commonStylesForm';
import { commonStylesCards } from '@/constants/commonStylesCard';

interface Errors {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  description?: string;
  website?: string;
}

interface BusinessFormProps {
  action?: any;
  isLoading?: boolean;
  setIsLoading?: any;
}

export default function BusinessForm({ action, isLoading, setIsLoading }: BusinessFormProps) {
  const { color, darkTheme, business, profile } = useSelector((state: RootState) => state.settings);
  const { businessError } = useSelector((state: RootState) => state.business);
  const { userName, userEmail } = useSelector((state: RootState) => state.auth);
  const [name, setName] = useState(action === 'create' ? '' : business.name);
  const [phone, setPhone] = useState(action === 'create' ? '' : business.phone);
  const [email, setEmail] = useState(action === 'create' ? '' : business.email);
  const [address, setAddress] = useState(action === 'create' ? '' : business.address);
  const [description, setDescription] = useState(action === 'create' ? '' : business.description);
  const [website, setWebsite] = useState(action === 'create' ? '' : business.website);
  const [image, setImage] = useState<string | null>(
    action === 'create' ? null : business.logo || null,
  );
  const [owners, setOwners] = useState<string[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [selectedCountry, setSelectedCountry] = useState<null | ICountry>(null);
  const [inputValue, setInputValue] = useState<string>('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [loading, setLoading] = useState(false);
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
  const [useAccountPhone, setUseAccountPhone] = useState(false);
  const [useAccountEmail, setUseAccountEmail] = useState(false);
  const [useAccountAddress, setUseAccountAddress] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    if (useAccountPhone) {
      setPhone(profile.phone ?? '');
    } else {
      setPhone('');
    }
  }, [useAccountPhone, profile.phone]);
  useEffect(() => {
    if (useAccountEmail) {
      setEmail(profile.email ?? email);
    } else {
      setEmail('');
    }
  }, [useAccountEmail, profile.email]);
  useEffect(() => {
    if (useAccountAddress) {
      setAddress(profile.address ?? '');
    } else {
      setAddress('');
    }
  }, [useAccountAddress, profile.address]);

  function handleInputValue(phoneNumber: string) {
    setInputValue(phoneNumber);
  }

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

  function handleAddOwner() {
    if (!inviteEmail || !inviteEmail.includes('@')) {
      setInviteError('Please enter a valid email');
      return;
    }
    if (owners && owners.includes(inviteEmail)) {
      setInviteError('This email is already added');
      return;
    }
    setOwners([...(owners ?? []), inviteEmail]);
    setInviteEmail('');
    setInviteError('');
    setInviteModalVisible(false);
  }

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
    //if (!address) errors.address = 'Address is required';
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

  const deleteBusiness = async () => {
    setLoading(true);
    await axiosInstance
      .post(
        `business/delete/${business.id}/`,
        { action: 'delete' },
        {
          headers: {
            'content-Type': 'multipart/form-data',
          },
        },
      )
      .then(function (response) {
        if (response.data.OK) {
          dispatch(businessSetMessage(response.data.message));
          router.replace('/(businessSelect)');
        }
      })
      .catch(function (error) {
        dispatch(businessSetError(error.message));
        setLoading(false);
        console.error('Error deleting a business:', error);
      });
  };

  const handleDelete = () => {
    setModalDeleteVisible(true);
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      const formData = new FormData();
      formData.append('action', action === 'create' ? 'new' : 'update');
      formData.append('id', business.id || '');
      formData.append('owners', owners ? JSON.stringify(owners) : '');
      formData.append('name', name);
      formData.append('description', description);
      formData.append('phone', phone ? selectedCountry?.callingCode + phone : '');
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
        .post(`business/${action}/${userName}/`, formData, {
          headers: {
            'content-Type': 'multipart/form-data',
          },
        })
        .then(function (response) {
          let data = response.data;
          if (data.OK) {
            dispatch(setBusiness(data.business));
            dispatch(businessSetMessage(data.message));
            router.navigate('/(app)/(business)/businessDetails');
          } else {
            dispatch(businessSetError(data.message));
          }
          setIsLoading(false);
        })
        .catch(function (error) {
          console.error(
            `Error ${action === 'create' ? 'creating' : 'updating'} a business:`,
            error,
          );
          if (typeof error.response === 'undefined') {
            dispatch(
              businessSetError(
                `Error ${action === 'create' ? 'creating' : 'updating'} a business, undefined`,
              ),
            );
          } else {
            if (error.response.status === 401) {
              router.replace('/');
            } else {
              dispatch(businessSetError(error.message));
            }
          }
          setIsLoading(false);
        });
    }
  };

  return (
    <View>
      {businessError ? (
        <ThemedText style={commonStyles.errorMsg}>{businessError}</ThemedText>
      ) : null}
      <ThemedText style={commonStyles.text_action} type="subtitle">
        Name
      </ThemedText>
      <View style={[commonStyles.action, { borderBottomColor: darkTheme ? '#f2f2f2' : '#000' }]}>
        <Ionicons
          style={{ marginBottom: 5, fontSize: 16 }}
          name="person"
          color={darkTheme ? darkTextColor : lightTextColor}
        />
        <TextInput
          style={[commonStyles.textInput, { color: darkTheme ? darkTextColor : lightTextColor }]}
          placeholder={name ? name : "Enter business's name"}
          placeholderTextColor={darkTheme ? darkTextColor : lightTextColor}
          value={name}
          onChangeText={setName}
        />
      </View>
      {errors.name ? <Text style={commonStyles.errorMsg}>{errors.name}</Text> : null}

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <ThemedText style={commonStyles.text_action} type="subtitle">
          Phone
        </ThemedText>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10 }}>
          <Text
            style={{
              marginLeft: 5,
              color: darkTheme ? darkTextColor : lightTextColor,
              fontSize: 12,
            }}
          >
            Use my phone
          </Text>
          <Switch
            value={useAccountPhone}
            onValueChange={setUseAccountPhone}
            thumbColor={useAccountPhone ? color : '#ccc'}
          />
        </View>
      </View>
      <PhoneInput
        defaultCountry="US"
        value={phone}
        onChangePhoneNumber={setPhone}
        selectedCountry={selectedCountry}
        onChangeSelectedCountry={handleSelectedCountry}
        theme={darkTheme ? 'dark' : 'light'}
        placeholder={phone ? phone : "Enter business's phone"}
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
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <ThemedText style={commonStyles.text_action} type="subtitle">
          Email
        </ThemedText>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10 }}>
          <Text
            style={{
              marginLeft: 5,
              color: darkTheme ? darkTextColor : lightTextColor,
              fontSize: 12,
            }}
          >
            Use my email
          </Text>
          <Switch
            value={useAccountEmail}
            onValueChange={setUseAccountEmail}
            thumbColor={useAccountEmail ? color : '#ccc'}
          />
        </View>
      </View>
      <View
        style={[
          commonStyles.action,
          { borderBottomColor: darkTheme ? '#f2f2f2' : '#000', flex: 1 },
        ]}
      >
        <Ionicons
          style={{ marginBottom: 5, fontSize: 16 }}
          name="mail"
          color={darkTheme ? darkTextColor : lightTextColor}
        />
        <TextInput
          style={[commonStyles.textInput, { color: darkTheme ? darkTextColor : lightTextColor }]}
          placeholder="Enter business's email"
          placeholderTextColor={darkTheme ? darkTextColor : lightTextColor}
          value={email}
          onChangeText={setEmail}
          editable={!useAccountEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>
      {errors.email ? <Text style={commonStyles.errorMsg}>{errors.email}</Text> : null}

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <ThemedText style={commonStyles.text_action} type="subtitle">
          Address
        </ThemedText>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10 }}>
          <Text
            style={{
              marginLeft: 5,
              color: darkTheme ? darkTextColor : lightTextColor,
              fontSize: 12,
            }}
          >
            Use my address
          </Text>
          <Switch
            value={useAccountAddress}
            onValueChange={setUseAccountAddress}
            thumbColor={useAccountAddress ? color : '#ccc'}
          />
        </View>
      </View>

      <View style={[commonStyles.action, { borderBottomColor: darkTheme ? '#f2f2f2' : '#000' }]}>
        <Ionicons
          style={{ marginBottom: 5, fontSize: 16 }}
          name="location"
          color={darkTheme ? darkTextColor : lightTextColor}
        />
        <GooglePlacesAutocomplete
          keyboardShouldPersistTaps="always"
          predefinedPlaces={[]}
          placeholder={address ? address : "Business's address"}
          minLength={2}
          timeout={1000}
          textInputProps={{
            placeholderTextColor: darkTheme ? darkTextColor : lightTextColor,
          }}
          onPress={(data, details = null) => {
            setAddress(data.description);
          }}
          query={{
            key: GOOGLE_PLACES_API_KEY,
            language: 'en',
          }}
          styles={{
            textInputContainer: {
              height: 26,
            },
            textInput: {
              height: 26,
              color: darkTheme ? '#fff' : '#000',
              fontSize: 16,
              backgroundColor: 'transparent',
            },
            predefinedPlacesDescription: {
              color: darkTheme ? darkTextColor : lightTextColor,
            },
          }}
          enablePoweredByContainer={false}
          disableScroll={true}
          listEmptyComponent={<ThemedText>No results, sorry.</ThemedText>}
        />
      </View>
      {errors.address ? <Text style={commonStyles.errorMsg}>{errors.address}</Text> : null}
      <ThemedText style={commonStyles.text_action} type="subtitle">
        Description (optional)
      </ThemedText>
      <View style={[commonStyles.action, { borderBottomColor: darkTheme ? '#f2f2f2' : '#000' }]}>
        <Ionicons
          style={{ marginBottom: 5, fontSize: 16 }}
          name="person-add"
          color={darkTheme ? darkTextColor : lightTextColor}
        />
        <TextInput
          style={[commonStyles.textInput, { color: darkTheme ? darkTextColor : lightTextColor }]}
          placeholder={description ? description : "Enter business's desciption"}
          placeholderTextColor={darkTheme ? darkTextColor : lightTextColor}
          value={description}
          onChangeText={setDescription}
        />
      </View>
      {errors.description ? <Text style={commonStyles.errorMsg}>{errors.description}</Text> : null}
      <ThemedText style={commonStyles.text_action} type="subtitle">
        Website (optional)
      </ThemedText>
      <View style={[commonStyles.action, { borderBottomColor: darkTheme ? '#f2f2f2' : '#000' }]}>
        <Ionicons
          style={{ marginBottom: 5, fontSize: 16 }}
          name="globe"
          color={darkTheme ? darkTextColor : lightTextColor}
        />
        <TextInput
          style={[commonStyles.textInput, { color: darkTheme ? darkTextColor : lightTextColor }]}
          placeholder={website ? website : "Enter business's website"}
          placeholderTextColor={darkTheme ? darkTextColor : lightTextColor}
          value={website}
          onChangeText={setWebsite}
        />
      </View>
      <ThemedText style={commonStyles.text_action} type="subtitle">
        Owner(s) {userName}
      </ThemedText>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 10,
        }}
      >
        <View style={{ flex: 1 }}>
          {(owners ?? []).map((email, idx) => (
            <View
              key={email}
              style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}
            >
              <ThemedText style={commonStyles.text_action} type="subtitle">
                {email}
              </ThemedText>
              {email !== userName && (
                <TouchableOpacity
                  onPress={() => setOwners((owners ?? []).filter((o) => o !== email))}
                >
                  <Ionicons
                    name="close-circle-outline"
                    size={20}
                    color="red"
                    style={{ marginLeft: 8 }}
                  />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
        <TouchableOpacity onPress={() => setInviteModalVisible(true)}>
          <Ionicons name="add-circle-outline" size={28} color={color} />
        </TouchableOpacity>
      </View>
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
          <ThemedText>Add Logo</ThemedText>
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
          <ThemedText>
            {action === 'create' ? 'Create' : 'Update'}
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
          <ThemedText style={{ color: 'red' }}>Cancel</ThemedText>
        </TouchableOpacity>
      </View>
      {action === 'update' ? (
        <View
          style={{
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'space-evenly',
            marginTop: 15,
          }}
        >
          <TouchableOpacity
            style={[commonStyles.button, { borderColor: 'red' }]}
            onPress={() => handleDelete()}
          >
            <ThemedText style={{ color: 'red' }}>Delete</ThemedText>
          </TouchableOpacity>
        </View>
      ) : null}
      <Modal
        visible={inviteModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setInviteModalVisible(false)}
      >
        <View style={[commonStyles.containerCentered, { backgroundColor: 'rgba(0,0,0,0.3)' }]}>
          <ThemedSecondaryView
            style={{
              padding: 24,
              borderRadius: 12,
              width: '80%',
              alignItems: 'center',
            }}
          >
            <ThemedText type="subtitle" style={{ marginBottom: 10 }}>
              Add other owner email to send an invitation for business ownership
            </ThemedText>
            <View
              style={[commonStyles.action, { borderBottomColor: darkTheme ? '#f2f2f2' : '#000' }]}
            >
              <Ionicons
                style={{ marginBottom: 5, fontSize: 16 }}
                name="mail"
                color={darkTheme ? darkTextColor : lightTextColor}
              />
              <TextInput
                style={[
                  commonStyles.textInput,
                  { color: darkTheme ? darkTextColor : lightTextColor },
                ]}
                placeholder="Enter owner's email"
                placeholderTextColor={darkTheme ? darkTextColor : lightTextColor}
                value={inviteEmail}
                onChangeText={setInviteEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {inviteError ? (
                <Text style={{ color: 'red', marginBottom: 10 }}>{inviteError}</Text>
              ) : null}
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                width: '100%',
                marginTop: 20,
              }}
            >
              <TouchableOpacity
                style={[
                  commonStyles.button,
                  {
                    borderColor: 'red',
                    backgroundColor: darkTheme ? darkMainColor : lightMainColor,
                  },
                ]}
                onPress={() => setInviteModalVisible(false)}
              >
                <ThemedText type="link" style={{ color: 'red' }}>
                  Cancel
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
                onPress={handleAddOwner}
              >
                <ThemedText>
                  Add
                </ThemedText>
              </TouchableOpacity>
            </View>
          </ThemedSecondaryView>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalDeleteVisible}
        onRequestClose={() => setModalDeleteVisible(!modalDeleteVisible)}
      >
        <View style={commonStylesCards.centeredView}>
          {loading ? (
            <ActivityIndicator color={color} size="large" />
          ) : (
            <ThemedSecondaryView style={[commonStylesCards.card, { padding: 10 }]}>
              <ThemedText style={[commonStylesCards.name, { padding: 10 }]}>
                Do you want to delete {name}?
              </ThemedText>
              <View
                style={[
                  commonStylesCards.dataContainer,
                  { padding: 10, justifyContent: 'space-evenly' },
                ]}
              >
                <TouchableOpacity
                  style={[commonStylesCards.button, { borderColor: color }]}
                  onPress={() => setModalDeleteVisible(!modalDeleteVisible)}
                >
                  <ThemedText style={{ color: color }}>Cancel</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[commonStylesCards.button, { borderColor: 'red' }]}
                  onPress={() => deleteBusiness()}
                >
                  <Text style={{ color: 'red', textAlign: 'center' }}>DELETE</Text>
                </TouchableOpacity>
              </View>
            </ThemedSecondaryView>
          )}
        </View>
      </Modal>
    </View>
  );
}
