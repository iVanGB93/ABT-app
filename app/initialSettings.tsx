import React, { useEffect, useState } from 'react';
import { Text, View, ActivityIndicator, TextInput, TouchableOpacity, Platform, Image, ScrollView } from 'react-native';
import { useSelector } from "react-redux";
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useAppDispatch, RootState } from '@/app/(redux)/store';
import { setBusinessLogo, setBusinessName, setColor } from '@/app/(redux)/settingSlice';
import { commonStyles } from '@/constants/commonStyles';
import { authSetMessage } from './(redux)/authSlice';
import axiosInstance from '@/axios';
import { baseImageURL } from '@/settings';
import { ThemedText } from '@/components/ThemedText';


export default function InitialSettings () {
    const {token} = useSelector((state: RootState) => state.auth);
    const { authMessage, userName } = useSelector((state: RootState) => state.auth);
    const { color, businessName } = useSelector((state: RootState) => state.settings);
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
                dispatch(setBusinessLogo(logo));
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
        <View style={[commonStyles.container, {backgroundColor: color}]}>
            <View style={commonStyles.header}>
                <Text style={commonStyles.text_header}>Let's define your business!</Text>
            </View>
            {loading ?
            <ActivityIndicator style={commonStyles.button} size="large" />
            :
            <View style={commonStyles.footer}>    
                <ScrollView>
                <Text style={commonStyles.text_footer}>Name</Text>
                <View style={commonStyles.action}>
                    <Ionicons name="business"/>
                    <TextInput 
                        autoFocus={false} 
                        onChangeText={setNewName} 
                        placeholder='Type your business name...'
                        value={newName} 
                        style={commonStyles.textInput}/>
                    { newName !== 'Business Name' ?
                    <Ionicons name="checkmark-circle-outline" />
                    : null}
                </View>
                <Text style={[commonStyles.text_footer, { marginTop: 35 }]}>Logo</Text>
                {businessLogo && <Image source={{ uri: businessLogo.uri }} style={{ width: 100, height: 100, alignSelf: 'center' }} />}
                <TouchableOpacity style={[commonStyles.button, {backgroundColor: color, marginTop: 10}]} onPress={() => handleImage()}>
                    <Text style={commonStyles.buttonText}>Select Image</Text>
                </TouchableOpacity>
                <ThemedText style={[commonStyles.text_footer, { marginTop: 35 }]}>Change color</ThemedText>
                <View style={commonStyles.colorsContainer}>
                    <TouchableOpacity style={[commonStyles.color, {backgroundColor: '#009d93'}]} onPress={() => dispatch(setColor('#009d93'))}></TouchableOpacity>
                    <TouchableOpacity style={[commonStyles.color, {backgroundColor: '#694fad'}]} onPress={() => dispatch(setColor('#694fad'))}></TouchableOpacity>
                    <TouchableOpacity style={[commonStyles.color, {backgroundColor: '#09dd'}]} onPress={() => dispatch(setColor('#09dd'))}></TouchableOpacity>
                    <TouchableOpacity style={[commonStyles.color, {backgroundColor: '#d02860'}]} onPress={() => dispatch(setColor('#d02860'))}></TouchableOpacity>
                </View>
                <TouchableOpacity style={[commonStyles.button, { backgroundColor: color}]} onPress={handleSubmit}>
                    <Text style={commonStyles.buttonText}>Save</Text>
                </TouchableOpacity>
                <Text style={[commonStyles.text_footer, { marginTop: 60, textAlign: 'center' }]}>you can change this settings later</Text>
                </ScrollView>
            </View>
            }
        </View>
    )
};