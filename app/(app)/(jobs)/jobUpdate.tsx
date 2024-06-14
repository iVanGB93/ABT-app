import React, { useState, useEffect } from "react";
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
import { useSelector } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import axiosInstance from '@/axios';
import { RootState, useAppDispatch } from "@/app/(redux)/store";
import { baseImageURL, darkMainColor, darkTtextColor, lightMainColor, lightTextColor } from "@/settings.js";
import { ThemedView } from "@/components/ThemedView";
import { ThemedSecondaryView } from "@/components/ThemedSecondaryView";
import { commonStyles } from "@/constants/commonStyles";
import { ThemedText } from "@/components/ThemedText";


interface Errors {
    client?: string;
    description?: string;
    address?: string;
    price?: string;
};

export default function JobUpdate() {
    const {color, darkTheme } = useSelector((state: RootState) => state.settings);
    const {userName } = useSelector((state: RootState) => state.auth);
    const { job, jobs } = useSelector((state: RootState) => state.job);
    const [description, setDescription] = useState(job.description);
    const [address, setAddress] = useState(job.address);
    const [price, setPrice] = useState(job.price);
    const [image, setImage] = useState({'uri': baseImageURL + job.image});
    const [error, setError] = useState("");
    const [errors, setErrors] = useState<Errors>({});
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const dispatch = useAppDispatch();

    const validateForm = () => {
        let errors: Errors = {};
        if (!description) errors.description = "Description is required";
        if (!address) errors.address = "Address is required";
        if (!price) errors.price = "Price is required";
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
            aspect: [4, 3],
            quality: 1,
        });
        console.log(result);
        if (!result.canceled) {
            setImage(result.assets[0]);
        }
    };

    const handleSubmit = async () => {
        if (validateForm()) {
            setIsLoading(true);
            const formData = new FormData();
            formData.append('action', 'update');
            formData.append('id', job.id);
            formData.append('description', description);
            formData.append('price', price);
            formData.append('address', address);
            if (image !== null) {
                const uriParts = image.uri.split('.');
                const fileType = uriParts[uriParts.length - 1];
                const fileName = `${job.client}JobPicture.${fileType}`;
                formData.append('image', {
                    uri: image.uri,
                    name: fileName,
                    type: `image/${fileType}`,
                } as unknown as Blob)
            };
            await axiosInstance
            .post(`jobs/update/${userName}/`, formData,
            { headers: {
                'content-Type': 'multipart/form-data',
            }})
            .then(function(response) {
                let data = response.data;
                if (data.OK) {
                    router.push('/(app)/(jobs)');
                }
                setError(response.data.message)
                setIsLoading(false);
            })
            .catch(function(error) {
                console.error('Error updating a job:', error);
                setIsLoading(false);
                setError(error.message);
            });
        }
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
                    {error ? (
                        <Text style={styles.errorText}>{error}</Text>
                    ) : null}
                    <ThemedText style={[styles.label, {marginBottom: 5}]}>Job for {job.client}</ThemedText>
                    <ThemedText style={[commonStyles.text_action, {marginTop: 5}]} type="subtitle">Description</ThemedText>
                    <View style={commonStyles.action}>
                        <Ionicons name="text" color={darkTheme ? darkTtextColor: lightTextColor} />
                        <TextInput
                            style={[commonStyles.textInput, {color: darkTheme ? darkTtextColor: lightTextColor}]}
                            placeholder={description ? description : "Enter job's description"}
                            placeholderTextColor={darkTheme ? darkTtextColor: lightTextColor}
                            value={description}
                            onChangeText={setDescription}
                        />
                    </View>
                    {errors.description ? (
                        <Text style={styles.errorText}>{errors.description}</Text>
                    ) : null}

                    <ThemedText style={commonStyles.text_action} type="subtitle">Address</ThemedText>
                    <View style={commonStyles.action}>
                        <Ionicons name="location" color={darkTheme ? darkTtextColor: lightTextColor} />
                        <TextInput
                            style={[commonStyles.textInput, {color: darkTheme ? darkTtextColor: lightTextColor}]}
                            placeholder="Enter job's address"
                            placeholderTextColor={darkTheme ? darkTtextColor: lightTextColor}
                            value={address}
                            onChangeText={setAddress}
                        />
                    </View>
                    {errors.address ? (
                        <Text style={styles.errorText}>{errors.address}</Text>
                    ) : null}
                    
                    <ThemedText style={commonStyles.text_action} type="subtitle">Price</ThemedText>
                    <View style={commonStyles.action}>
                        <Ionicons name="cash-outline" color={darkTheme ? darkTtextColor: lightTextColor} />
                        <TextInput
                            style={[commonStyles.textInput, {color: darkTheme ? darkTtextColor: lightTextColor}]}
                            placeholder={price ? price.toString() : "Enter job's price"}
                            placeholderTextColor={darkTheme ? darkTtextColor: lightTextColor}
                            value={price ? price.toString() : "0"}
                            onChangeText={setPrice}
                            keyboardType="numeric"
                        />
                    </View>
                    {errors.price ? (
                        <Text style={styles.errorText}>{errors.price}</Text>
                    ) : null}
                    
                    {image && <Image source={{ uri: image.uri }} style={styles.image} />}
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
      shadowColor: "#000",
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
        width: 200,
        height: 115,
        borderRadius: 10,
        marginVertical: 10,
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