import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, TextInput, TouchableOpacity, Platform, Image } from 'react-native';
import { useSelector } from "react-redux";
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useAppDispatch, RootState } from '@/app/(redux)/store';
import { setBusinessLogo, setBusinessName } from '@/app/(redux)/settingSlice';
import { commonStyles } from '@/constants/commonStyles';
import { authSetMessage } from './(redux)/authSlice';


export default function InitialSettings () {
    const { authMessage } = useSelector((state: RootState) => state.auth);
    const { color, businessName, businessLogo } = useSelector((state: RootState) => state.settings);
    const [newName, setNewName] = useState(businessName);
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
            dispatch(setBusinessLogo(result.assets[0].uri));
        }
    };

    const handleSubmit = () => {
        if (newName === 'Business Name') {
            console.log('====================================');
            console.log("TOAST NAME");
            console.log('====================================');
        } else {
            dispatch(setBusinessName(newName));
            if (businessLogo === null) {
                console.log('====================================');
                console.log("TOAST LOGO");
                console.log('====================================');
            } else {
                router.push('/');
            }
        };
    };

    return (
        <View style={[commonStyles.container, {backgroundColor: color}]}>
            <View style={commonStyles.header}>
                <Text style={commonStyles.text_header}>Let's define your business!</Text>
            </View>
            <View style={commonStyles.footer}>    
                <Text style={commonStyles.text_footer}>Name</Text>
                <View style={commonStyles.action}>
                    <Ionicons name="business"/>
                    <TextInput 
                        autoFocus={false} 
                        onChangeText={setNewName} 
                        value={newName} 
                        style={commonStyles.textInput}/>
                    { newName !== 'Business Name' ?
                    <Ionicons name="checkmark-circle-outline" />
                    : null}
                </View>
                <Text style={[commonStyles.text_footer, { marginTop: 35 }]}>Logo</Text>
                {businessLogo && <Image source={{ uri: businessLogo }} style={{ width: 150, height: 150 }} />}
                <TouchableOpacity style={[commonStyles.button, {backgroundColor: color}]} onPress={() => handleImage()}>
                    <Text style={commonStyles.buttonText}>Select Image</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[commonStyles.button, { backgroundColor: color}]} onPress={handleSubmit}>
                    <Text style={commonStyles.buttonText}>Save</Text>
                </TouchableOpacity>
                <Text style={[commonStyles.text_footer, { marginTop: 60, textAlign: 'center' }]}>you can change this settings later</Text>
            </View>
        </View>
    )
};