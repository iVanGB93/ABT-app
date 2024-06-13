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


export default function InitialSettings () {
    const {token} = useSelector((state: RootState) => state.auth);
    const { authMessage, userName } = useSelector((state: RootState) => state.auth);
    const { color, businessName, darkTheme, business } = useSelector((state: RootState) => state.settings);
    const [businessLogo, setNewBusinessLogo] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [newName, setNewName] = useState(businessName);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const dispatch = useAppDispatch();

    const getAccount = async () => {
        await axiosInstance
        .get(`user/account/${userName}/`)
        .then(function(response) {
            if (response.data) {
                dispatch(setBusinessName(response.data.business_name));
                let logo = {'uri': baseImageURL + response.data.business_logo};
                setNewBusinessLogo(logo);
                dispatch(setBusinessLogo(logo));
                dispatch(setBusiness(response.data));
                setLoading(false);
            } else {
                setError(response.data.message);
                setLoading(false);
            }
        })
        .catch(function(error) {
            console.error('Error fetching jobs:', error);
            if (typeof error.response === 'undefined') {
                setError("Error undefinded");
                setLoading(false);
            } else {
                if (error.response.status === 401) {
                    router.push('/')
                } else {
                  setError(error.message);
                    setLoading(false);
                };
            };
        });
    };

    useEffect(() => {
        if (authMessage) {
            console.log('====================================');
            console.log("TOAS HERE");
            console.log('====================================');
            dispatch(authSetMessage(null));
        }
        getAccount();
    }, [authMessage]);

    const handleImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });
        if (!result.canceled) {
            setNewBusinessLogo(result.assets[0]);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        const formData = new FormData();
        formData.append('business_name', newName);
        if (businessLogo !== null) {
            const uriParts = businessLogo.uri.split('.');
            const fileType = uriParts[uriParts.length - 1];
            const fileName = `${userName}BusinessLogo.${fileType}`;
            formData.append('business_logo', {
                uri: businessLogo.uri,
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
                let logo = {'uri': baseImageURL + response.data.business_logo}
                dispatch(setBusinessLogo(logo));
                setLoading(false);
                router.push('(app)/(clients)')
            } else {
                setError(response.data.message);
                setLoading(false);
            }
        })
        .catch(function(error) {
            console.error('Error sending settings:', error);
            if (typeof error.response === 'undefined') {
                setError("Error logging in, undefinded");
              } else {
                if (error.response.status === 401) {
                    setError("Username or Password incorrect");
                    router.push('/');
                } else {
                  setError(error.message);
                  setLoading(false);
                };
              };
        });
    };

    return (
        <ThemedView style={commonStyles.container}>
            <View style={commonStyles.header}>
                <Image style={commonStyles.image} source={require('../assets/images/icon.png')} />
                <ThemedText type="title" style={commonStyles.text_header}>Let's define your business!</ThemedText>
            </View>
            <View style={[commonStyles.footer, {backgroundColor:darkTheme ? darkSecondColor: lightSecondColor, borderColor: color}]}>
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
                <ThemedText type="subtitle">Logo</ThemedText>
                {businessLogo && <Image source={{ uri: baseImageURL + business.business_logo }} style={{ width: 100, height: 100, alignSelf: 'center', borderRadius: 15 }} />}
                <TouchableOpacity style={[commonStyles.button, {backgroundColor: color, marginBottom: 20, marginTop: 10}]} onPress={() => handleImage()}>
                    <Text style={commonStyles.buttonText}>Select Logo</Text>
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
                <TouchableOpacity style={[commonStyles.button, { backgroundColor: color}]} onPress={handleSubmit}>
                    <Text style={commonStyles.buttonText}>Save</Text>
                </TouchableOpacity>
                    <ThemedText style={[commonStyles.text_footer, { marginTop: 60, textAlign: 'center' }]}>you can change this settings later</ThemedText>
                </ScrollView>
                }
            </View>
        </ThemedView>
    )
};