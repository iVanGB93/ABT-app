import React, { useEffect, useState } from 'react';
import { Text, View, ActivityIndicator, StyleSheet, TextInput, TouchableOpacity, Platform, Image } from 'react-native';
import { useSelector } from "react-redux";
import * as ImagePicker from 'expo-image-picker';

import { useAppDispatch, RootState } from '@/app/(redux)/store';
import { setBusinessLogo, setBusinessName } from '@/app/(redux)/settingSlice';
import { authLogout } from '@/app/(redux)/authSlice';
import axiosInstance from '@/axios';
import { baseImageURL } from '@/settings';


export default function Profile () {
    const { color, darkTheme, businessName, businessLogo } = useSelector((state: RootState) => state.settings);
    const { userName } = useSelector((state: RootState) => state.auth);
    const [newName, setNewName] = useState(businessName);
    const [newLogo, setNewLogo] = useState<any>(businessLogo);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const dispatch = useAppDispatch();

    const getAccount = async () => {
        await axiosInstance
        .get(`user/account/${userName}/`)
        .then(function(response) {
            console.log('====================================');
            console.log(response.data);
            console.log('====================================');
            if (response.data) {
                dispatch(setBusinessName(response.data.business_name));
                let logo = baseImageURL + response.data.business_logo;
                setNewLogo(logo);
                setLoading(false);
            } else {
                setError(response.data.message);
                setLoading(false);
            }
        })
        .catch(function(error) {
            console.error('Error fetching jobs:', error);
            try {
                const message = error.data.message;
                setError(message);
                setLoading(false);
            } catch(e) {
                setError("Error getting your jobs.");
                setLoading(false);
            }
        });
    };

    useEffect(() => {
        getAccount();
    }, []);
    
    const handleBN = async () => {
        setLoading(true);
        const formData = new FormData();
        formData.append('business_name', newName);
        const uriParts = newLogo.uri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        const fileName = `${userName}BusinessLogo.${fileType}`;
        formData.append('business_logo', {
            uri: newLogo.uri,
            name: fileName,
            type: `image/${fileType}`,
        } as unknown as Blob)
        await axiosInstance
        .post(`user/account/${userName}/`, formData,
        { headers: {
            'content-Type': 'multipart/form-data',
        }})
        .then(function(response) {
            console.log('====================================');
            console.log(response.data);
            console.log('====================================');
            if (response.data) {
                dispatch(setBusinessName(newName));
                let logo = baseImageURL + response.data.business_logo;
                dispatch(setBusinessLogo(logo));
                setLoading(false);
            } else {
                setError(response.data.message);
                setLoading(false);
            }
        })
        .catch(function(error) {
            console.error('Error fetching jobs:', error);
            try {
                const message = error.data.message;
                setError(message);
                setLoading(false);
            } catch(e) {
                setError("Error getting your jobs.");
                setLoading(false);
            }
        });
    };

    const handleImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });
        if (!result.canceled) {
            setNewLogo(result.assets[0]);
        }
    };

    return (
        loading ?
        <ActivityIndicator size="large" color={color} />
        :
        <View style={[styles.container, {backgroundColor:darkTheme ? 'black': 'white'}]}>
            <View style={[styles.sectionContainer, {backgroundColor:darkTheme ? '#333': '#9999'}]}>
                <Text style={[styles.header, {color:darkTheme ? 'white': 'black'}]}>Hello, {userName}</Text>
                {businessLogo && <Image source={{ uri: newLogo.uri }} style={{ width: 150, height: 150 }} />}
                <TouchableOpacity style={[styles.button, {backgroundColor: color}]} onPress={() => handleImage()}><Text style={[styles.headerText, {color: 'white'}]}>Change Logo</Text></TouchableOpacity>
            </View>
            <View style={[styles.sectionContainer, {backgroundColor:darkTheme ? '#333': '#9999'}]}>
                <Text style={[styles.header, {color:darkTheme ? 'white': 'black'}]}>Change Bussiness Name</Text>
                <TextInput autoFocus={false} onChangeText={setNewName} value={newName} style={[styles.textInput, {color:darkTheme ? 'white': 'black'}]}/>
                <TouchableOpacity style={[styles.button, {backgroundColor: color}]} onPress={() => handleBN()}><Text style={[styles.headerText, {color: 'white'}]}>Save</Text></TouchableOpacity>
            </View>
            <TouchableOpacity style={[styles.button, {backgroundColor: color}]} onPress={() => dispatch(authLogout())}><Text style={[styles.headerText, {color: 'white'}]}>Logout</Text></TouchableOpacity>
          </View>
    )
};

const styles = StyleSheet.create ({
    container: {
        flex: 1, 
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionContainer: {
        padding: 10,
        margin: 5,
        borderRadius: 15,
        width: '90%',
        alignItems: 'center'
    },
    header: {
        justifyContent: 'flex-end',
        paddingHorizontal: 10,
        paddingBottom: 10,
        fontWeight: 'bold',
        fontSize: 25
    },
    textInput: {
        height: 40,
        width: '80%',
        borderColor: "#ddd",
        borderWidth: 1,
        marginBottom: 5,
        padding: 10,
        borderRadius: 5,
    },
    button: {
        padding: 10,
        borderRadius: 16,
        margin: 5,
        width: 100,
        alignItems: 'center',
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
});