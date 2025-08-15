import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Text,
  ActivityIndicator,
  Switch,
  Image,
  ScrollView,
  Modal,
} from 'react-native';
import { useSelector } from 'react-redux';
import SelectDropdown from 'react-native-select-dropdown';
import * as ImagePicker from 'expo-image-picker';
import {
  darkMainColor,
  darkTextColor,
  itemImageDefault,
  lightMainColor,
  lightTextColor,
} from '@/settings';
import { RootState, useAppDispatch } from '@/app/(redux)/store';
import { ThemedSecondaryView } from '@/components/ThemedSecondaryView';
import { ThemedText } from '@/components/ThemedText';
import { commonStyles } from '@/constants/commonStyles';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { commonStylesForm } from '@/constants/commonStylesForm';
import { useItems } from '@/hooks';
import { useJobSpentActions } from '@/hooks/useJobs';

interface Errors {
  client?: string;
  description?: string;
  amount?: string;
  job?: string;
}

export default function SpentCreate() {
  const { color, darkTheme, business } = useSelector((state: RootState) => state.settings);
  const { job } = useSelector((state: RootState) => state.job);
  const { items } = useSelector((state: RootState) => state.item);
  const [item, setItem] = useState<any>({});
  const [isEnabled, setIsEnabled] = useState<any>(false);
  const [itemsName, setItemsName] = useState<any>('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  type ImageType = { uri: string } | string;
  const [image, setImage] = useState<ImageType>(itemImageDefault);
  const [errors, setErrors] = useState<Errors>({});
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { refresh: refreshItems } = useItems();
  const { createUpdateSpent } = useJobSpentActions();

  const getItems = async () => {
    setIsLoading(true);
    try {
      await refreshItems();
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching items:', error);
      setError('Error al obtener items');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (items.length === 0) {
      getItems();
    } else {
      const itemsName = items.map((item: { name: string }) => item.name);
      setItemsName(itemsName);
    }
  }, [items]);

  const handleImageOptions = () => setImageModalVisible(true);

  const toggleSwitch = () => {
    setIsEnabled((previousState: any) => !previousState);
    if (!isEnabled) {
      setDescription(item.name);
      setAmount(item.price);
      setImage(item.image ? item.image : itemImageDefault);
    } else {
      setDescription('');
      setAmount('');
      setImage(itemImageDefault);
    }
  };

  const handleSelect = (name: string) => {
    const itemList = items.filter((item: { name: string }) => item.name === name);
    setItem(itemList[0]);
    setAmount(itemList[0].price);
    setDescription(itemList[0].name);
    setImage(itemList[0].image ? itemList[0].image : itemImageDefault);
  };

  const handleImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [4, 3],
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
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [4, 3],
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
      formData.append('job_id', job.id);
      formData.append('description', description);
      formData.append('amount', amount);
      formData.append('use_item', isEnabled);
      formData.append('item_id', isEnabled ? item.id : '');
      if (image !== null && typeof image !== 'string' && image.uri) {
        const uriParts = image.uri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        const fileName = `${description}SpentPicture.${fileType}`;
        formData.append('image', {
          uri: image.uri,
          name: fileName,
          type: `image/${fileType}`,
        } as unknown as Blob);
      }
      
      try {
        const result = await createUpdateSpent(formData);
        if (result) {
          router.push('/(app)/(jobs)/jobDetails');
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error creating a spent:', error);
        setError('Error creating spent');
        setIsLoading(false);
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={100}
      style={commonStyles.container}
    >
      <ThemedView style={commonStyles.tabHeader}>
        <TouchableOpacity
          onPress={() => {
            router.back();
          }}
        >
          <Ionicons name="arrow-back" size={24} color={darkTheme ? '#fff' : '#000'} />
        </TouchableOpacity>
        <ThemedText type="subtitle">Create Spent</ThemedText>
        <ThemedText type="subtitle"></ThemedText>
      </ThemedView>
      {isLoading ? (
        <ActivityIndicator style={commonStyles.loading} color={color} size={36} />
      ) : (
        <ThemedSecondaryView
          style={[commonStylesForm.form, { shadowColor: darkTheme ? '#fff' : '#000' }]}
        >
          <ScrollView>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <ThemedText style={[styles.label, { marginBottom: 0 }]}>
              Job: {job.description}
            </ThemedText>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                alignSelf: 'center',
              }}
            >
              <ThemedText
                style={[
                  styles.label,
                  {
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                    alignSelf: 'center',
                    verticalAlign: 'middle',
                  },
                ]}
              >
                use an item
              </ThemedText>
              <Switch
                trackColor={{ false: '#767577', true: color }}
                thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={toggleSwitch}
                value={isEnabled}
              />
            </View>

            {isEnabled ? (
              <>
                <SelectDropdown
                  data={itemsName}
                  onSelect={(selectedItem: string, index: number) => {
                    handleSelect(selectedItem);
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
                          {selectedItem || 'Select the item'}
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
                {errors.job ? <Text style={styles.errorText}>{errors.job}</Text> : null}
              </>
            ) : (
              <>
                <ThemedText style={commonStylesForm.label} type="subtitle">
                  Description
                </ThemedText>
                <View
                  style={[
                    commonStylesForm.action,
                    { borderBottomColor: darkTheme ? '#f2f2f2' : '#000' },
                  ]}
                >
                  <Ionicons name="text" color={darkTheme ? darkTextColor : lightTextColor} />
                  <TextInput
                    style={[
                      commonStyles.textInput,
                      { color: darkTheme ? darkTextColor : lightTextColor },
                    ]}
                    placeholder={description ? description : "Enter job's description"}
                    placeholderTextColor={darkTheme ? darkTextColor : lightTextColor}
                    value={description}
                    onChangeText={setDescription}
                  />
                </View>
                {errors.description ? (
                  <Text style={styles.errorText}>{errors.description}</Text>
                ) : null}
              </>
            )}
            <ThemedText style={commonStylesForm.label} type="subtitle">
              Amount
            </ThemedText>
            <View
              style={[
                commonStylesForm.action,
                { borderBottomColor: darkTheme ? '#f2f2f2' : '#000' },
              ]}
            >
              <Ionicons name="cash-outline" color={darkTheme ? darkTextColor : lightTextColor} />
              {isEnabled ? (
                <ThemedText> $ {amount}</ThemedText>
              ) : (
                <TextInput
                  style={[
                    commonStyles.textInput,
                    { color: darkTheme ? darkTextColor : lightTextColor },
                  ]}
                  placeholder={amount ? amount.toString() : "Enter spent's amount"}
                  placeholderTextColor={darkTheme ? darkTextColor : lightTextColor}
                  value={amount ? amount.toString() : ''}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                />
              )}
            </View>
            {errors.amount ? <Text style={styles.errorText}>{errors.amount}</Text> : null}

            <View style={{ alignItems: 'center', marginTop: 15 }}>
              <TouchableOpacity onPress={handleImageOptions} activeOpacity={0.8}>
                <Image
                  source={{ uri: typeof image === 'string' ? image : image.uri }}
                  style={[commonStyles.imageSquare, { marginTop: 10 }]}
                />
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
                <ThemedText>Create</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  commonStyles.button,
                  {
                    borderColor: 'red',
                    backgroundColor: darkTheme ? darkMainColor : lightMainColor,
                  },
                ]}
                onPress={() => router.replace('/(app)/(jobs)/jobDetails')}
              >
                <ThemedText style={{ color: 'red' }}>Cancel</ThemedText>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </ThemedSecondaryView>
      )}
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
              'Add Photo'
            </ThemedText>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-evenly',
                marginTop: 15,
              }}
            >
              <Image
                source={{ uri: typeof image === 'string' ? image : image.uri }}
                style={commonStyles.imageSquare}
              />
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
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
  image: {
    width: 100,
    height: 80,
    marginTop: 10,
    borderRadius: 15,
    alignSelf: 'center',
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
