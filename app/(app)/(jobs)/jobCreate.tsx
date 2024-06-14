import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Text,
  Platform,
  ActivityIndicator,
  Switch,
  ScrollView
} from "react-native";
import { useSelector } from 'react-redux';
import SelectDropdown from 'react-native-select-dropdown';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from "expo-router";

import { RootState, useAppDispatch } from "@/app/(redux)/store";
import axiosInstance from '@/axios';
import { ThemedView } from "@/components/ThemedView";
import { ThemedSecondaryView } from "@/components/ThemedSecondaryView";
import { ThemedText } from "@/components/ThemedText";
import { commonStyles } from "@/constants/commonStyles";
import { darkMainColor, darkTtextColor, lightMainColor, lightTextColor } from "@/settings";


interface Errors {
    client?: string;
    description?: string;
    address?: string;
    price?: string;
};

export default function JobCreate() {
    const {color, darkTheme } = useSelector((state: RootState) => state.settings);
    const {userName } = useSelector((state: RootState) => state.auth);
    const { clients } = useSelector((state: RootState) => state.client);
    const [client, setClient] = useState("");
    const [description, setDescription] = useState("");
    const [clientsNames, setClientsNames] = useState<any>([]);
    const [address, setAddress] = useState("");
    const [price, setPrice] = useState("");
    const [isEnabled, setIsEnabled] = useState(false);
    const [error, setError] = useState("");
    const [errors, setErrors] = useState<Errors>({});
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const dispatch = useAppDispatch();

    useEffect(() => {
        const clientsList = clients.map((item: { name: string; }) => item.name);
        setClientsNames(clientsList);
    }, []);

    const toggleSwitch = () => {
        setIsEnabled(previousState => !previousState);
        if (!isEnabled) {
            setAddress(clientAddress())
        }
    };

    const validateForm = () => {
        let errors: Errors = {};
        if (!client) errors.client = "Client is required";
        if (!description) errors.description = "Description is required";
        if (!address) errors.address = "Address is required";
        if (!price) errors.price = "Price is required";
        setErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async () => {
        if (validateForm()) {
            setIsLoading(true);
            await axiosInstance
            .post(`jobs/create/${userName}/`, {
                action: 'new',
                name: client,
                description: description,
                price: price,
                address: address,
            },
            { headers: {
                'content-Type': 'multipart/form-data',
            }})
            .then(function(response) {
                let data = response.data;
                if (data.OK) {
                    router.push('/(app)/(jobs)');
                }
                setError(response.data.message)
                setIsLoading(false);
            })
            .catch(function(error) {
                console.error('Error creating a job:', error);
                setIsLoading(false);
                setError(error.message);
            });
        }
    };

    const clientAddress = () => {
        let clientA = clients.find((clientA: { user: string; }) => clientA.user === client);
        if (clientA !== undefined) {
            if ( clientA.address === "") {
                return "no address saved"
            }
            return clientA.address
        } else {
            return "no address submitted"
        }
    };

    return (
        <KeyboardAvoidingView
            behavior="padding"
            keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
            style={styles.container}
        >
            { isLoading ?
            <ActivityIndicator style={styles.loading} color={color} size="large" />
            :
            <ThemedSecondaryView style={styles.form}>
                <ScrollView>
                    {error ? (
                        <Text style={styles.errorText}>{error}</Text>
                    ) : null}
                    <ThemedText type="subtitle">Client</ThemedText>
                    <SelectDropdown
                        data={clientsNames}
                        onSelect={(selectedItem: string, index: number) => {
                            setClient(selectedItem);
                        }}
                        renderButton={(selectedItem, isOpened) => {
                            return (
                            <View style={[styles.dropdownButtonStyle, {borderColor: color}]}>
                                <Text style={styles.dropdownButtonTxtStyle}>
                                {(selectedItem ) || 'Select the client'}
                                </Text>
                                <Ionicons name={isOpened ? 'chevron-up' : 'chevron-down'} style={styles.dropdownButtonArrowStyle} />
                            </View>
                            );
                        }}
                        renderItem={(item, index, isSelected) => {
                            return (
                            <View style={{...styles.dropdownItemStyle, ...(isSelected && {backgroundColor: '#D2D9DF'})}}>
                                <Text style={styles.dropdownItemTxtStyle}>{item}</Text>
                            </View>
                            );
                        }}
                        showsVerticalScrollIndicator={false}
                        dropdownStyle={styles.dropdownMenuStyle}
                        search={true}
                        searchPlaceHolder={"Type to search"}
                    />
                    <View style={{flexDirection: 'row', justifyContent: 'space-between', alignSelf: 'center'}}>
                        <ThemedText style={[styles.label, {verticalAlign: 'middle'}]}>is a new client?</ThemedText>
                        <TouchableOpacity style={[styles.button, {borderColor: color, marginLeft: 5}]} onPress={() => router.push('(app)/(clients)/clientCreate')}>
                            <ThemedText type="subtitle" style={{color: color}}>Add client</ThemedText>
                        </TouchableOpacity>
                    </View>
                    {errors.client ? (
                        <Text style={styles.errorText}>{errors.client}</Text>
                    ) : null}

                    <ThemedText style={commonStyles.text_action} type="subtitle">Description</ThemedText>
                    <View style={commonStyles.action}>
                        <Ionicons name="text" color={darkTheme ? darkTtextColor: lightTextColor} />
                        <TextInput
                            style={[commonStyles.textInput, {color: darkTheme ? darkTtextColor: lightTextColor}]}
                            placeholder={description ? description : "Enter job's description"}
                            placeholderTextColor={darkTheme ? darkTtextColor: lightTextColor}
                            value={description}
                            onChangeText={setDescription}
                        />
                    </View>
                    {errors.description ? (
                        <Text style={styles.errorText}>{errors.description}</Text>
                    ) : null}

                    <ThemedText style={commonStyles.text_action} type="subtitle">Address</ThemedText>
                    {isEnabled ?
                    <ThemedText style={styles.label}>{clientAddress()}</ThemedText>
                    :
                    <View style={commonStyles.action}>
                        <Ionicons name="location" color={darkTheme ? darkTtextColor: lightTextColor} />
                        <TextInput
                            style={[commonStyles.textInput, {color: darkTheme ? darkTtextColor: lightTextColor}]}
                            placeholder="Enter job's address"
                            placeholderTextColor={darkTheme ? darkTtextColor: lightTextColor}
                            value={address}
                            onChangeText={setAddress}
                        />
                    </View>
                    }
                    {errors.address ? (
                        <Text style={styles.errorText}>{errors.address}</Text>
                    ) : null}

                    <View style={{flexDirection: 'row', justifyContent: 'space-between', alignSelf: 'center',}}>
                        <Switch
                            trackColor={{false: '#767577', true: color}}
                            thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={toggleSwitch}
                            value={isEnabled}
                        />
                        <ThemedText style={[styles.label, {flexDirection: 'row', justifyContent: 'space-between', alignSelf: 'center', verticalAlign: 'middle'}]}>use client's address</ThemedText>
                    </View>
                    
                    <ThemedText style={[commonStyles.text_action, {marginTop: 5}]} type="subtitle">Price</ThemedText>
                    <View style={commonStyles.action}>
                        <Ionicons name="cash-outline" color={darkTheme ? darkTtextColor: lightTextColor} />
                        <TextInput
                            style={[commonStyles.textInput, {color: darkTheme ? darkTtextColor: lightTextColor}]}
                            placeholder="Enter job's price"
                            placeholderTextColor={darkTheme ? darkTtextColor: lightTextColor}
                            value={price}
                            onChangeText={setPrice}
                            keyboardType="numeric"
                        />
                    </View>
                    {errors.price ? (
                        <Text style={styles.errorText}>{errors.price}</Text>
                    ) : null}
                    <View style={{width: '100%', flexDirection: 'row',justifyContent: 'space-evenly', marginTop: 15}}>
                        <TouchableOpacity style={[styles.button, {borderColor: color}]} onPress={() => handleSubmit()}>
                            <ThemedText type="subtitle" style={{color: color}}>Create</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, {borderColor: 'red'}]} onPress={() => router.back()}>
                            <ThemedText type="subtitle" style={{color: 'red'}}>Cancel</ThemedText>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </ThemedSecondaryView>
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
    },
    dropdownButtonStyle: {
        height: 40,
        borderBottomWidth: 1,
        borderRadius: 5,
        marginBottom: 5,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 12,
        color: '#fff',
    },
      dropdownButtonTxtStyle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '500',
        color: '#fff',
      },
      dropdownButtonArrowStyle: {
        fontSize: 28,
        color: '#fff',
      },
      dropdownButtonIconStyle: {
        fontSize: 28,
        marginRight: 8,
        color: '#fff',
      },
      dropdownMenuStyle: {
        borderRadius: 8,
      },
      dropdownItemStyle: {
        width: '100%',
        flexDirection: 'row',
        paddingHorizontal: 12,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 8,
      },
      dropdownItemTxtStyle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '500',
        borderColor: "#ddd",
        borderBottomWidth: 1,
      },
      dropdownItemIconStyle: {
        fontSize: 28,
        marginRight: 8,
      },
});