import React, { useState, useEffect } from 'react';
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
import { useSelector } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import {
  baseImageURL,
  darkMainColor,
  darkTtextColor,
  lightMainColor,
  lightTextColor,
} from '@/settings';
import { RootState, useAppDispatch } from '@/app/(redux)/store';
import { ThemedSecondaryView } from '@/components/ThemedSecondaryView';
import { ThemedText } from '@/components/ThemedText';
import { commonStyles } from '@/constants/commonStyles';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axiosInstance from '@/axios';

interface Errors {
  description?: string;
  amount?: string;
}

interface ExtraFormProps {
  description?: any;
  setDescription?: any;
  amount?: any;
  setAmount?: any;
  image: any;
  setImage?: any;
  type: string;
  action: string;
  isLoading: boolean;
  setIsLoading: any;
  id?: any;
}

export default function ExtraForm({
  description,
  setDescription,
  amount,
  setAmount,
  image,
  setImage,
  type,
  action,
  isLoading,
  setIsLoading,
  id= '',
}: ExtraFormProps) {
  const { color, darkTheme, business } = useSelector((state: RootState) => state.settings);
  const [isEnabled, setIsEnabled] = useState<any>(false);
  const [formImage, setFormImage] = useState<any>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [error, setError] = useState('');
  const imageObj = baseImageURL + image;
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      setFormImage(result.assets[0]);
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
    if (!result.canceled) {
      setFormImage(result.assets[0]);
    }
  };

  const validateForm = () => {
    let errors: Errors = {};
    if (!description) errors.description = 'Description is required';
    if (!amount) errors.amount = 'Amount is required';
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('action', action);
      formData.append('id', id);
      formData.append('type', type);
      formData.append('description', description);
      formData.append('amount', amount);
      if (formImage !== null) {
        const uriParts = formImage.uri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        const fileName = `${description}${type}Picture.${fileType}`;
        formData.append('image', {
          uri: formImage.uri,
          name: fileName,
          type: `image/${fileType}`,
        } as unknown as Blob);
      }
      await axiosInstance
        .post(`business/extras/${business.name}/`, formData, {
          headers: {
            'content-Type': 'multipart/form-data',
          },
        })
        .then(function (response) {
          let data = response.data;
          if (data.OK) {
            router.replace('/(app)/(business)/businessDetails');
          }
          setIsLoading(false);
        })
        .catch(function (error) {
          console.error('Error creating a expense:', error);
          /* dispatch({
                    type: CHANGE_ERROR,
                    payload: error.message
                }) */
          setIsLoading(false);
        });
    }
  };

  return (
    <View>
      <ThemedText style={commonStyles.text_action} type="subtitle">
        Description
      </ThemedText>
      <View style={[commonStyles.action, { borderBottomColor: darkTheme ? '#f2f2f2' : '#000' }]}>
        <Ionicons name="text" color={darkTheme ? darkTtextColor : lightTextColor} />
        <TextInput
          style={[commonStyles.textInput, { color: darkTheme ? darkTtextColor : lightTextColor }]}
          placeholder={description ? description : `Enter ${type}'s description`}
          placeholderTextColor={darkTheme ? darkTtextColor : lightTextColor}
          value={description}
          onChangeText={setDescription}
        />
      </View>
      {errors.description ? <Text style={commonStyles.errorMsg}>{errors.description}</Text> : null}
      <ThemedText style={commonStyles.text_action} type="subtitle">
        Amount
      </ThemedText>
      <View style={[commonStyles.action, { borderBottomColor: darkTheme ? '#f2f2f2' : '#000' }]}>
        <Ionicons name="cash-outline" color={darkTheme ? darkTtextColor : lightTextColor} />
        {isEnabled ? (
          <ThemedText> $ {amount}</ThemedText>
        ) : (
          <TextInput
            style={[commonStyles.textInput, { color: darkTheme ? darkTtextColor : lightTextColor }]}
            placeholder={amount ? amount.toString() : `Enter ${type}'s amount`}
            placeholderTextColor={darkTheme ? darkTtextColor : lightTextColor}
            value={amount ? amount.toString() : ''}
            onChangeText={setAmount}
            keyboardType="numeric"
          />
        )}
      </View>
      {errors.amount ? <Text style={commonStyles.errorMsg}>{errors.amount}</Text> : null}
      { formImage ? 
      <Image
        source={{ uri: formImage.uri }}
        style={commonStyles.image}
        onError={() => setFormImage(null)}
      /> : image ? (
        <Image
          source={{ uri: imageObj }}
          style={commonStyles.image}
          onError={() => setImage(null)}
        />
      ) : (
        <ThemedText style={{ alignSelf: 'center' }}>image not found </ThemedText>
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
          onPress={() => router.replace('/(app)/(business)/businessDetails')}
        >
          <ThemedText style={{ color: 'red' }}>Cancel</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}
