import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, Image, TouchableOpacity, Modal, Vibration } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/app/(redux)/store';
import { ThemedSecondaryView } from '@/components/ThemedSecondaryView';
import { ThemedText } from '@/components/ThemedText';
import { useRouter } from 'expo-router';
import { commonStyles } from '@/constants/commonStyles';
import { darkMainColor, darkTextColor, itemImageDefault, lightMainColor, lightTextColor } from '@/settings';
import { Ionicons } from '@expo/vector-icons';
import { setItemMessage, setItem } from '@/app/(redux)/itemSlice';
import { commonStylesForm } from '@/constants/commonStylesForm';
import { useItemActions } from '@/hooks';

interface ItemFormProps {
  action?: any;
}

interface Errors {
  name?: any;
  price?: any;
  description?: any;
  amount?: any;
}

export default function ItemForm({ action }: ItemFormProps) {
  const { color, darkTheme, business } = useSelector((state: RootState) => state.settings);
  const { item, itemError } = useSelector((state: RootState) => state.item);
  const [name, setName] = useState(action === 'new' ? '' : item?.name || '');
  const [description, setDescription] = useState(action === 'new' ? '' : item?.description || '');
  const [amount, setAmount] = useState<any>(action === 'new' ? 1 : item?.amount || 1);
  const [price, setPrice] = useState<any>(action === 'new' ? '' : item?.price || '');
  const [image, setImage] = useState(
    action === 'new'
      ? itemImageDefault
      : item?.image || itemImageDefault,
  );
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();

  const { 
    createUpdateItem, 
  } = useItemActions();

  // Sync error state
  useEffect(() => {
    if (itemError) {
      setError(itemError);
    }
  }, [itemError]);

  const handleImageOptions = () => setImageModalVisible(true);

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
      try {
        let result;
        const formData = new FormData();
        formData.append('action', action);
        formData.append('id', item?.id || '');
        formData.append('name', name);
        formData.append('description', description);
        formData.append('amount', amount.toString());
        formData.append('price', price.toString());
        if (image) {
          const uriParts = image.split('.');
          const fileType = uriParts[uriParts.length - 1];
          const fileName = `${name}ItemPicture.${fileType}`;
          formData.append('image', {
            uri: image,
            name: fileName,
            type: `image/${fileType}`,
          } as unknown as Blob);
        }
        result = await createUpdateItem(formData);
        if (result) {
          Vibration.vibrate(15);
          dispatch(setItemMessage(`Item ${action === 'new' ? 'created' : 'updated'} successfully`));
          if (action === 'update') {
            dispatch(setItem(result));
          }
          router.replace('/(app)/(items)');
        } 
      } 
      catch (err: any) {
        Vibration.vibrate(60);
        console.error(`Error ${action === 'new' ? 'creating' : 'updating'} item:`, err);
      }
    }
  };

  return (
    <View>
      {error ? <Text style={commonStyles.errorMsg}>{error}</Text> : null}
      <ThemedText style={commonStylesForm.label} type="subtitle">
        Name
      </ThemedText>
      <View style={[commonStylesForm.action, { borderBottomColor: darkTheme ? '#f2f2f2' : '#000' }]}>
        <Ionicons name="person" color={darkTheme ? darkTextColor : lightTextColor} />
        <TextInput
          style={[commonStylesForm.textInput, { color: darkTheme ? darkTextColor : lightTextColor }]}
          placeholder={name ? name : "Enter item's name"}
          placeholderTextColor={darkTheme ? darkTextColor : lightTextColor}
          value={name}
          onChangeText={setName}
        />
      </View>
      {errors.name ? <Text style={commonStyles.errorMsg}>{errors.name}</Text> : null}

      <ThemedText style={commonStylesForm.label} type="subtitle">
        Description
      </ThemedText>
      <View style={[commonStylesForm.action, { borderBottomColor: darkTheme ? '#f2f2f2' : '#000' }]}>
        <Ionicons name="clipboard-outline" color={darkTheme ? darkTextColor : lightTextColor} />
        <TextInput
          style={[commonStylesForm.textInput, { color: darkTheme ? darkTextColor : lightTextColor }]}
          placeholder="Enter item's description (optional)"
          placeholderTextColor={darkTheme ? darkTextColor : lightTextColor}
          value={description}
          onChangeText={setDescription}
        />
      </View>
      {errors.description ? <Text style={commonStyles.errorMsg}>{errors.description}</Text> : null}

      <ThemedText style={commonStylesForm.label} type="subtitle">
        Amount
      </ThemedText>
      <View style={[commonStylesForm.action, { borderBottomColor: darkTheme ? '#f2f2f2' : '#000' }]}>
        <Ionicons name="layers-outline" color={darkTheme ? darkTextColor : lightTextColor} />
        <TextInput
          style={[commonStylesForm.textInput, { color: darkTheme ? darkTextColor : lightTextColor }]}
          placeholder="Enter item's amount"
          placeholderTextColor={darkTheme ? darkTextColor : lightTextColor}
          value={amount.toString()}
          onChangeText={setAmount}
          keyboardType="numeric"
        />
      </View>
      {errors.amount ? <Text style={commonStyles.errorMsg}>{errors.amount}</Text> : null}

      <ThemedText style={commonStylesForm.label} type="subtitle">
        Price
      </ThemedText>
      <View style={[commonStylesForm.action, { borderBottomColor: darkTheme ? '#f2f2f2' : '#000' }]}>
        <TextInput
          style={[commonStylesForm.textInput, { color: darkTheme ? darkTextColor : lightTextColor }]}
          placeholder="Enter item's price"
          placeholderTextColor={darkTheme ? darkTextColor : lightTextColor}
          value={price.toString()}
          onChangeText={setPrice}
          keyboardType="numeric"
        />
      </View>
      {errors.price ? <Text style={commonStyles.errorMsg}>{errors.price}</Text> : null}

      <View style={{ alignItems: 'center', marginTop: 15 }}>
        <TouchableOpacity onPress={handleImageOptions} activeOpacity={0.8}>
          <Image
            source={{ uri: typeof image === 'string' ? image ?? '' : image?.uri ?? '' }}
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
    </View>
  );
}
