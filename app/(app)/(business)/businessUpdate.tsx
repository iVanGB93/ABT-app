import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Text,
  Platform,
  ActivityIndicator, 
  Image,
  ScrollView,
  Modal,
} from "react-native";
import axiosInstance from '@/axios';
import * as ImagePicker from 'expo-image-picker';
import { RootState, useAppDispatch } from "@/app/(redux)/store";
import { useSelector } from "react-redux";
import { useRouter } from "expo-router";
import { baseImageURL, darkMainColor, darkTtextColor, lightMainColor, lightTextColor } from "@/settings";
import { ThemedSecondaryView } from "@/components/ThemedSecondaryView";
import { ThemedText } from "@/components/ThemedText";
import { businessSetMessage } from "@/app/(redux)/businessSlice";
import { commonStylesCards } from '@/constants/commonStylesCard';
import BusinessForm from "@/components/business/BusinessForm";
import { setBusiness } from "@/app/(redux)/settingSlice";


interface Errors {
    name?: string;
    description?: string;
    phone?: string;
    email?: string;
    address?: string;
}

export default function BusinessUpdate() {
    const {color, darkTheme, business } = useSelector((state: RootState) => state.settings);
    const {userName } = useSelector((state: RootState) => state.auth);
    const { businesses } = useSelector((state: RootState) => state.business);
    const [name, setName] = useState(business.name);
    const [description, setDescription] = useState(business.description);
    const [phone, setPhone] = useState(business.phone);
    const [email, setEmail] = useState(business.email);
    const [address, setAddress] = useState(business.address);
    const [image, setImage] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [errors, setErrors] = useState<Errors>({});
    const [isLoading, setIsLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const router = useRouter();
    const dispatch = useAppDispatch();

    const validateForm = () => {
        let errors: Errors = {};
        if (!name) errors.name = "Name is required";
        if (email) {if (!/\S+@\S+\.\S+/.test(email)) {errors.email = "Email is invalid!"}};
        /* if (!address) errors.address = "Address is required"; */
        setErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const deleteBusiness = async () => {
        setLoading(true);
        await axiosInstance
        .post(`business/delete/${business.id}/`, { action: 'delete'},
        { headers: {
        'content-Type': 'multipart/form-data',
        }})
        .then(function(response) {
        if (response.data.OK) {
            dispatch(businessSetMessage(response.data.message));
            router.navigate('/(app)/(business)/businessDetails');
        }
        })
        .catch(function(error) {
        setLoading(false);
        console.error('Error deleting a business:', error);
        });
    };

    const handleDelete = () => {
        console.log(business);
        
        setModalVisible(true)
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
            formData.append('id', business.id);
            formData.append('name', name);
            formData.append('description', description);
            formData.append('phone', phone);
            formData.append('email', email);
            formData.append('address', address);
            if (image !== null) {
                const uriParts = image.split('.');
                const fileType = uriParts[uriParts.length - 1];
                const fileName = `${name}BusinessLogo.${fileType}`;
                formData.append('image', {
                    uri: image,
                    name: fileName,
                    type: `image/${fileType}`,
                } as unknown as Blob)
            };
            setIsLoading(true);
            await axiosInstance
            .post(`business/update/${userName}/`, formData,
            { headers: {
                'content-Type': 'multipart/form-data',
            }})
            .then(function(response) {
                let data = response.data;
                if (data.OK) {
                    dispatch(setBusiness(data.business));
                    dispatch(businessSetMessage(data.message));
                    router.navigate('/(app)/(business)/businessDetails');
                }
                setError(response.data.message)
                setIsLoading(false);
            })
            .catch(function(error) {
                console.error('Error updating a business:', error.config);
                setIsLoading(false);
                setError(error.message);
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
                    <BusinessForm 
                        name={name} 
                        setName={setName} 
                        description={description}
                        setDescription={setDescription} 
                        phone={phone}
                        setPhone={setPhone}
                        email={email}
                        setEmail={setEmail}
                        address={address}
                        setAddress={setAddress}
                        errors={errors}
                    />
                    {image ?
                    <Image source={{ uri: image }} style={styles.image} />
                    :
                    <Image source={{ uri: baseImageURL + business.logo }} style={styles.image} />
                    }
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
                            <ThemedText type="subtitle" style={{color: color}}>Update</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, {borderColor: 'red', backgroundColor: darkTheme ? darkMainColor : lightMainColor}]} onPress={() => router.back()}>
                            <ThemedText type="subtitle" style={{color: 'red'}}>Cancel</ThemedText>
                        </TouchableOpacity>
                    </View>
                    <View style={{width: '100%', flexDirection: 'row',justifyContent: 'space-evenly', marginTop: 15}}>
                        <TouchableOpacity style={[styles.button, {borderColor: 'red', backgroundColor: darkTheme ? darkMainColor : lightMainColor}]} onPress={() => handleDelete()}>
                            <ThemedText type="subtitle" style={{color: 'red'}}>Delete</ThemedText>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </ThemedSecondaryView>
            }
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(!modalVisible)}
            >
                <View style={commonStylesCards.centeredView}>
                { loading ?
                <ActivityIndicator color={color} size="large" />
                :
                <ThemedSecondaryView style={[commonStylesCards.card, {padding: 10}]}>
                    <ThemedText style={[commonStylesCards.name, {padding: 10}]}>Do you want to delete {name}?</ThemedText>
                    <View style={[commonStylesCards.dataContainer, {padding: 10, justifyContent: 'space-evenly'}]}>
                    <TouchableOpacity
                        style={[commonStylesCards.button, {borderColor: color}]}
                        onPress={() => setModalVisible(!modalVisible)}>
                        <ThemedText style={{color: color}}>Cancel</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[commonStylesCards.button, {borderColor: 'red'}]}
                        onPress={() => deleteBusiness()}>
                        <Text style={{color:'red', textAlign: 'center'}}>DELETE</Text>
                    </TouchableOpacity>
                    </View>
                </ThemedSecondaryView>
                }
                </View>
            </Modal>
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