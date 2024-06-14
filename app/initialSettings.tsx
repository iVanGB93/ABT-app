import React, { useEffect, useState } from 'react';
import { Text, View, ActivityIndicator, TextInput, TouchableOpacity, Platform, Image, ScrollView } from 'react-native';
import { useSelector } from "react-redux";
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, useRouter } from 'expo-router';

import { useAppDispatch, RootState } from '@/app/(redux)/store';
import { setBusiness, setBusinessLogo, setBusinessName, setColor } from '@/app/(redux)/settingSlice';
import { commonStyles } from '@/constants/commonStyles';
import { authSetMessage } from './(redux)/authSlice';
import axiosInstance from '@/axios';
import { baseImageURL, darkSecondColor, darkTtextColor, lightSecondColor, lightTextColor } from '@/settings';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';


interface Errors {
    newName?: string;
    address?: string;
    phone?: string;
    businessLogo?: string;
}

export default function InitialSettings () {
    const {token} = useSelector((state: RootState) => state.auth);
    const { authMessage, userName } = useSelector((state: RootState) => state.auth);
    const { color, businessName, darkTheme, business } = useSelector((state: RootState) => state.settings);
    const [newBusinessLogo, setNewBusinessLogo] = useState<any>(null);
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [loading, setLoading] = useState(false);
    const [newName, setNewName] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [errors, setErrors] = useState<Errors>({});
    const router = useRouter();
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (authMessage) {
            console.log('====================================');
            console.log("TOAS HERE");
            console.log('====================================');
            dispatch(authSetMessage(null));
        }
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
        if (!newName) errors.newName = "Name is required!";
        if (!address) errors.address = "Address is required!";
        if (!phone) errors.phone = "Phone is required!";
        if (!newBusinessLogo) errors.businessLogo = "Logo is required!";
        setErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async () => {
        if (validateForm()) {
            setLoading(true);
            const formData = new FormData();
            formData.append('business_name', newName);
            formData.append('phone', phone);
            formData.append('address', address);
            if (newBusinessLogo !== null) {
                const uriParts = newBusinessLogo.split('.');
                const fileType = uriParts[uriParts.length - 1];
                const fileName = `${userName}BusinessLogo.${fileType}`;
                formData.append('business_logo', {
                    uri: newBusinessLogo,
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
                    dispatch(setBusinessName(newName));
                    dispatch(setBusinessLogo(newBusinessLogo));
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
                <Image style={commonStyles.image} source={require('../assets/images/icon.png')} />
                <ThemedText type="title" style={commonStyles.text_header}>Let's define your business!</ThemedText>
            </View>
            <View style={[commonStyles.footer, {backgroundColor:darkTheme ? darkSecondColor: lightSecondColor, borderColor: color, flex: 4}]}>
                {loading ?
                <ActivityIndicator style={commonStyles.button} color={color} size="large" />
                :
                <ScrollView>
                <ThemedText type="subtitle">Name</ThemedText>
                <View style={commonStyles.action}>
                    <Ionicons name="business" color={darkTheme ? darkTtextColor: lightTextColor}/>
                    <TextInput 
                        autoFocus={false} 
                        onChangeText={setNewName} 
                        placeholder='Type your business name...'
                        placeholderTextColor={darkTheme ? darkTtextColor: lightTextColor}
                        value={newName} 
                        style={[commonStyles.textInput, {color: darkTheme ? darkTtextColor: lightTextColor}]} autoCapitalize='none'/>
                    { newName !== 'Business Name' ?
                    <Ionicons name="checkmark-circle-outline" color={darkTheme ? darkTtextColor: lightTextColor} />
                    : null}
                </View>
                {errors.newName ? (
                    <Text style={commonStyles.errorMsg}>{errors.newName}</Text>
                ) : null}
                <ThemedText type="subtitle">Address</ThemedText>
                <View style={commonStyles.action}>
                    <Ionicons name="location" color={darkTheme ? darkTtextColor: lightTextColor}/>
                    <TextInput 
                        autoFocus={false} 
                        onChangeText={setAddress} 
                        placeholder='Type your business address...'
                        placeholderTextColor={darkTheme ? darkTtextColor: lightTextColor}
                        value={address} 
                        style={[commonStyles.textInput, {color: darkTheme ? darkTtextColor: lightTextColor}]} autoCapitalize='none'/>
                    { newName !== 'Business Name' ?
                    <Ionicons name="checkmark-circle-outline" color={darkTheme ? darkTtextColor: lightTextColor} />
                    : null}
                </View>
                {errors.address ? (
                    <Text style={commonStyles.errorMsg}>{errors.address}</Text>
                ) : null}
                <ThemedText type="subtitle">Phone</ThemedText>
                <View style={commonStyles.action}>
                    <Ionicons name="phone-portrait-sharp" color={darkTheme ? darkTtextColor: lightTextColor}/>
                    <TextInput 
                        autoFocus={false}
                        onChangeText={setPhone} 
                        placeholder='Type your business phone...'
                        placeholderTextColor={darkTheme ? darkTtextColor: lightTextColor}
                        value={phone} 
                        style={[commonStyles.textInput, {color: darkTheme ? darkTtextColor: lightTextColor}]} autoCapitalize='none'/>
                    { newName !== 'Business Name' ?
                    <Ionicons name="checkmark-circle-outline" color={darkTheme ? darkTtextColor: lightTextColor} />
                    : null}
                </View>
                {errors.phone ? (
                    <Text style={commonStyles.errorMsg}>{errors.phone}</Text>
                ) : null}
                <ThemedText type="subtitle">Logo</ThemedText>
                {errors.businessLogo ? (
                    <Text style={commonStyles.errorMsg}>{errors.businessLogo}</Text>
                ) : null}
                {newBusinessLogo ? 
                <Image source={{ uri : newBusinessLogo }} style={{ width: 100, height: 100, alignSelf: 'center', borderRadius: 15 }} />
                :
                <Image source={require('../assets/images/logoDefault.png')} style={{ width: 100, height: 100, alignSelf: 'center', borderRadius: 15 }} />
                }
                
                <TouchableOpacity style={[commonStyles.button, {borderColor: color, marginBottom: 20, marginTop: 10}]} onPress={() => handleImage()}>
                    <ThemedText type="subtitle" style={{color: color}}>Select Logo</ThemedText>
                </TouchableOpacity>
                <ThemedText type='subtitle'>Change color</ThemedText>
                <View style={commonStyles.action}>
                    <View style={commonStyles.colorsContainer}>
                        <TouchableOpacity style={[commonStyles.color, {backgroundColor: '#009d93'}]} onPress={() => dispatch(setColor('#009d93'))}></TouchableOpacity>
                        <TouchableOpacity style={[commonStyles.color, {backgroundColor: '#694fad'}]} onPress={() => dispatch(setColor('#694fad'))}></TouchableOpacity>
                        <TouchableOpacity style={[commonStyles.color, {backgroundColor: '#09dd'}]} onPress={() => dispatch(setColor('#09dd'))}></TouchableOpacity>
                        <TouchableOpacity style={[commonStyles.color, {backgroundColor: '#d02860'}]} onPress={() => dispatch(setColor('#d02860'))}></TouchableOpacity>
                    </View>
                </View>
                <TouchableOpacity style={[commonStyles.button, { borderColor: color, marginTop: 30}]} onPress={handleSubmit}>
                    <ThemedText type="subtitle" style={{color: color}}>Save</ThemedText>
                </TouchableOpacity>
                    <ThemedText style={{ marginTop: 60, textAlign: 'center' }}>you can change this settings later</ThemedText>
                </ScrollView>
                }
            </View>
        </ThemedView>
    )
};