import React, { useEffect, useState } from 'react';
import { Text, View, TextInput, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useSelector } from "react-redux";
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';

import { useAppDispatch, RootState } from '@/app/(redux)/store';
import { setBusinessLogo, setBusinessName } from '@/app/(redux)/settingSlice';
import { commonStyles } from '@/constants/commonStyles';
import { authSetMessage } from '../(redux)/authSlice';
import { baseImageURL, darkMainColor, darkSecondColor, darkThirdColor, darkTtextColor, lightMainColor, lightSecondColor, lightTextColor } from '@/settings';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Checkbox from 'expo-checkbox';


interface Errors {
    newName?: string;
    businessLogo?: string;
}

export default function InitialSettings () {
    const { authMessage } = useSelector((state: RootState) => state.auth);
    const { color, darkTheme } = useSelector((state: RootState) => state.settings);
    const [newBusinessLogo, setNewBusinessLogo] = useState<any>(null);
    const [newName, setNewName] = useState("");
    const [isChecked, setChecked] = useState(false);
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
        if (!newName) errors.newName = "Name is required!";
        if (!isChecked) {
            if (!newBusinessLogo) errors.businessLogo = "Logo is required!";
        }
        setErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async () => {
        if (validateForm()) {
            dispatch(setBusinessName(newName));
            if (isChecked) {
                dispatch(setBusinessLogo('@/assets/images/logoDefault.png'));
            } else {
                dispatch(setBusinessLogo(newBusinessLogo));
            }
            router.push('/secondSettings');
        }
    };

    return (
        <ThemedView style={commonStyles.container}>
            <View style={commonStyles.header}>
                <Image style={commonStyles.image} source={require('@/assets/images/logo.png')} />
                <ThemedText type="title" style={commonStyles.text_header}>Let's define your business!</ThemedText>
            </View>
            <View style={[commonStyles.footer, {backgroundColor:darkTheme ? darkSecondColor: lightSecondColor, borderColor: color, flex: 4}]}>
                <ScrollView>
                <ThemedText type="subtitle">Name</ThemedText>
                <View style={[commonStyles.action, { borderBottomColor: darkTheme ? '#f2f2f2' : '#000'}]}>
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
                
                <ThemedText type="subtitle" style={{marginTop: 50}}>Logo</ThemedText>
                {errors.businessLogo ? (
                    <Text style={commonStyles.errorMsg}>{errors.businessLogo}</Text>
                ) : null}
                <View style={[commonStyles.action, { justifyContent: 'space-evenly', borderBottomWidth: 0}]}>
                    {newBusinessLogo ? 
                    <Image source={{ uri : newBusinessLogo }} style={{ width: 100, height: 100, alignSelf: 'center', borderRadius: 15 }} />
                    :
                    <Image source={require('@/assets/images/logoDefault.png')} style={{ width: 100, height: 100, alignSelf: 'center', borderRadius: 15 }} />
                    }
                    <View>
                        <TouchableOpacity style={[commonStyles.button, {borderColor: color, marginBottom: 20, marginTop: 10, backgroundColor: darkTheme ? darkThirdColor : lightMainColor}]} onPress={() => handleImage()}>
                            <ThemedText type="subtitle" style={{color: color}}>Select Logo</ThemedText>
                        </TouchableOpacity>
                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            <Checkbox
                                value={isChecked}
                                onValueChange={setChecked}
                                color={isChecked ? color : undefined}
                                style={{margin: 5}}
                                />
                            <ThemedText>Use default</ThemedText>
                        </View>
                    </View>
                </View>
                
                <TouchableOpacity style={[commonStyles.button, { borderColor: color, marginTop: 80, backgroundColor: darkTheme ? darkThirdColor : lightMainColor}]} onPress={handleSubmit}>
                    <ThemedText type="subtitle" style={{color: color}}>Continue</ThemedText>
                </TouchableOpacity>
                </ScrollView>
            </View>
        </ThemedView>
    )
};