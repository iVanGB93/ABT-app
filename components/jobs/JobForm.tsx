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
  Modal,
} from 'react-native';
import { useSelector } from 'react-redux';
import SelectDropdown from 'react-native-select-dropdown';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

import { RootState, useAppDispatch } from '@/app/(redux)/store';
import { ThemedText } from '@/components/ThemedText';
import { commonStyles } from '@/constants/commonStyles';
import {
  darkMainColor,
  darkTextColor,
  jobImageDefault,
  lightMainColor,
  lightTextColor,
} from '@/settings';
import { setJobMessage } from '@/app/(redux)/jobSlice';
import CustomAddress from '../CustomAddress';
import { ThemedSecondaryView } from '../ThemedSecondaryView';
import { commonStylesForm } from '@/constants/commonStylesForm';
import { useClients, useJobActions } from '@/hooks';

interface JobFormProps {
  action?: any;
}

interface Errors {
  client?: string;
  description?: string;
  address?: string;
  price?: string;
}

export default function JobForm({ action }: JobFormProps) {
  const { color, darkTheme, business } = useSelector((state: RootState) => state.settings);
  const { userName } = useSelector((state: RootState) => state.auth);
  const { clients } = useSelector((state: RootState) => state.client);
  const { job } = useSelector((state: RootState) => state.job);
  const [clientsNames, setClientsNames] = useState<any[]>([]);
  const [client, setClient] = useState<any | undefined>(); // objeto cliente seleccionado
  const [clientSelected, setClientSelected] = useState<string | undefined>(); // "Nombre Apellido"
  const [description, setDescription] = useState(action === 'new' ? '' : job.description);
  const [address, setAddress] = useState(action === 'new' ? '' : job.address);
  const [address2, setAddress2] = useState(action === 'new' ? '' : job.address2);
  const [price, setPrice] = useState(action === 'new' ? '' : job.price);
  const [image, setImage] = useState(
    action === 'new' ? jobImageDefault : { uri: job.image ? job.image : jobImageDefault },
  );
  const [error, setError] = useState('');
  const [imageModalVisible, setImageModalVisible] = useState(false);

  const [errors, setErrors] = useState<Errors>({});
  const [isEnabled, setIsEnabled] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { clientId, clientName } = useLocalSearchParams<{
    clientId?: string;
    clientName?: string;
  }>();

  const { refresh: refreshClients } = useClients();
  const { createUpdateJob } = useJobActions();

  const handleImageOptions = () => setImageModalVisible(true);

  const getClients = async () => {
    try {
      await refreshClients();
      Vibration.vibrate(15);
    } catch (error) {
      Vibration.vibrate(60);
      setError('Error al obtener clientes');
    }
  };

  // Normaliza un nombre completo para comparar
  const normalizeFullName = (full?: string) =>
    (full ?? '').trim().replace(/\s+/g, ' ').toLowerCase();

  // Devuelve el cliente seleccionado buscando por nombre+apellido
  const getSelectedClient = () => {
    const target = typeof clientSelected === 'string' ? clientSelected : '';
    const normalized = normalizeFullName(target);
    return clients.find(
      (c: any) => normalizeFullName(`${c?.name ?? ''} ${c?.last_name ?? ''}`) === normalized,
    );
  };

  // Carga/actualiza lista de nombres y sincroniza el cliente seleccionado si existe
  useEffect(() => {
    if (action === 'new' && clients.length === 0) {
      getClients();
    } else {
      const list = clients.map(
        (item: { name: string; last_name: string }) => `${item.name} ${item.last_name}`,
      );
      setClientsNames(list);
      // si ya hay seleccionado por nombre, sincroniza el objeto cliente
      if (clientSelected) {
        const found = getSelectedClient();
        setClient(found);
      }
    }
  }, [clients]);

  // Preselección desde params (nombre) al venir de Client
  useEffect(() => {
    if (action === 'new' && clientName && typeof clientName === 'string') {
      setClientSelected(clientName);
    }
  }, [action, clientName]);

  // Cuando cambia el nombre seleccionado o el listado, sincroniza el objeto cliente
  useEffect(() => {
    const found = getSelectedClient();
    setClient(found);
    // si el switch está activo, actualiza la dirección automáticamente
    if (isEnabled && found?.address) {
      setAddress(found.address);
      setAddress2(found.address2);
    }
  }, [clientSelected, clients, isEnabled]);

  const toggleSwitch = () => {
    const nextEnabled = !isEnabled;
    setIsEnabled(nextEnabled);
    if (nextEnabled) {
      // al activar, usa la dirección del cliente si existe
      const found = getSelectedClient();
      if (found?.address && found.address.trim() !== '') {
        setAddress(found.address);
      }
    }
    // al desactivar, mantiene la dirección actual para que el usuario pueda editarla
  };

  // Devuelve la dirección del cliente seleccionado o mensajes adecuados
  const clientAddress = () => {
    const found = client ?? getSelectedClient();
    if (!found) return 'no client selected';
    const addr = (found.address ?? '').toString().trim();
    return addr ? addr : 'no address saved';
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
    if (!price) errors.price = 'Price is required';
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    try {
      const formData = new FormData();
      formData.append('action', action);
      formData.append('id', job.id);
      formData.append('name', client ? client.name : '');
      formData.append('business', business.name);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('address', address);
      formData.append('address2', address2);
      // Siempre agregar imagen al FormData (puede ser string o asset)
      if (image !== null && typeof image !== 'string' && image.uri) {
        const uriParts = image.uri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        const fileName = `${job.client}JobPicture.${fileType}`;
        formData.append('image', {
          uri: image.uri,
          name: fileName,
          type: `image/${fileType}`,
        } as unknown as Blob);
      }
      const result = await createUpdateJob(formData);
      if (result) {
        Vibration.vibrate(15);
        dispatch(setJobMessage('Job ' + (action === 'new' ? 'created' : 'updated') + ' successfully'));
        router.navigate('/(app)/(jobs)');
      } else {
        const errorMsg = `Error ${action === 'new' ? 'creating' : 'updating'} job`;
        setError(errorMsg);
        Vibration.vibrate(60);
      }
    } catch (error) {
      Vibration.vibrate(60);
      console.error('Error creating/updating job:', error);
      setError(`Error ${action === 'new' ? 'creating' : 'updating'} job`);
    }
  };

  return (
    <View>
      {error && (
        <ThemedText style={commonStyles.errorMsg}>
          {error}
        </ThemedText>
      )}
      {action === 'new' ? (
        <>
          <ThemedText type="subtitle">Client</ThemedText>
          <View style={{ flexDirection: 'row' }}>
            <SelectDropdown
              data={clientsNames}
              defaultValue={clientSelected}
              onSelect={(selectedItem: string) => {
                setClientSelected(selectedItem); // sincroniza nombre; efectos actualizan objeto y address si corresponde
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
                      {selectedItem || clientSelected || 'Select the client'}
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
              <Ionicons name="person-add-outline" color={darkTheme ? '#fff' : '#000'} size={28} />
            </TouchableOpacity>
          </View>
          {errors.client ? <Text style={commonStyles.errorMsg}>{errors.client}</Text> : null}
        </>
      ) : null}
      <ThemedText style={commonStylesForm.label} type="subtitle">
        Description
      </ThemedText>
      <View
        style={[commonStylesForm.action, { borderBottomColor: darkTheme ? '#f2f2f2' : '#000' }]}
      >
        <Ionicons name="text" color={darkTheme ? darkTextColor : lightTextColor} />
        <TextInput
          style={[
            commonStylesForm.textInput,
            { color: darkTheme ? darkTextColor : lightTextColor },
          ]}
          placeholder={description ? description : "Enter job's description"}
          placeholderTextColor={darkTheme ? darkTextColor : lightTextColor}
          value={description}
          onChangeText={setDescription}
        />
      </View>
      {errors.description ? <Text style={commonStyles.errorMsg}>{errors.description}</Text> : null}

      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <ThemedText style={commonStylesForm.label} type="subtitle">
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
            <ThemedText>use client's address</ThemedText>
            <Switch
              trackColor={{ false: '#3e3e3e', true: '#3e3e3e' }}
              thumbColor={isEnabled ? color : darkTheme ? lightMainColor : darkMainColor}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleSwitch}
              value={isEnabled}
            />
          </View>
        )}
      </View>
      {isEnabled ? (
        <View
          style={[commonStylesForm.action, { borderBottomColor: darkTheme ? '#f2f2f2' : '#000' }]}
        >
          <Ionicons name="location" color={darkTheme ? darkTextColor : lightTextColor} />
          <ThemedText style={[commonStylesForm.textInput, { marginLeft: 10, height: 26 }]}>
            {clientAddress()}
          </ThemedText>
        </View>
      ) : (
        <View
          style={[commonStylesForm.action, { borderBottomColor: darkTheme ? '#f2f2f2' : '#000' }]}
        >
          <Ionicons name="location" color={darkTheme ? darkTextColor : lightTextColor} />
          <CustomAddress
            placeholder={address ? address : 'Job address'}
            address={address}
            setAddress={setAddress}
          />
        </View>
      )}
      {errors.address ? <Text style={commonStyles.errorMsg}>{errors.address}</Text> : null}
      <View
        style={[
          commonStylesForm.action,
          { borderBottomColor: darkTheme ? '#f2f2f2' : '#000', marginBottom: 5, marginTop: 10 },
        ]}
      >
        <Ionicons
          style={{ marginBottom: 5, fontSize: 16 }}
          name='duplicate'
          color={darkTheme ? darkTextColor : lightTextColor}
        />
        <TextInput
          style={[
            commonStylesForm.textInput,
            { color: darkTheme ? darkTextColor : lightTextColor },
          ]}
          placeholder={address2 ? address2 : "apt, suit, etc"}
          placeholderTextColor={darkTheme ? darkTextColor : lightTextColor}
          value={address2}
          onChangeText={setAddress2}
        />
      </View>
      <ThemedText style={[commonStylesForm.label, { marginTop: 5 }]} type="subtitle">
        Price
      </ThemedText>
      <View
        style={[commonStylesForm.action, { borderBottomColor: darkTheme ? '#f2f2f2' : '#000' }]}
      >
        <Ionicons name="cash-outline" color={darkTheme ? darkTextColor : lightTextColor} />
        <TextInput
          style={[
            commonStylesForm.textInput,
            { color: darkTheme ? darkTextColor : lightTextColor },
          ]}
          placeholder={price ? String(price) : "Enter job's price"}
          placeholderTextColor={darkTheme ? darkTextColor : lightTextColor}
          value={price}
          onChangeText={(text) => setPrice(text.replace(',', '.'))}
          keyboardType="numeric"
        />
      </View>
      {errors.price ? <Text style={commonStyles.errorMsg}>{errors.price}</Text> : null}
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
          marginTop: 20,
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
              {action === 'new' ? 'Add Photo' : 'Change Photo'}
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
