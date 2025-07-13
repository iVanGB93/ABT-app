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
import { businessSetMessage } from "@/app/(redux)/businessSlice";
import { setBusiness } from "@/app/(redux)/settingSlice";
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import BusinessForm from "@/components/business/BusinessForm";
/* import PhoneInput from 'react-native-phone-number-input'; */


interface Errors {
    name?: string;
    description?: string;
    phone?: string;
    email?: string;
    address?: string;
}

export default function businessSettings() {
    const {color, darkTheme, business } = useSelector((state: RootState) => state.settings);
    const {userName } = useSelector((state: RootState) => state.auth);  
    const [owners, setOwners] = useState<string[]>(business.owners || []);
    const [name, setName] = useState(business.name);
    const [description, setDescription] = useState(business.description);
    const [phone, setPhone] = useState(business.phone);
    const [email, setEmail] = useState(business.email);
    const [address, setAddress] = useState(business.address);
    const [image, setImage] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [errors, setErrors] = useState<Errors>({});
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const dispatch = useAppDispatch();

    const validateForm = () => {
        let errors: Errors = {};
        //if (!name) errors.name = "Name is required";
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
            const onlyEmails = owners.filter(o => o.includes('@'));
            formData.append('owners', JSON.stringify(onlyEmails));
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
                } as unknown as Blob);
            }
            setIsLoading(true);
            await axiosInstance
            .post(`business/update/${userName}/`, formData,
            { headers: {
                'content-Type': 'multipart/form-data',
            }})
            .then(function(response) {
                if (response.status === 200) {
                    console.log(response.data.business);
                    
                    dispatch(businessSetMessage(response.data.message));
                    dispatch(setBusiness(response.data.business));
                    router.navigate('/(app)/(business)/businessDetails');
                }
                setError(response.data.message)
                setIsLoading(false);
            })
            .catch(function(error) {
                console.error('Error updating your business:', error.config);
                setIsLoading(false);
                setError(error.message);
            });
            };
    };

    const handleDelete = async () => {
        setIsLoading(true);
        const formData = new FormData();
        formData.append('action', 'delete');
        await axiosInstance
        .post(`business/delete/${business.id}/`, formData,
        { headers: {
            'content-Type': 'multipart/form-data',
        }})
        .then(function(response) {
            if (response.status === 200) {
                dispatch(setBusiness({}));
                router.navigate('/(businessSelect)');
            }
            setError(response.data.message)
            setIsLoading(false);
        })
        .catch(function(error) {
            console.error('Error deleting the business:', error.config);
            setIsLoading(false);
            setError(error.message);
        });
        };

    return (
        <KeyboardAvoidingView
            behavior="padding"
            keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
            style={[styles.container, {backgroundColor: darkTheme ? darkMainColor : lightMainColor}]}
        >
            { isLoading ?
            <ActivityIndicator style={styles.loading} size="large" />
            :
            <ScrollView 
                keyboardShouldPersistTaps={'handled'}
                contentContainerStyle={{ flexGrow: 1 }}
            >
                <ThemedSecondaryView style={styles.form}>
                    <BusinessForm
                        owners={owners}
                        setOwners={setOwners}
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
                    <View style={{width: '100%', flexDirection: 'row',justifyContent: 'space-evenly', marginTop: 15}}>
                        <TouchableOpacity style={[styles.button, {borderColor: color}]} onPress={() => handleSubmit()}>
                            <ThemedText type="subtitle" style={{color: color}}>Update</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, {borderColor: 'red'}]} onPress={() => router.back()}>
                            <ThemedText type="subtitle" style={{color: 'red'}}>Cancel</ThemedText>
                        </TouchableOpacity>
                    </View>
                </ThemedSecondaryView>
                <View style={{width: '100%', flexDirection: 'row',justifyContent: 'space-evenly', marginTop: 15}}>
                    <TouchableOpacity style={[styles.button, {borderColor: 'red'}]} onPress={() => handleDelete()}>
                        <ThemedText type="subtitle" style={{color: 'red'}}>Delete</ThemedText>
                    </TouchableOpacity>
                </View>
            </ScrollView>
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