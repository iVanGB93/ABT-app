import React, { useEffect, useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
  Switch,
  Vibration,
  Image,
} from 'react-native';
import { useSelector } from 'react-redux';
import SelectDropdown from 'react-native-select-dropdown';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Constants from 'expo-constants';
const GOOGLE_PLACES_API_KEY = Constants.expoConfig?.extra?.googlePlacesApiKey;
import * as ImagePicker from 'expo-image-picker';

import { RootState, useAppDispatch } from '@/app/(redux)/store';
import { ThemedText } from '@/components/ThemedText';
import { commonStyles } from '@/constants/commonStyles';
import { darkMainColor, darkTtextColor, lightMainColor, lightTextColor } from '@/settings';
import axiosInstance from '@/axios';
import { setJobMessage } from '@/app/(redux)/jobSlice';
import { clientSetMessage, setClients } from '@/app/(redux)/clientSlice';
import { authLogout, authSetMessage } from '@/app/(redux)/authSlice';
import { setBusiness } from '@/app/(redux)/settingSlice';

interface JobFormProps {
  action?: any;
  isLoading?: boolean;
  setIsLoading?: any;
}

interface Errors {
  client?: string;
  description?: string;
  address?: string;
  price?: string;
}

export default function JobForm({ action, isLoading, setIsLoading }: JobFormProps) {
  const { color, darkTheme, business } = useSelector((state: RootState) => state.settings);
  const { userName } = useSelector((state: RootState) => state.auth);
  const { clients } = useSelector((state: RootState) => state.client);
  const { job } = useSelector((state: RootState) => state.job);
  const [clientsNames, setClientsNames] = useState<any[]>([]);
  const [client, setClient] = useState<any | undefined>();
  const [description, setDescription] = useState(action === 'new' ? '' : job.description);
  const [address, setAddress] = useState(action === 'new' ? '' : job.address);
  const [price, setPrice] = useState(action === 'new' ? '' : job.price);
  const [image, setImage] = useState(action === 'new' ? null : { uri: job.image });
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [isEnabled, setIsEnabled] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const getClients = async () => {
    await axiosInstance
      .get(`clients/${business.name}/`)
      .then(function (response) {
        Vibration.vibrate(15);
        if (response.data) {
          dispatch(setClients(response.data));
          setIsLoading(false);
        } else {
          dispatch(clientSetMessage(response.data.message));
          setIsLoading(false);
        }
      })
      .catch(function (error) {
        Vibration.vibrate(60);
        console.error('Error fetching clients:', error);
        if (typeof error.response === 'undefined') {
          setError(
            'A server/network error occurred. ' + 'Sorry about this - try againg in a few minutes.',
          );
        } else {
          if (error.status === 401) {
            dispatch(authSetMessage('Unauthorized, please login againg'));
            dispatch(setBusiness([]));
            dispatch(authLogout());
            router.replace('/');
          } else {
            setError('Error getting your clients.');
          }
        }
      });
  };

  useEffect(() => {
    if (action === 'new' && clients.length === 0) {
      getClients();
    } else {
      const clientsList = clients.map((item: { name: string }) => item.name);
      setClientsNames(clientsList);
    }
  }, [clients]);

  const toggleSwitch = () => {
    setIsEnabled((previousState) => !previousState);
    if (!isEnabled) {
      setAddress(clientAddress());
    } else {
      setAddress(address);
    }
  };

  const clientAddress = () => {
    let clientA = clients.find((clientA: { name: string }) => clientA.name === client);
    if (clientA !== undefined) {
      if (clientA.address === '') {
        return 'no address saved';
      }
      return clientA.address;
    } else {
      return 'no client selected';
    }
  };

  const handleImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    console.log(result);
    if (!result.canceled) {
      setImage(result.assets[0]);
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
      aspect: [4, 3],
      quality: 1,
    });
    console.log(result);
    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const validateForm = () => {
    let errors: Errors = {};
    if (action === 'new') if (!client) errors.client = 'Client is required';
    if (!description) errors.description = 'Description is required';
    //if (!address) errors.address = 'Address is required';
    if (!price) errors.price = 'Price is required';
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('action', action);
      formData.append('id', job.id);
      formData.append('name', client);
      formData.append('business', business.name);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('address', address);
      console.log(formData);
      if (image !== null) {
        const uriParts = image.uri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        const fileName = `${job.client}JobPicture.${fileType}`;
        formData.append('image', {
          uri: image.uri,
          name: fileName,
          type: `image/${fileType}`,
        } as unknown as Blob);
      }
      await axiosInstance
        .post(`jobs/${action === 'new' ? 'create' : 'update'}/${userName}/`, formData, {
          headers: {
            'content-Type': 'multipart/form-data',
          },
        })
        .then(function (response) {
          Vibration.vibrate(15);
          let data = response.data;
          if (data.OK) {
            dispatch(setJobMessage(response.data.message));
            router.push('/(app)/(jobs)');
          }
          setError(response.data.message);
          setIsLoading(false);
        })
        .catch(function (error) {
          Vibration.vibrate(60);
          console.error('Error creating a job:', error);
          setIsLoading(false);
          setError(error.message);
        });
    }
  };

  return (
    <View>
      {action === 'new' ? (
        <>
          <ThemedText type="subtitle">Client</ThemedText>
          <View style={{ flexDirection: 'row' }}>
            <SelectDropdown
              data={clientsNames}
              onSelect={(selectedItem: string, index: number) => {
                setClient(selectedItem);
              }}
              renderButton={(selectedItem, isOpened) => {
                return (
                  <View
                    style={[
                      styles.dropdownButtonStyle,
                      { borderBottomColor: darkTheme ? '#f2f2f2' : '#000' },
                    ]}
                  >
                    <ThemedText style={styles.dropdownButtonTxtStyle}>
                      {selectedItem || 'Select the client'}
                    </ThemedText>
                    <Ionicons
                      name={isOpened ? 'chevron-up' : 'chevron-down'}
                      size={26}
                      color={darkTheme ? '#fff' : '#000'}
                    />
                  </View>
                );
              }}
              renderItem={(item, index, isSelected) => {
                return (
                  <View
                    style={{
                      ...styles.dropdownItemStyle,
                      ...(isSelected && { backgroundColor: '#D2D9DF' }),
                    }}
                  >
                    <Text style={styles.dropdownItemTxtStyle}>{item}</Text>
                  </View>
                );
              }}
              showsVerticalScrollIndicator={false}
              dropdownStyle={styles.dropdownMenuStyle}
              search={true}
              searchPlaceHolder={'Type to search'}
            />
            <TouchableOpacity
              onPress={() => router.navigate('/(app)/(clients)/clientCreate')}
              style={[
                styles.buttonAdd,
                { backgroundColor: darkTheme ? darkMainColor : lightMainColor, borderColor: color },
              ]}
            >
              <Ionicons name="person-add-outline" color={color} size={28} />
            </TouchableOpacity>
          </View>
          {errors.client ? <Text style={commonStyles.errorMsg}>{errors.client}</Text> : null}
        </>
      ) : (
        <ThemedText type="subtitle">Job for {job.client}</ThemedText>
      )}
      <ThemedText style={commonStyles.text_action} type="subtitle">
        Description
      </ThemedText>
      <View style={[commonStyles.action, { borderBottomColor: darkTheme ? '#f2f2f2' : '#000' }]}>
        <Ionicons name="text" color={darkTheme ? darkTtextColor : lightTextColor} />
        <TextInput
          style={[commonStyles.textInput, { color: darkTheme ? darkTtextColor : lightTextColor }]}
          placeholder={description ? description : "Enter job's description"}
          placeholderTextColor={darkTheme ? darkTtextColor : lightTextColor}
          value={description}
          onChangeText={setDescription}
        />
      </View>
      {errors.description ? <Text style={commonStyles.errorMsg}>{errors.description}</Text> : null}

      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <ThemedText style={commonStyles.text_action} type="subtitle">
          Address
        </ThemedText>
        {action === 'update' ? null : (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              alignSelf: 'flex-end',
              alignItems: 'center',
            }}
          >
            <Switch
              trackColor={{ false: '#3e3e3e', true: '#3e3e3e' }}
              thumbColor={isEnabled ? color : darkTheme ? lightMainColor : darkMainColor}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleSwitch}
              value={isEnabled}
            />
            <ThemedText>use client's address</ThemedText>
          </View>
        )}
      </View>
      {isEnabled ? (
        <View style={[commonStyles.action, { borderBottomColor: darkTheme ? '#f2f2f2' : '#000' }]}>
          <Ionicons name="location" color={darkTheme ? darkTtextColor : lightTextColor} />
          <ThemedText style={[commonStyles.textInput, { marginLeft: 10, height: 26 }]}>
            {clientAddress()}
          </ThemedText>
        </View>
      ) : (
        <View style={[commonStyles.action, { borderBottomColor: darkTheme ? '#f2f2f2' : '#000' }]}>
          <Ionicons name="location" color={darkTheme ? darkTtextColor : lightTextColor} />
          <GooglePlacesAutocomplete
            keyboardShouldPersistTaps="always"
            predefinedPlaces={[]}
            placeholder={address ? address : 'Job address'}
            minLength={2}
            timeout={1000}
            textInputProps={{
              placeholderTextColor: darkTheme ? darkTtextColor : lightTextColor,
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
                color: darkTheme ? darkTtextColor : lightTextColor,
              },
            }}
            enablePoweredByContainer={false}
            disableScroll={true}
            listEmptyComponent={<ThemedText>No results, sorry.</ThemedText>}
          />
        </View>
      )}
      {errors.address ? <Text style={commonStyles.errorMsg}>{errors.address}</Text> : null}

      <ThemedText style={[commonStyles.text_action, { marginTop: 5 }]} type="subtitle">
        Price
      </ThemedText>
      <View style={[commonStyles.action, { borderBottomColor: darkTheme ? '#f2f2f2' : '#000' }]}>
        <Ionicons name="cash-outline" color={darkTheme ? darkTtextColor : lightTextColor} />
        <TextInput
          style={[commonStyles.textInput, { color: darkTheme ? darkTtextColor : lightTextColor }]}
          placeholder={price ? String(price) : "Enter job's price"}
          placeholderTextColor={darkTheme ? darkTtextColor : lightTextColor}
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
        />
      </View>
      {errors.price ? <Text style={commonStyles.errorMsg}>{errors.price}</Text> : null}
      {image && (
        <Image source={{ uri: image.uri }} style={[commonStyles.imageSquare, { marginTop: 10 }]} />
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
            { borderColor: color, backgroundColor: darkTheme ? darkMainColor : lightMainColor },
          ]}
          onPress={() => handleImage()}
        >
          <ThemedText style={{ color: color }}>Add image</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            commonStyles.button,
            { borderColor: color, backgroundColor: darkTheme ? darkMainColor : lightMainColor },
          ]}
          onPress={() => takePhoto()}
        >
          <ThemedText style={{ color: color }}>Take Photo</ThemedText>
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
          <ThemedText style={{ color: color }}>{action === 'new' ? 'Create' : 'Update'}</ThemedText>
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
    </View>
  );
}

const styles = StyleSheet.create({
  dropdownButtonStyle: {
    height: 40,
    borderBottomWidth: 1,
    borderRadius: 5,
    marginBottom: 5,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    color: '#fff',
    width: '80%',
  },
  dropdownButtonTxtStyle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
  },
  dropdownButtonIconStyle: {
    fontSize: 28,
    marginRight: 8,
    color: '#fff',
  },
  dropdownMenuStyle: {
    borderRadius: 8,
  },
  dropdownItemStyle: {
    width: '100%',
    flexDirection: 'row',
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dropdownItemTxtStyle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
    borderColor: '#ddd',
    borderBottomWidth: 1,
  },
  dropdownItemIconStyle: {
    fontSize: 28,
    marginRight: 8,
  },
  buttonAdd: {
    borderRadius: 10,
    width: 40,
    height: 40,
    alignContent: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 'auto',
    borderBottomWidth: 1,
    borderRightWidth: 1,
  },
});
