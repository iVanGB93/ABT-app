import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  ScrollView,
} from "react-native";
import { useSelector } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from "expo-router";

import axiosInstance from '@/axios';
import { RootState, useAppDispatch } from "@/app/(redux)/store";
import { baseImageURL, darkMainColor, lightMainColor } from "@/settings.js";
import { ThemedSecondaryView } from "@/components/ThemedSecondaryView";
import { ThemedText } from "@/components/ThemedText";
import { setJobMessage } from "@/app/(redux)/jobSlice";
import JobForm from "@/components/jobs/JobForm";
import { commonStyles } from "@/constants/commonStyles";
import { commonStylesForm } from "@/constants/commonStylesForm";


interface Errors {
    client?: string;
    description?: string;
    address?: string;
    price?: string;
};

export default function JobUpdate() {
    const {color, darkTheme } = useSelector((state: RootState) => state.settings);
    const {userName } = useSelector((state: RootState) => state.auth);
    const { job } = useSelector((state: RootState) => state.job);
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
                    dispatch(setJobMessage(response.data.message));
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
            style={[commonStyles.container, { backgroundColor: darkTheme ? darkMainColor : lightMainColor}]}
        >
            { isLoading ?
            <ActivityIndicator style={commonStyles.loading} size="large" />
            :
            <ThemedSecondaryView style={[commonStylesForm.form, {shadowColor: darkTheme ? '#fff' : '#000'}]}>
                <ScrollView 
                    keyboardShouldPersistTaps={'handled'}
                    contentContainerStyle={{ flexGrow: 1 }}
                >
                    <ThemedText style={[commonStylesForm.label, {marginBottom: 5}]}>Job for {job.client}</ThemedText>
                    <JobForm
                        clientsNames={null}
                        setClient={null}
                        description={description}
                        setDescription={setDescription}
                        address={address}
                        setAddress={setAddress}
                        price={price}
                        setPrice={setPrice}
                        errors={errors}
                        isEnabled={null}
                        toggleSwitch={null}
                        clientAddress={null}
                        isUpdate={true}
                    />
                    {image && <Image source={{ uri: image.uri }} style={commonStyles.image} />}
                    <View style={{width: '100%', flexDirection: 'row',justifyContent: 'space-evenly', marginTop: 15}}>
                        <TouchableOpacity style={[commonStyles.button, {borderColor: color, backgroundColor: darkTheme ? darkMainColor : lightMainColor}]} onPress={() => handleImage()}>
                            <ThemedText style={{color: color}}>Add image</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity style={[commonStyles.button, {borderColor: color, backgroundColor: darkTheme ? darkMainColor : lightMainColor}]} onPress={() => takePhoto()}>
                            <ThemedText style={{color: color}}>Take Photo</ThemedText>
                        </TouchableOpacity>
                    </View>
                    <View style={{width: '100%', flexDirection: 'row',justifyContent: 'space-evenly', marginTop: 15}}>
                        <TouchableOpacity style={[commonStyles.button, {borderColor: color, backgroundColor: darkTheme ? darkMainColor : lightMainColor}]} onPress={() => handleSubmit()}>
                            <ThemedText style={{color: color}}>Update</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity style={[commonStyles.button, {borderColor: 'red', backgroundColor: darkTheme ? darkMainColor : lightMainColor}]} onPress={() => router.back()}>
                            <ThemedText style={{color: 'red'}}>Cancel</ThemedText>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </ThemedSecondaryView>
            }
        </KeyboardAvoidingView>
    )
};