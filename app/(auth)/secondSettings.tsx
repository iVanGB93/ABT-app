import React, { useEffect, useState } from 'react';
import { Text, View, ActivityIndicator, TextInput, TouchableOpacity, Platform, Image, ScrollView } from 'react-native';
import { useSelector } from "react-redux";
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import Constants from 'expo-constants';
const GOOGLE_PLACES_API_KEY = Constants.expoConfig?.extra?.googlePlacesApiKey;

import { useAppDispatch, RootState } from '@/app/(redux)/store';
import { setBusiness, setBusinessLogo, setBusinessName, setColor } from '@/app/(redux)/settingSlice';
import { commonStyles } from '@/constants/commonStyles';
import { authSetMessage } from '../(redux)/authSlice';
import axiosInstance from '@/axios';
import { baseImageURL, darkMainColor, darkSecondColor, darkThirdColor, darkTtextColor, lightMainColor, lightSecondColor, lightTextColor } from '@/settings';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
/* import PhoneInput from 'react-native-phone-input'; */


interface Errors {
    address?: string;
    phone?: string;
}

export default function SecondSettings () {
    const {token} = useSelector((state: RootState) => state.auth);
    const { authMessage, userName } = useSelector((state: RootState) => state.auth);
    const { color, businessName, darkTheme, businessLogo } = useSelector((state: RootState) => state.settings);
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [errors, setErrors] = useState<Errors>({});
    const router = useRouter();
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (authMessage) {
            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: authMessage
            })
            dispatch(authSetMessage(null));
        };
    }, [authMessage]);

    const handleImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });
        if (!result.canceled) {
            setNewBusinessLogo(result.assets[0].uri);
        }
    };

    const validateForm = () => {
        let errors: Errors = {};
        if (!address) errors.address = "Address is required!";
        if (!phone) errors.phone = "Phone is required!";
        setErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async () => {
        if (validateForm()) {
            setLoading(true);
            const formData = new FormData();
            formData.append('business_name', businessName);
            formData.append('phone', phone);
            formData.append('address', address);
            if (businessLogo !== '@/assets/images/logoDefault.png') {
                const uriParts = businessLogo.split('.');
                const fileType = uriParts[uriParts.length - 1];
                const fileName = `${userName}BusinessLogo.${fileType}`;
                formData.append('business_logo', {
                    uri: businessLogo,
                    name: fileName,
                    type: `image/${fileType}`,
                } as unknown as Blob)
            };
            await axiosInstance
            .post(`user/account/${userName}/`, formData,
            { headers: {
                'content-Type': 'multipart/form-data',
            }})
            .then(function(response) {
                if (response.data) {
                    dispatch(setBusiness(response.data));
                    setLoading(false);
                    router.push('(app)/(clients)');
                } else {
                    setError(response.data.message);
                    setLoading(false);
                }
            })
            .catch(function(error) {
                console.error('Error sending settings:', error);
                if (typeof error.response === 'undefined') {
                    setError('A server/network error occurred. ' + 'Sorry about this - try againg in a few minutes.');
                } else {
                    if (error.response.status === 401) {
                      setError("Username or Password incorrect");
                      router.push('/');
                    } else {
                      setError(error.message);
                    };
                };
                setLoading(false);
            });
        }
    };

    return (
        <ThemedView style={commonStyles.container}>
            <View style={commonStyles.header}>
                { businessLogo === '@/assets/images/logoDefault.png' ? 
                <Image style={commonStyles.image} source={require('@/assets/images/logoDefault.png')} />
                :
                <Image style={commonStyles.image} source={{uri: businessLogo}} />
                }
                <ThemedText type="title" style={[commonStyles.text_header, {textAlign: 'center'}]}>{businessName}</ThemedText>
            </View>
            <View style={[commonStyles.footer, {backgroundColor:darkTheme ? darkSecondColor: lightSecondColor, borderColor: color, flex: 4}]}>
                {loading ?
                <ActivityIndicator style={commonStyles.loading} color={color} size="large" />
                :
                <ScrollView 
                    keyboardShouldPersistTaps={'handled'}
                    contentContainerStyle={{ flexGrow: 1 }}
                >
                <ThemedText type="subtitle">Address</ThemedText>
                <View style={[commonStyles.action, { borderBottomColor: darkTheme ? '#f2f2f2' : '#000'}]}>
                    <Ionicons name="location" color={darkTheme ? darkTtextColor: lightTextColor}/>
                    <GooglePlacesAutocomplete
                        placeholder={address ? address : "Business's address"}
                        textInputProps={{
                            placeholderTextColor: darkTheme ? darkTtextColor: lightTextColor,
                        }}
                        onPress={(data, details = null) => {
                            setAddress(data.description);
                        }}
                        query={{
                            key: GOOGLE_PLACES_API_KEY,
                            language: 'en',
                        }}
                        styles={{
                            textInputContainer: {
                                height: 26,
                            },
                            textInput: {
                                height: 26,
                                color: darkTheme ? '#fff' : '#000',
                                fontSize: 16,
                                backgroundColor: 'transparent'
                            },
                            predefinedPlacesDescription: {
                                color: darkTheme ? darkTtextColor: lightTextColor,
                            },
                        }}
                        enablePoweredByContainer={false}
                        disableScroll={true}
                        listEmptyComponent={
                            <ThemedText>No results, sorry.</ThemedText>
                        }
                    />
                </View>
                {errors.address ? (
                    <Text style={commonStyles.errorMsg}>{errors.address}</Text>
                ) : null}
                <ThemedText type="subtitle" style={{marginTop: 50}}>Phone</ThemedText>
                <View style={[commonStyles.action, { borderBottomColor: darkTheme ? '#f2f2f2' : '#000'}]}>
                    <Ionicons name="phone-portrait-sharp" color={darkTheme ? darkTtextColor: lightTextColor}/>
                    {/* <PhoneInput
                        initialCountry="us"
                        style={commonStyles.textInput}
                        textProps={{placeholder: "Phone number"}}
                        autoFormat={true}
                        textStyle={{ color: darkTheme ? darkTtextColor : lightTextColor, fontSize: 18 }}
                        flagStyle={{ borderWidth: 0, marginHorizontal: 5 }}
                        onChangePhoneNumber={(phoneNumber) => setPhone(phoneNumber)}
                        initialValue={phone ? phone : ""}
                    /> */}
                </View>
                {errors.phone ? (
                    <Text style={commonStyles.errorMsg}>{errors.phone}</Text>
                ) : null}
                
                <ThemedText type='subtitle' style={{marginTop: 50}}>Change color</ThemedText>
                <View style={[commonStyles.action, { borderBottomColor: darkTheme ? '#f2f2f2' : '#000'}]}>
                    <View style={commonStyles.colorsContainer}>
                        <TouchableOpacity style={[commonStyles.color, {backgroundColor: '#009d93'}]} onPress={() => dispatch(setColor('#009d93'))}></TouchableOpacity>
                        <TouchableOpacity style={[commonStyles.color, {backgroundColor: '#694fad'}]} onPress={() => dispatch(setColor('#694fad'))}></TouchableOpacity>
                        <TouchableOpacity style={[commonStyles.color, {backgroundColor: '#09dd'}]} onPress={() => dispatch(setColor('#09dd'))}></TouchableOpacity>
                        <TouchableOpacity style={[commonStyles.color, {backgroundColor: '#d02860'}]} onPress={() => dispatch(setColor('#d02860'))}></TouchableOpacity>
                    </View>
                </View>
                <View style={{flexDirection: 'row', justifyContent: 'space-evenly'}}>
                <TouchableOpacity style={[commonStyles.button, { borderColor: color, marginTop: 30, backgroundColor: darkTheme ? darkThirdColor : lightMainColor}]} onPress={router.back}>
                    <ThemedText type="subtitle" style={{color: color}}>Back</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={[commonStyles.button, { borderColor: color, marginTop: 30, backgroundColor: darkTheme ? darkThirdColor : lightMainColor}]} onPress={handleSubmit}>
                    <ThemedText type="subtitle" style={{color: color}}>Save</ThemedText>
                </TouchableOpacity>
                </View>
                <ThemedText style={{ marginTop: 60, textAlign: 'center' }}>you can change this settings later</ThemedText>
                </ScrollView>
                }
            </View>
        </ThemedView>
    )
};