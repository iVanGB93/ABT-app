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

export default function BusinessExpenseCreate() {
  const { color, darkTheme, business } = useSelector((state: RootState) => state.settings);
  const [isEnabled, setIsEnabled] = useState<any>(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [image, setImage] = useState<any>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
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
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      setImage(result.assets[0]);
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
      formData.append('action', 'new');
      formData.append('type', 'expense');
      formData.append('description', description);
      formData.append('amount', amount);
      if (image !== null) {
        const uriParts = image.uri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        const fileName = `${description}ExpensePicture.${fileType}`;
        formData.append('image', {
          uri: image.uri,
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
            router.push('/(app)/(business)/businessDetails');
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
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      style={[styles.container, { backgroundColor: darkTheme ? darkMainColor : lightMainColor }]}
    >
      {isLoading ? (
        <ActivityIndicator style={styles.loading} size="large" />
      ) : (
        <ThemedSecondaryView style={[styles.form, { shadowColor: darkTheme ? '#fff' : '#000' }]}>
          <ScrollView>
            <ThemedText style={commonStyles.text_action} type="subtitle">
              Description
            </ThemedText>
            <View
              style={[commonStyles.action, { borderBottomColor: darkTheme ? '#f2f2f2' : '#000' }]}
            >
              <Ionicons name="text" color={darkTheme ? darkTtextColor : lightTextColor} />
              <TextInput
                style={[
                  commonStyles.textInput,
                  { color: darkTheme ? darkTtextColor : lightTextColor },
                ]}
                placeholder={description ? description : "Enter expense's description"}
                placeholderTextColor={darkTheme ? darkTtextColor : lightTextColor}
                value={description}
                onChangeText={setDescription}
              />
            </View>
            {errors.description ? <Text style={styles.errorText}>{errors.description}</Text> : null}
            <ThemedText style={commonStyles.text_action} type="subtitle">
              Amount
            </ThemedText>
            <View
              style={[commonStyles.action, { borderBottomColor: darkTheme ? '#f2f2f2' : '#000' }]}
            >
              <Ionicons name="cash-outline" color={darkTheme ? darkTtextColor : lightTextColor} />
              {isEnabled ? (
                <ThemedText> $ {amount}</ThemedText>
              ) : (
                <TextInput
                  style={[
                    commonStyles.textInput,
                    { color: darkTheme ? darkTtextColor : lightTextColor },
                  ]}
                  placeholder={amount ? amount.toString() : "Enter expense's amount"}
                  placeholderTextColor={darkTheme ? darkTtextColor : lightTextColor}
                  value={amount ? amount.toString() : ''}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                />
              )}
            </View>
            {errors.amount ? <Text style={styles.errorText}>{errors.amount}</Text> : null}
            {image ? (
              <Image
                source={{ uri: image.uri }}
                style={styles.image}
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
                  styles.button,
                  {
                    borderColor: color,
                    backgroundColor: darkTheme ? darkMainColor : lightMainColor,
                  },
                ]}
                onPress={() => handleImage()}
              >
                <ThemedText type="subtitle" style={{ color: color }}>
                  Add image
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button,
                  {
                    borderColor: color,
                    backgroundColor: darkTheme ? darkMainColor : lightMainColor,
                  },
                ]}
                onPress={() => takePhoto()}
              >
                <ThemedText type="subtitle" style={{ color: color }}>
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
                  styles.button,
                  {
                    borderColor: color,
                    backgroundColor: darkTheme ? darkMainColor : lightMainColor,
                  },
                ]}
                onPress={() => handleSubmit()}
              >
                <ThemedText type="subtitle" style={{ color: color }}>
                  Create
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button,
                  {
                    borderColor: 'red',
                    backgroundColor: darkTheme ? darkMainColor : lightMainColor,
                  },
                ]}
                onPress={() => router.back()}
              >
                <ThemedText type="subtitle" style={{ color: 'red' }}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  form: {
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 5,
    padding: 10,
    borderRadius: 5,
  },
  errorText: {
    color: 'red',
    marginBottom: 5,
  },
  loading: {
    flex: 1,
    marginTop: 20,
    verticalAlign: 'middle',
    alignSelf: 'center',
  },
  image: {
    width: 100,
    height: 80,
    marginTop: 10,
    borderRadius: 15,
    alignSelf: 'center',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    width: 100,
    borderRadius: 10,
    borderBottomWidth: 1,
    borderRightWidth: 1,
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginTop: 5,
  },
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
});
