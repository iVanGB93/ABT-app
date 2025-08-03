import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  Image,
  TouchableOpacity,
} from 'react-native';
import axiosInstance from '@/axios';
import * as ImagePicker from 'expo-image-picker';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/app/(redux)/store';
import { ThemedSecondaryView } from '@/components/ThemedSecondaryView';
import { ThemedText } from '@/components/ThemedText';
import { useRouter } from 'expo-router';
import { commonStyles } from '@/constants/commonStyles';
import { darkMainColor, darkTextColor, lightMainColor, lightTextColor } from '@/settings';
import { Ionicons } from '@expo/vector-icons';
import { setItemMessage } from '@/app/(redux)/itemSlice';
import { commonStylesForm } from '@/constants/commonStylesForm';

interface ItemFormProps {
  action?: any;
  isLoading?: boolean;
  setIsLoading?: any;
}

interface Errors {
  name?: any;
  price?: any;
  description?: any;
  amount?: any;
}

export default function ItemForm({ action, isLoading, setIsLoading }: ItemFormProps) {
  const { color, darkTheme, business } = useSelector((state: RootState) => state.settings);
  const { item } = useSelector((state: RootState) => state.item);
  const [name, setName] = useState(action === 'new' ? '' : item?.name || '');
  const [description, setDescription] = useState(action === 'new' ? '' : item?.description || '');
  const [amount, setAmount] = useState<any>(action === 'new' ? 1 : item?.amount || 1);
  const [price, setPrice] = useState<any>(action === 'new' ? '' : item?.price || '');
  const [image, setImage] = useState<string | null>(action === 'new' ? null : item?.image || null);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const dispatch = useDispatch();
  const router = useRouter();
  

  const validateForm = () => {
    let errors: Errors = {};
    if (!name) errors.name = 'Name is required';
    if (!price) errors.price = 'Price is required';
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    console.log(result);
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
    console.log(result);
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      const formData = new FormData();
      formData.append('action', action);
      formData.append('id', item.id || '');
      formData.append('name', name);
      formData.append('description', description);
      formData.append('amount', amount);
      formData.append('price', price);
      if (image !== null) {
        const uriParts = image.split('.');
        const fileType = uriParts[uriParts.length - 1];
        const fileName = `${name}ItemPicture.${fileType}`;
        formData.append('image', {
          uri: image,
          name: fileName,
          type: `image/${fileType}`,
        } as unknown as Blob);
      }
      setIsLoading(true);
      await axiosInstance
        .post(`items/${action === 'new' ? 'create' : 'update'}/${business.name}/`, formData, {
          headers: {
            'content-Type': 'multipart/form-data',
          },
        })
        .then(function (response) {
          let data = response.data;
          if (data.OK) {
            dispatch(setItemMessage(data.message));
            router.replace('/(app)/(items)');
          } else {
            setError(data.message);
          }
          setIsLoading(false);
        })
        .catch(function (error) {
          console.error('Error creating an item:', error);
          if (typeof error.response === 'undefined') {
            setError('Error creating a client, undefinded');
          } else {
            if (error.response.status === 401) {
              router.push('/');
            } else {
              setError(error.message);
            }
          }
          setIsLoading(false);
        });
    }
  };

  return (
    <View>
      {error ? <Text style={commonStyles.errorMsg}>{error}</Text> : null}
      <ThemedText style={commonStyles.text_action} type="subtitle">
        Name
      </ThemedText>
      <View style={[commonStyles.action, { borderBottomColor: darkTheme ? '#f2f2f2' : '#000' }]}>
        <Ionicons name="person" color={darkTheme ? darkTextColor : lightTextColor} />
        <TextInput
          style={[commonStyles.textInput, { color: darkTheme ? darkTextColor : lightTextColor }]}
          placeholder={name ? name : "Enter item's name"}
          placeholderTextColor={darkTheme ? darkTextColor : lightTextColor}
          value={name}
          onChangeText={setName}
        />
      </View>
      {errors.name ? <Text style={commonStyles.errorMsg}>{errors.name}</Text> : null}

      <ThemedText style={commonStyles.text_action} type="subtitle">
        Description
      </ThemedText>
      <View style={[commonStyles.action, { borderBottomColor: darkTheme ? '#f2f2f2' : '#000' }]}>
        <Ionicons name="clipboard-outline" color={darkTheme ? darkTextColor : lightTextColor} />
        <TextInput
          style={[commonStyles.textInput, { color: darkTheme ? darkTextColor : lightTextColor }]}
          placeholder="Enter item's description (optional)"
          placeholderTextColor={darkTheme ? darkTextColor : lightTextColor}
          value={description}
          onChangeText={setDescription}
        />
      </View>
      {errors.description ? <Text style={commonStyles.errorMsg}>{errors.description}</Text> : null}

      <ThemedText style={commonStyles.text_action} type="subtitle">
        Amount
      </ThemedText>
      <View style={[commonStyles.action, { borderBottomColor: darkTheme ? '#f2f2f2' : '#000' }]}>
        <Ionicons name="layers-outline" color={darkTheme ? darkTextColor : lightTextColor} />
        <TextInput
          style={[commonStyles.textInput, { color: darkTheme ? darkTextColor : lightTextColor }]}
          placeholder="Enter item's amount"
          placeholderTextColor={darkTheme ? darkTextColor : lightTextColor}
          value={amount.toString()}
          onChangeText={setAmount}
          keyboardType="numeric"
        />
      </View>
      {errors.amount ? <Text style={commonStyles.errorMsg}>{errors.amount}</Text> : null}

      <ThemedText style={commonStyles.text_action} type="subtitle">
        Price
      </ThemedText>
      <View style={[commonStyles.action, { borderBottomColor: darkTheme ? '#f2f2f2' : '#000' }]}>
        <TextInput
          style={[commonStyles.textInput, { color: darkTheme ? darkTextColor : lightTextColor }]}
          placeholder="Enter item's price"
          placeholderTextColor={darkTheme ? darkTextColor : lightTextColor}
          value={price.toString()}
          onChangeText={setPrice}
          keyboardType="numeric"
        />
      </View>
      {errors.price ? <Text style={commonStyles.errorMsg}>{errors.price}</Text> : null}

      {image && <Image source={{ uri: image }} style={[commonStyles.imageSquare, { marginTop: 15 }]} />}
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
          <ThemedText>Add image</ThemedText>
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
          <ThemedText>Take Photo</ThemedText>
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
          onPress={() => router.back()}
        >
          <ThemedText style={{ color: 'red' }}>Cancel</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}
