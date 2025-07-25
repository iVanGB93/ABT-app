import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Image, Switch } from 'react-native';
import { useSelector } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import {
  baseImageURL,
  darkMainColor,
  darkSecondColor,
  darkTtextColor,
  lightMainColor,
  lightSecondColor,
  lightTextColor,
} from '@/settings';
import { RootState, useAppDispatch } from '@/app/(redux)/store';
import { ThemedText } from '@/components/ThemedText';
import { commonStyles } from '@/constants/commonStyles';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axiosInstance from '@/axios';
import SelectDropdown from 'react-native-select-dropdown';

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
  id = '',
}: ExtraFormProps) {
  const { color, darkTheme, business } = useSelector((state: RootState) => state.settings);
  const [category, setCategory] = useState<string>('other');
  const [isDeductible, setIsDeductible] = useState(true);
  const [isEnabled, setIsEnabled] = useState<any>(false);
  const [formImage, setFormImage] = useState<any>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [error, setError] = useState('');
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [3, 5],
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
      aspect: [3, 5],
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
      formData.append('category', category);
      formData.append('deductible', isDeductible.toString());
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

  const categories = [
    'Office Supplies',
    'Fuel',
    'Training',
    'Medical Insurance',
    'Marketing',
    'Travel',
    'Meals',
    'Utilities',
    'Maintenance',
    'Other',
  ];

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
      {type === 'expense' ? (
        <>
          <ThemedText style={commonStyles.text_action} type="subtitle">
            Category
          </ThemedText>
          <View style={{ marginBottom: 10 }}>
            <SelectDropdown
              data={categories}
              onSelect={(selectedItem) => setCategory(selectedItem)}
              defaultValue={category}
              renderButton={(selectedItem, isOpened) => {
                return (
                  <View
                    style={{
                      width: '100%',
                      backgroundColor: darkTheme ? darkSecondColor : lightSecondColor,
                      borderRadius: 8,
                      borderBottomWidth: 1,
                      borderRightWidth: 1,
                      borderColor: darkTheme ? '#fff' : '#000',
                      height: 40,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <ThemedText>{selectedItem || `Select ${type}'s category`}</ThemedText>
                  </View>
                );
              }}
              renderItem={(item, index, isSelected) => (
                <View
                  style={{
                    padding: 10,
                    backgroundColor: isSelected
                      ? darkTheme
                        ? darkMainColor
                        : lightMainColor
                      : darkTheme
                      ? darkSecondColor
                      : lightSecondColor,
                  }}
                >
                  <ThemedText
                    style={{
                      color: darkTheme ? darkTtextColor : lightTextColor,
                      fontSize: 16,
                    }}
                  >
                    {item}
                  </ThemedText>
                </View>
              )}
            />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <Switch
              value={isDeductible}
              onValueChange={setIsDeductible}
              thumbColor={isDeductible ? color : '#ccc'}
            />
            <ThemedText
              style={{ marginLeft: 8, color: darkTheme ? darkTtextColor : lightTextColor }}
            >
              Deductible
            </ThemedText>
          </View>
        </>
      ) : null}
      {formImage ? (
        <Image
          source={{ uri: formImage.uri }}
          style={commonStyles.imageSquare}
          onError={() => setFormImage(null)}
        />
      ) : image ? (
        <Image
          source={{ uri: image }}
          style={commonStyles.imageSquare}
          onError={() => setImage(null)}
        />
      ) : (
        <ThemedText style={{ alignSelf: 'center' }}>No image selected </ThemedText>
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
