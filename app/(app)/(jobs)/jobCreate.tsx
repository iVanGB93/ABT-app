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


interface Errors {
    client?: string;
    description?: string;
    address?: string;
    price?: string;
};

export default function JobCreate() {
    const {color } = useSelector((state: RootState) => state.settings);
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
        const clientsList = clients.map((item: { user: any; }) => item.user);
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
            <ThemedView style={styles.form}>
                <ScrollView>
                    {error ? (
                        <Text style={styles.errorText}>{error}</Text>
                    ) : null}
                    <Text style={styles.label}>Client</Text>
                    <SelectDropdown
                        data={clientsNames}
                        onSelect={(selectedItem: string, index: number) => {
                            setClient(selectedItem);
                        }}
                        renderButton={(selectedItem, isOpened) => {
                            return (
                            <View style={styles.dropdownButtonStyle}>
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
                    <View style={{flexDirection: 'row', justifyContent: 'space-between', alignSelf: 'center', verticalAlign: 'middle'}}>
                        <Text style={[styles.label, {verticalAlign: 'middle'}]}>is a new client?</Text>
                        <TouchableOpacity style={[styles.button, {backgroundColor: color}]} onPress={() => router.push('(app)/(clients)/clientCreate')}><Text style={{color: 'white'}}>Create client</Text></TouchableOpacity>
                    </View>
                    {errors.client ? (
                        <Text style={styles.errorText}>{errors.client}</Text>
                    ) : null}

                    <Text style={styles.label}>Description</Text>
                    <TextInput
                        style={styles.input}
                        placeholder={description ? description : "Enter job's description"}
                        value={description}
                        onChangeText={setDescription}
                    />
                    {errors.description ? (
                        <Text style={styles.errorText}>{errors.description}</Text>
                    ) : null}

                    <Text style={styles.label}>Address</Text>
                    {isEnabled ?
                    <Text style={styles.label}>{clientAddress()}</Text>
                    :
                    <TextInput
                        style={styles.input}
                        placeholder="Enter job's address"
                        value={address}
                        onChangeText={setAddress}
                    />
                    }
                    {errors.address ? (
                        <Text style={styles.errorText}>{errors.address}</Text>
                    ) : null}

                    <View style={[styles.label, {flexDirection: 'row', justifyContent: 'space-between', alignSelf: 'center', verticalAlign: 'middle'}]}>
                        <Switch
                            trackColor={{false: '#767577', true: color}}
                            thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={toggleSwitch}
                            value={isEnabled}
                        />
                        <Text style={[styles.label, {flexDirection: 'row', justifyContent: 'space-between', alignSelf: 'center', verticalAlign: 'middle'}]}>use client's address</Text>
                    </View>
                    
                    <Text style={styles.label}>Price</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter job's price"
                        value={price}
                        onChangeText={setPrice}
                        keyboardType="numeric"
                    />
                    {errors.price ? (
                        <Text style={styles.errorText}>{errors.price}</Text>
                    ) : null}
                    
                    <TouchableOpacity style={[styles.button, {backgroundColor: color}]} onPress={() => handleSubmit()}><Text style={[styles.headerText, {color: 'white'}]}>Save</Text></TouchableOpacity>
                </ScrollView>
            </ThemedView>
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
      backgroundColor: "#ffffff",
      padding: 20,
      borderRadius: 10,
      shadowColor: "#000",
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
        backgroundColor: '#694fad',
        padding: 10,
        borderRadius: 16,
        margin: 5,
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
    headerText: {
        fontSize: 16,
        fontWeight: 'bold',
        alignSelf: "center",
        marginTop: 5,
    },
    dropdownButtonStyle: {
        height: 40,
        borderColor: "#ddd",
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 5,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 12,
    },
      dropdownButtonTxtStyle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '500',
        color: '#151E26',
      },
      dropdownButtonArrowStyle: {
        fontSize: 28,
      },
      dropdownButtonIconStyle: {
        fontSize: 28,
        marginRight: 8,
      },
      dropdownMenuStyle: {
        backgroundColor: '#E9ECEF',
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
        color: '#151E26',
      },
      dropdownItemIconStyle: {
        fontSize: 28,
        marginRight: 8,
      },
});