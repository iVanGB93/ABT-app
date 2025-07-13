import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Text,
  Platform,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import axiosInstance from '@/axios';
import * as ImagePicker from 'expo-image-picker';
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "@/app/(redux)/store";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import PhoneInput from 'react-native-phone-number-input';

import { ThemedView } from "@/components/ThemedView";
import { ThemedSecondaryView } from "@/components/ThemedSecondaryView";
import { ThemedText } from "@/components/ThemedText";
import { darkMainColor, darkTtextColor, lightMainColor, lightTextColor } from "@/settings";
import { commonStyles } from "@/constants/commonStyles";
import { clientSetMessage } from "@/app/(redux)/clientSlice";
import ClientForm from "@/components/clients/ClientForm";


interface Errors {
    name?: string;
    lastName?: string;
    phone?: string;
    email?: string;
    address?: string;
};
  
export default function ClientCreate() {
    const [name, setName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");
    const [image, setImage] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [errors, setErrors] = useState<Errors>({});
    const [isLoading, setIsLoading] = useState(false);
    const {color, darkTheme } = useSelector((state: RootState) => state.settings);
    const {userName } = useSelector((state: RootState) => state.auth);
    const dispatch = useAppDispatch()
    const router = useRouter();

    const validateForm = () => {
        let errors: Errors = {};
        if (!name) errors.name = "Name is required";
        if (email) {if (!/\S+@\S+\.\S+/.test(email)) {errors.email = "Email is invalid!"}};
        if (!address) errors.address = "Address is required";
        setErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleImage = async () => {
        let result: ImagePicker.ImagePickerResult = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });
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
            formData.append('action', 'new');
            formData.append('name', name);
            formData.append('last_name', lastName);
            formData.append('phone', phone);
            formData.append('email', email);
            formData.append('address', address);
            if (image !== null) {
                const uriParts = image.split('.');
                const fileType = uriParts[uriParts.length - 1];
                const fileName = `${name}ProfilePicture.${fileType}`;
                formData.append('image', {
                    uri: image,
                    name: fileName,
                    type: `image/${fileType}`,
                } as unknown as Blob)
            };
            setIsLoading(true);
            await axiosInstance
            .post(`clients/create/${userName}/`, formData,
            { headers: {
                'content-Type': 'multipart/form-data',
            }})
            .then(function(response) {
                let data = response.data;
                dispatch(clientSetMessage(data.message));
                if (data.OK) {
                    router.push('/(app)/(clients)');
                }
                setIsLoading(false);
            })
            .catch(function(error) {
                console.error('Error creating a client:', error);
                if (typeof error.response === 'undefined') {
                    setError("Error creating a client, undefinded");
                  } else {
                    if (error.response.status === 401) {
                        router.push('/');
                    } else {
                      setError(error.message);
                    };
                };
                setIsLoading(false);
            });
        };
    };

    return (
        <KeyboardAvoidingView
            behavior="padding"
            keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
            style={[styles.container, { backgroundColor: darkTheme ? darkMainColor : lightMainColor}]}
        >
            { isLoading ?
            <ActivityIndicator style={styles.loading} size="large" />
            :
            <ThemedSecondaryView style={[styles.form, {shadowColor: darkTheme ? '#fff' : '#000'}]}>
                <ScrollView 
                    keyboardShouldPersistTaps={'handled'}
                    contentContainerStyle={{ flexGrow: 1 }}
                >
                    <ClientForm 
                        name={name} 
                        setName={setName} 
                        lastName={lastName}
                        setLastName={setLastName} 
                        phone={phone}
                        setPhone={setPhone}
                        email={email}
                        setEmail={setEmail}
                        address={address}
                        setAddress={setAddress}
                        errors={errors}
                    />
                    {image && <Image source={{ uri: image }} style={styles.image} />}
                    <View style={{width: '100%', flexDirection: 'row',justifyContent: 'space-evenly', marginTop: 15}}>
                        <TouchableOpacity style={[styles.button, {borderColor: color, backgroundColor: darkTheme ? darkMainColor : lightMainColor}]} onPress={() => handleImage()}>
                            <ThemedText type="subtitle" style={{color: color}}>Add image</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, {borderColor: color, backgroundColor: darkTheme ? darkMainColor : lightMainColor}]} onPress={() => takePhoto()}>
                            <ThemedText type="subtitle" style={{color: color}}>Take Photo</ThemedText>
                        </TouchableOpacity>
                    </View>
                    <View style={{width: '100%', flexDirection: 'row',justifyContent: 'space-evenly', marginTop: 15}}>
                        <TouchableOpacity style={[styles.button, {borderColor: color, backgroundColor: darkTheme ? darkMainColor : lightMainColor}]} onPress={() => handleSubmit()}>
                            <ThemedText type="subtitle" style={{color: color}}>Create</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, {borderColor: 'red', backgroundColor: darkTheme ? darkMainColor : lightMainColor}]} onPress={() => router.navigate('/(app)/(clients)')}>
                            <ThemedText type="subtitle" style={{color: 'red'}}>Cancel</ThemedText>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </ThemedSecondaryView>
            }
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      paddingHorizontal: 20,
    },
    form: {
      paddingHorizontal: 20,
      paddingBottom: 20,
      borderRadius: 10,
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
      fontWeight: "bold",
    },
    input: {
      height: 40,
      borderColor: "#ddd",
      borderWidth: 1,
      marginBottom: 5,
      padding: 10,
      borderRadius: 5,
    },
    errorText: {
      color: "red",
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
        height: 100,
        margin: 10,
        borderRadius: 75,
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
        alignSelf: "center",
    },
});