import React, { useEffect, useState } from 'react';
import { Text, View, ActivityIndicator, StyleSheet, TextInput, TouchableOpacity, Platform, Image, ScrollView } from 'react-native';
import { useSelector } from "react-redux";
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';

import { useAppDispatch, RootState } from '@/app/(redux)/store';
import { setBusiness, setBusinessLogo, setBusinessName, setColor } from '@/app/(redux)/settingSlice';
import { authLogout } from '@/app/(redux)/authSlice';
import axiosInstance from '@/axios';
import { baseImageURL, darkSecondColor, darkTtextColor, lightSecondColor, lightTextColor } from '@/settings';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { commonStyles } from '@/constants/commonStyles';
import { useRouter } from 'expo-router';


export default function Profile () {
    const { color, darkTheme, business, businessLogo } = useSelector((state: RootState) => state.settings);
    const { userName } = useSelector((state: RootState) => state.auth);
    const [newName, setNewName] = useState(business.business_name);
    const [newLogo, setNewLogo] = useState<any>(businessLogo);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const dispatch = useAppDispatch();


    const downloadLogo = async () => {
        try {
            const files = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory!);
            console.log('Archivos en documentDirectory:', files);
            const oldLogo = FileSystem.documentDirectory + 'logo.jpeg';
            await FileSystem.deleteAsync(oldLogo);
            const fileUrl = baseImageURL + business.business_logo;
            const fileUri = FileSystem.documentDirectory + 'logo.jpeg';
            const { uri } = await FileSystem.downloadAsync(fileUrl, fileUri);
            dispatch(setBusinessLogo(uri));
        } catch (error) {
            console.error('Error al listar archivos:', error);
        }
    };

    const getAccount = async () => {
        await axiosInstance
        .get(`user/account/${userName}/`)
        .then(function(response) {
            if (response.data) {
                dispatch(setBusiness(response.data));
                setLoading(false);
            } else {
                setError(response.data.message);
                setLoading(false);
            }
        })
        .catch(function(error) {
            console.error('Error getting account:', error);
            if (typeof error.response === 'undefined') {
                setError('A server/network error occurred. ' + 'Sorry about this - try againg in a few minutes.');
            } else {
                setError(error.message);
            };
            setLoading(false);
        });
    };

    useEffect(() => {
        getAccount();
    }, []);
    
    const handleBN = async () => {
        setLoading(true);
        const formData = new FormData();
        formData.append('business_name', newName);
        const uriParts = newLogo.split('.');
        const fileType = uriParts[uriParts.length - 1];
        const fileName = `${userName}BusinessLogo.${fileType}`;
        formData.append('business_logo', {
            uri: newLogo,
            name: fileName,
            type: `image/${fileType}`,
        } as unknown as Blob)
        await axiosInstance
        .post(`user/account/${userName}/`, formData,
        { headers: {
            'content-Type': 'multipart/form-data',
        }})
        .then(function(response) {
            if (response.data) {
                dispatch(setBusinessName(newName));
                dispatch(setBusiness(response.data));
                dispatch(setBusinessLogo(newLogo));
                //downloadLogo();
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
            setNewLogo(result.assets[0].uri);
        }
    };

    return (
        <ThemedView style={styles.container}>
            {loading ?
            <ActivityIndicator size="large" color={color} />
            :
            <ScrollView>
                <View style={styles.rowContainerLast}>
                    <Image source={{ uri: baseImageURL + business.image }} style={[styles.image, { borderColor: color }]} />
                    <View style={styles.info}>
                        <ThemedText type='title'>{userName}</ThemedText>
                        <ThemedText type='subtitle'>{business.business_name}</ThemedText>
                    </View>
                </View>
                <View style={[styles.sectionContainer, {backgroundColor:darkTheme ? darkSecondColor: lightSecondColor}]}>
                    <View style={styles.rowContainer}>
                        <Text style={[styles.optionText, {color:darkTheme ? darkTtextColor: lightTextColor}]}><Ionicons style={[styles.optionText, {color:darkTheme ? darkTtextColor: lightTextColor}]} name="person-circle-outline"/> Username</Text>
                        <Text style={[styles.optionTextRight, {color:darkTheme ? darkTtextColor: lightTextColor}]}>{userName}</Text>
                    </View>
                    <View style={styles.rowContainer}>
                        <Text style={[styles.optionText, {color:darkTheme ? darkTtextColor: lightTextColor}]}><Ionicons style={[styles.optionText, {color:darkTheme ? darkTtextColor: lightTextColor}]} name="mail-outline"/> Email</Text>
                        <Text style={[styles.optionTextRight, {color:darkTheme ? darkTtextColor: lightTextColor}]}>{business.email ? business.email : 'no email saved'}</Text>
                    </View>
                    <View style={styles.rowContainer}>
                        <Text style={[styles.optionText, {color:darkTheme ? darkTtextColor: lightTextColor}]}><Ionicons style={[styles.optionText, {color:darkTheme ? darkTtextColor: lightTextColor}]} name="call-outline"/> Phone</Text>
                        <Text style={[styles.optionTextRight, {color:darkTheme ? darkTtextColor: lightTextColor}]}>{business.phone ? business.phone : 'no phone saved'}</Text>
                    </View>
                    <View style={styles.rowContainerLast}>
                        <Text style={[styles.optionText, {color:darkTheme ? darkTtextColor: lightTextColor}]}><Ionicons style={[styles.optionText, {color:darkTheme ? darkTtextColor: lightTextColor}]} name="location-outline"/> Address</Text>
                        <Text style={[styles.optionTextRight, {color:darkTheme ? darkTtextColor: lightTextColor}]}>{business.address ? business.address : 'no address saved'}</Text>
                    </View>
                </View>
                <View style={[styles.sectionContainer, {backgroundColor:darkTheme ? darkSecondColor: lightSecondColor}]}>
                    <View style={styles.rowContainer}>
                        { newLogo ?
                        <Image source={{ uri: newLogo }} style={[styles.image, { borderColor: color, margin: 'auto' }]} />
                        :
                        <ThemedText type='subtitle'>Logo Image</ThemedText>
                        //<Image source={require(businessLogo) } style={[styles.image, { borderColor: color, margin: 'auto' }]} />
                        }
                        <TouchableOpacity style={[commonStyles.button, {borderColor: color, height: 40, marginVertical: 'auto'}]} onPress={() => handleImage()}>
                            <ThemedText type="subtitle" style={{color: color}}>Select Logo</ThemedText>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.rowContainer}>
                        <TextInput autoFocus={false} onChangeText={setNewName} value={newName} style={[styles.textInput, {color:darkTheme ? 'white': 'black', width: 200, margin: 'auto'}]}/>
                        <TouchableOpacity style={[commonStyles.button, {borderColor: color, width: 100}]} onPress={() => handleBN()}>
                            <ThemedText type="subtitle" style={{color: color}}>Save</ThemedText>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.rowContainerLast}>
                        <View style={commonStyles.colorsContainer}>
                            <TouchableOpacity style={[commonStyles.color, {backgroundColor: '#009d93'}]} onPress={() => dispatch(setColor('#009d93'))}></TouchableOpacity>
                            <TouchableOpacity style={[commonStyles.color, {backgroundColor: '#694fad'}]} onPress={() => dispatch(setColor('#694fad'))}></TouchableOpacity>
                            <TouchableOpacity style={[commonStyles.color, {backgroundColor: '#09dd'}]} onPress={() => dispatch(setColor('#09dd'))}></TouchableOpacity>
                            <TouchableOpacity style={[commonStyles.color, {backgroundColor: '#d02860'}]} onPress={() => dispatch(setColor('#d02860'))}></TouchableOpacity>
                        </View>
                    </View>
                </View>
                <View style={[styles.sectionContainer, {backgroundColor:darkTheme ? darkSecondColor: lightSecondColor}]}>
                    <View style={styles.rowContainer}>
                        <Text style={[styles.optionText, {color:darkTheme ? darkTtextColor: lightTextColor}]}><Ionicons style={[styles.optionText, {color:darkTheme ? darkTtextColor: lightTextColor}]} name="person"/> Contact</Text>
                    </View>
                    <View style={styles.rowContainer}>
                        <Text style={[styles.optionText, {color:darkTheme ? darkTtextColor: lightTextColor}]}><Ionicons style={[styles.optionText, {color:darkTheme ? darkTtextColor: lightTextColor}]} name="document-lock-outline"/> Privacy Policy</Text>
                    </View>
                    <View style={styles.rowContainerLast}>
                        <TouchableOpacity onPress={() => router.push('/(app)/(profile)/businessSettings')}>
                            <Text style={[styles.optionText, {color:darkTheme ? darkTtextColor: lightTextColor}]}><Ionicons style={[styles.optionText, {color:darkTheme ? darkTtextColor: lightTextColor}]} name="settings"/> Change settings</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <TouchableOpacity style={[commonStyles.button, {borderColor: color, alignSelf: 'center', margin: 15}]} onPress={() => dispatch(authLogout())}>
                    <ThemedText type="subtitle" style={{color: color}}>Logout</ThemedText>
                </TouchableOpacity>
            </ScrollView>
            }
        </ThemedView>
    )
};

const styles = StyleSheet.create ({
    container: {
        flex: 1, 
    },
    image: {
        width: 100, 
        height: 100, 
        borderWidth: 2,
        margin: 2,
        borderRadius: 15,
    },
    sectionContainer: {
        padding: 10,
        margin: 5,
        borderRadius: 15,
        width: '90%',
        alignItems: 'center',
        alignSelf: 'center'
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
    rowContainerLast: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
    },
    info: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'flex-end',
        marginRight: 10,
    },
    rowContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        paddingVertical: 5,
        borderBottomWidth: 1,
    },
    infoText: {
        fontSize: 25,
    },
    optionText: {
        fontSize: 22,
    },
    optionTextRight: {
        fontSize: 18,
    },
});