import React, { useEffect, useState } from 'react';
import {
  Text,
  View,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  TextInput,
  TouchableOpacity,
  Platform,
  Image,
  ScrollView,
} from 'react-native';
import { useSelector } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';

import { useAppDispatch, RootState } from '@/app/(redux)/store';
import { setBusiness, setColor } from '@/app/(redux)/settingSlice';
import { authLogout } from '@/app/(redux)/authSlice';
import axiosInstance from '@/axios';
import {
  baseImageURL,
  darkMainColor,
  darkSecondColor,
  darkTextColor,
  lightMainColor,
  lightSecondColor,
  lightTextColor,
} from '@/settings';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { commonStyles } from '@/constants/commonStyles';
import { useRouter } from 'expo-router';
import { ThemedSecondaryView } from '@/components/ThemedSecondaryView';
import { StatusBar } from 'expo-status-bar';

export default function Profile() {
  const { color, darkTheme, business } = useSelector((state: RootState) => state.settings);
  const { userName } = useSelector((state: RootState) => state.auth);
  const [newName, setNewName] = useState(business.business_name);
  const [newLogo, setNewLogo] = useState<any>(business.logo);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const dispatch = useAppDispatch();

  /* const downloadLogo = async () => {
        try {
            const files = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory!);
            console.log('Archivos en documentDirectory:', files);
            const oldLogo = FileSystem.documentDirectory + 'logo.jpeg';
            await FileSystem.deleteAsync(oldLogo);
            const fileUrl = baseImageURL + business.business_logo;
            const fileUri = FileSystem.documentDirectory + 'logo.jpeg';
            const { uri } = await FileSystem.downloadAsync(fileUrl, fileUri);
            dispatch(setBusinessLogo(uri));
        } catch (error) {
            console.error('Error al listar archivos:', error);
        }
    };
    
    const handleBN = async () => {
        setLoading(true);
        const formData = new FormData();
        formData.append('business_name', newName);
        const uriParts = newLogo.split('.');
        const fileType = uriParts[uriParts.length - 1];
        const fileName = `${userName}BusinessLogo.${fileType}`;
        formData.append('business_logo', {
            uri: newLogo,
            name: fileName,
            type: `image/${fileType}`,
        } as unknown as Blob)
        await axiosInstance
        .post(`user/account/${userName}/`, formData,
        { headers: {
            'content-Type': 'multipart/form-data',
        }})
        .then(function(response) {
            if (response.data) {
                dispatch(setBusinessName(newName));
                dispatch(setBusiness(response.data));
                dispatch(setBusinessLogo(newLogo));
                //downloadLogo();
                setLoading(false);
                router.push('/(app)/(business)/settings');
            } else {
                setError(response.data.message);
                setLoading(false);
            }
        })
        .catch(function(error) {
            console.error('Error fetching jobs:', error);
            try {
                const message = error.data.message;
                setError(message);
                setLoading(false);
            } catch(e) {
                setError("Error getting your jobs.");
                setLoading(false);
            }
        });
    };

    const handleImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });
        if (!result.canceled) {
            setNewLogo(result.assets[0].uri);
        }
    }; */

  return (
    <>
      <StatusBar style={darkTheme ? 'light' : 'dark'} />
      <KeyboardAvoidingView
        behavior="padding"
        keyboardVerticalOffset={100}
        style={[
          commonStyles.container,
          { backgroundColor: darkTheme ? darkMainColor : lightMainColor },
        ]}
      >
        <ThemedView style={commonStyles.tabHeader}>
          <TouchableOpacity
            onPress={() => {
              router.back();
            }}
          >
            <Ionicons name="arrow-back" size={24} color={darkTheme ? '#fff' : '#000'} />
          </TouchableOpacity>
          <ThemedText type="subtitle">Edit App Settings</ThemedText>
          <ThemedText type="subtitle"></ThemedText>
        </ThemedView>
        {loading ? (
          <ActivityIndicator style={commonStyles.containerCentered} size="large" />
        ) : (
          <ScrollView>
            <ThemedSecondaryView style={styles.sectionContainer}>
              {/* <View style={styles.rowContainer}>
                        { newLogo === '@/assets/images/logoDefault.png' ?
                        <Image source={require('@/assets/images/logoDefault.png')} style={[styles.image, { borderColor: color, margin: 'auto' }]} />
                        :
                        <Image source={{ uri: newLogo }} style={[styles.image, { borderColor: color, margin: 'auto' }]} />
                        //<Image source={require(businessLogo) } style={[styles.image, { borderColor: color, margin: 'auto' }]} />
                        }
                        <TouchableOpacity style={[commonStyles.button, {borderColor: color, height: 40, marginVertical: 'auto'}]} onPress={() => handleImage()}>
                            <ThemedText type="subtitle" style={{color: color}}>Select Logo</ThemedText>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.rowContainer}>
                        <TextInput autoFocus={false} onChangeText={setNewName} value={newName} style={[styles.textInput, {color:darkTheme ? 'white': 'black', width: 200, margin: 'auto'}]}/>
                        <TouchableOpacity style={[commonStyles.button, {borderColor: color, width: 100}]} onPress={() => handleBN()}>
                            <ThemedText type="subtitle" style={{color: color}}>Save</ThemedText>
                        </TouchableOpacity>
                    </View> */}
              <View style={styles.rowContainer}>
                <ThemedText type="subtitle">Pick a Color</ThemedText>
              </View>
              <View style={styles.rowContainer}>
                <View style={commonStyles.colorsContainer}>
                  <TouchableOpacity
                    style={[commonStyles.color, { backgroundColor: '#009d93' }]}
                    onPress={() => dispatch(setColor('#009d93'))}
                  ></TouchableOpacity>
                  <TouchableOpacity
                    style={[commonStyles.color, { backgroundColor: '#694fad' }]}
                    onPress={() => dispatch(setColor('#694fad'))}
                  ></TouchableOpacity>
                  <TouchableOpacity
                    style={[commonStyles.color, { backgroundColor: '#09dd' }]}
                    onPress={() => dispatch(setColor('#09dd'))}
                  ></TouchableOpacity>
                  <TouchableOpacity
                    style={[commonStyles.color, { backgroundColor: '#d02860' }]}
                    onPress={() => dispatch(setColor('#d02860'))}
                  ></TouchableOpacity>
                </View>
              </View>
              <View style={styles.rowContainerLast}>
                <View style={commonStyles.colorsContainer}>
                  <TouchableOpacity
                    style={[commonStyles.color, { backgroundColor: '#FFD700' }]}
                    onPress={() => dispatch(setColor('#FFD700'))}
                  ></TouchableOpacity>
                  <TouchableOpacity
                    style={[commonStyles.color, { backgroundColor: '#6C2EB4' }]}
                    onPress={() => dispatch(setColor('#6C2EB4'))}
                  ></TouchableOpacity>
                  <TouchableOpacity
                    style={[commonStyles.color, { backgroundColor: '#00BFFF' }]}
                    onPress={() => dispatch(setColor('#00BFFF'))}
                  ></TouchableOpacity>
                  <TouchableOpacity
                    style={[commonStyles.color, { backgroundColor: '#20CFCF' }]}
                    onPress={() => dispatch(setColor('#20CFCF'))}
                  ></TouchableOpacity>
                </View>
              </View>
            </ThemedSecondaryView>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  image: {
    width: 100,
    height: 100,
    borderWidth: 2,
    margin: 2,
    borderRadius: 15,
  },
  sectionContainer: {
    padding: 10,
    marginTop: 50,
    borderRadius: 15,
    width: '90%',
    alignItems: 'center',
    alignSelf: 'center',
  },
  header: {
    justifyContent: 'flex-end',
    paddingHorizontal: 10,
    paddingBottom: 10,
    fontWeight: 'bold',
    fontSize: 25,
  },
  textInput: {
    height: 40,
    width: '80%',
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 5,
    padding: 10,
    borderRadius: 5,
  },
  rowContainerLast: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 15,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginRight: 10,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  infoText: {
    fontSize: 25,
  },
  optionText: {
    fontSize: 22,
  },
  optionTextRight: {
    fontSize: 18,
  },
});
