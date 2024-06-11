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
import { ImagePickerAsset } from 'expo-image-picker';
import { ThemedView } from "@/components/ThemedView";

interface Errors {
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
};
  
export default function ClientCreate() {
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");
    const [image, setImage] = useState<ImagePickerAsset | null>(null);
    const [error, setError] = useState("");
    const [errors, setErrors] = useState<Errors>({});
    const [isLoading, setIsLoading] = useState(false);
    const {color } = useSelector((state: RootState) => state.settings);
    const {userName } = useSelector((state: RootState) => state.auth);
    const dispatch = useAppDispatch()
    const router = useRouter();

    const validateForm = () => {
        let errors: Errors = {};
        if (!name) errors.name = "Name is required";
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
        console.log(result);
        if (!result.canceled) {
            setImage(result.assets[0]);
        }
    };

    const handleSubmit = async () => {
        if (validateForm()) {
            const formData = new FormData();
            formData.append('action', 'new');
            formData.append('name', name);
            formData.append('phone', phone);
            formData.append('email', email);
            formData.append('address', address);
            if (image !== null) {
                const uriParts = image.uri.split('.');
                const fileType = uriParts[uriParts.length - 1];
                const fileName = `${name}ProfilePicture.${fileType}`;
                formData.append('image', {
                    uri: image.uri,
                    name: fileName,
                    type: `image/${fileType}`,
                } as unknown as Blob)
            };
            setIsLoading(true);
            await axiosInstance
            .post(`user/client/create/${userName}/`, formData,
            { headers: {
                'content-Type': 'multipart/form-data',
            }})
            .then(function(response) {
                let data = response.data;
                if (data.OK) {
                    router.push('/(app)/(clients)');
                }
                setError(response.data.message)
                setIsLoading(false);
            })
            .catch(function(error) {
                console.error('Error creating a client:', error.message);
                setIsLoading(false);
                setError(error.message);
            });
        };
    };

    return (
        <KeyboardAvoidingView
            behavior="padding"
            keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
            style={styles.container}
        >
            { isLoading ?
            <ActivityIndicator style={styles.loading} size="large" />
            :
            <ThemedView style={styles.form}>
                {error ? (
                    <Text style={styles.errorText}>{error}</Text>
                ) : null}
                <ScrollView>
                    <Text style={styles.label}>Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder={name ? name : "Enter client's name"}
                        value={name}
                        onChangeText={setName}
                    />
                    {errors.name ? (
                        <Text style={styles.errorText}>{errors.name}</Text>
                    ) : null}

                    <Text style={styles.label}>Phone (optional)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter client's phone"
                        value={phone}
                        onChangeText={setPhone}
                    />
                    {errors.phone ? (
                        <Text style={styles.errorText}>{errors.phone}</Text>
                    ) : null}

                    <Text style={styles.label}>Email (optional)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter client's email"
                        value={email}
                        onChangeText={setEmail}
                    />
                    {errors.email ? (
                        <Text style={styles.errorText}>{errors.email}</Text>
                    ) : null}
                    
                    <Text style={styles.label}>Address (optional)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter client's address"
                        value={address}
                        onChangeText={setAddress}
                    />
                    {errors.address ? (
                        <Text style={styles.errorText}>{errors.address}</Text>
                    ) : null}
                    
                    {image && <Image source={{ uri: image.uri }} style={styles.image} />}
                    <TouchableOpacity style={[styles.button, {backgroundColor: color}]} onPress={() => handleImage()}><Text style={[styles.headerText, {color: 'white'}]}>Add image</Text></TouchableOpacity>
                    <TouchableOpacity style={[styles.button, {backgroundColor: color}]} onPress={() => takePhoto()}><Text style={[styles.headerText, {color: 'white'}]}>Take Photo</Text></TouchableOpacity>
                    <TouchableOpacity style={[styles.button, {backgroundColor: color}]} onPress={() => handleSubmit()}><Text style={[styles.headerText, {color: 'white'}]}>Save</Text></TouchableOpacity>
                </ScrollView>
            </ThemedView>
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
      backgroundColor: "#f0f0f0",
      padding: 20,
      borderRadius: 10,
      shadowColor: "#ffffff",
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
        width: 150,
        height: 150,
        borderRadius: 75,
        alignSelf: 'center',
    },
    button: {
        padding: 10,
        borderRadius: 16,
        margin: 5,
        ...Platform.select({
            ios: {
            shadowOffset: { width: 2, height: 2 },
            shadowColor: "#333",
            shadowOpacity: 0.3,
            shadowRadius: 4,
            },
            android: {
            elevation: 5,
            },
        }),
    },
    headerText: {
        fontSize: 16,
        fontWeight: 'bold',
        alignSelf: "center",
        marginTop: 5,
    },
});