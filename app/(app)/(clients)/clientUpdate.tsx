import React, { useState } from "react";
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
} from "react-native";
import axiosInstance from '@/axios';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from "@expo/vector-icons";
import { RootState, useAppDispatch } from "@/app/(redux)/store";
import { useSelector } from "react-redux";
import { useRouter } from "expo-router";
import { baseImageURL, darkMainColor, darkTtextColor, lightMainColor, lightTextColor } from "@/settings";
import { ThemedView } from "@/components/ThemedView";
import { ThemedSecondaryView } from "@/components/ThemedSecondaryView";
import { ThemedText } from "@/components/ThemedText";
import { commonStyles } from "@/constants/commonStyles";
import { clientSetMessage, setClient } from "@/app/(redux)/clientSlice";


interface Errors {
    name?: string;
    lastName?: string;
    phone?: string;
    email?: string;
    address?: string;
}

export default function ClientUpdate() {
    const {color, darkTheme } = useSelector((state: RootState) => state.settings);
    const {userName } = useSelector((state: RootState) => state.auth);
    const { client } = useSelector((state: RootState) => state.client);
    const [name, setName] = useState(client.name);
    const [lastName, setLastName] = useState(client.last_name);
    const [phone, setPhone] = useState(client.phone);
    const [email, setEmail] = useState(client.email);
    const [address, setAddress] = useState(client.address);
    const [image, setImage] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [errors, setErrors] = useState<Errors>({});
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const dispatch = useAppDispatch();

    const validateForm = () => {
        let errors: Errors = {};
        if (!name) errors.name = "Name is required";
        setErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
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
        };
        let result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });
        if (!result.canceled) {
            setImage(result.assets[0].uri);
        };
    };

    const handleSubmit = async () => {
        if (validateForm()) {
            const formData = new FormData();
            formData.append('action', 'update');
            formData.append('id', client.id);
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
            .post(`clients/update/${userName}/`, formData,
            { headers: {
                'content-Type': 'multipart/form-data',
            }})
            .then(function(response) {
                let data = response.data;
                if (data.OK) {
                    dispatch(setClient(data.client));
                    dispatch(clientSetMessage(data.message));
                    router.push('/(app)/(clients)/clientDetails');
                }
                setError(response.data.message)
                setIsLoading(false);
            })
            .catch(function(error) {
                console.error('Error updating a client:', error.config);
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
            <ThemedSecondaryView style={styles.form}>
                <ScrollView>
                    <ThemedText type="subtitle">Name</ThemedText>
                    <View style={commonStyles.action}>
                        <Ionicons name="person" color={darkTheme ? darkTtextColor: lightTextColor} />
                        <TextInput
                            style={[commonStyles.textInput, {color: darkTheme ? darkTtextColor: lightTextColor}]}
                            placeholder={name ? name : "Enter client's name"}
                            placeholderTextColor={darkTheme ? darkTtextColor: lightTextColor}
                            value={name}
                            onChangeText={setName}
                        />
                    </View>
                    {errors.name ? (
                        <Text style={styles.errorText}>{errors.name}</Text>
                    ) : null}
                    <ThemedText style={commonStyles.text_action} type="subtitle">Last Name</ThemedText>
                    <View style={commonStyles.action}>
                        <Ionicons name="person-add" color={darkTheme ? darkTtextColor: lightTextColor} />
                        <TextInput
                            style={[commonStyles.textInput, {color: darkTheme ? darkTtextColor: lightTextColor}]}
                            placeholder={lastName ? lastName : "Enter client's last name"}
                            placeholderTextColor={darkTheme ? darkTtextColor: lightTextColor}
                            value={lastName}
                            onChangeText={setLastName}
                        />
                    </View>
                    {errors.lastName ? (
                        <Text style={styles.errorText}>{errors.lastName}</Text>
                    ) : null}
                    <ThemedText style={commonStyles.text_action} type="subtitle">Phone</ThemedText>
                    <View style={commonStyles.action}>
                        <Ionicons name="phone-portrait-sharp" color={darkTheme ? darkTtextColor: lightTextColor} />
                        <TextInput
                            style={[commonStyles.textInput, {color: darkTheme ? darkTtextColor: lightTextColor}]}
                            placeholder="Enter client's phone"
                            placeholderTextColor={darkTheme ? darkTtextColor: lightTextColor}
                            value={phone}
                            onChangeText={setPhone}
                        />
                    </View>
                    {errors.phone ? (
                        <Text style={styles.errorText}>{errors.phone}</Text>
                    ) : null}

                    <ThemedText style={commonStyles.text_action} type="subtitle">Email</ThemedText>
                    <View style={commonStyles.action}>
                        <Ionicons name="mail" color={darkTheme ? darkTtextColor: lightTextColor} />
                        <TextInput
                            style={[commonStyles.textInput, {color: darkTheme ? darkTtextColor: lightTextColor}]}
                            placeholder="Enter client's email"
                            placeholderTextColor={darkTheme ? darkTtextColor: lightTextColor}
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                        />
                    </View>
                    {errors.email ? (
                        <Text style={styles.errorText}>{errors.email}</Text>
                    ) : null}
                    
                    <ThemedText style={commonStyles.text_action} type="subtitle">Address</ThemedText>
                    <View style={commonStyles.action}>
                        <Ionicons name="location" color={darkTheme ? darkTtextColor: lightTextColor} />
                        <TextInput
                            style={[commonStyles.textInput, {color: darkTheme ? darkTtextColor: lightTextColor}]}
                            placeholder="Enter client's address"
                            placeholderTextColor={darkTheme ? darkTtextColor: lightTextColor}
                            value={address}
                            onChangeText={setAddress}
                        />
                    </View>
                    {errors.address ? (
                        <Text style={styles.errorText}>{errors.address}</Text>
                    ) : null}

                    {image ?
                    <Image source={{ uri: image }} style={styles.image} />
                    :
                    <Image source={{ uri: baseImageURL + client.image }} style={styles.image} />
                    }
                    <View style={{width: '100%', flexDirection: 'row',justifyContent: 'space-evenly', marginTop: 15}}>
                        <TouchableOpacity style={[styles.button, {borderColor: color}]} onPress={() => handleImage()}>
                            <ThemedText type="subtitle" style={{color: color}}>Add image</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, {borderColor: color}]} onPress={() => takePhoto()}>
                            <ThemedText type="subtitle" style={{color: color}}>Take Photo</ThemedText>
                        </TouchableOpacity>
                    </View>
                    <View style={{width: '100%', flexDirection: 'row',justifyContent: 'space-evenly', marginTop: 15}}>
                        <TouchableOpacity style={[styles.button, {borderColor: color}]} onPress={() => handleSubmit()}>
                            <ThemedText type="subtitle" style={{color: color}}>Update</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, {borderColor: 'red'}]} onPress={() => router.back()}>
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
      padding: 20,
      borderRadius: 10,
      shadowColor: "#fff",
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
        borderRadius: 75,
        margin: 10,
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
        marginTop: 5,
    },
});