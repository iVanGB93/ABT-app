import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView
} from "react-native";
import { useSelector } from 'react-redux';
import { useRouter } from "expo-router";

import { RootState, useAppDispatch } from "@/app/(redux)/store";
import axiosInstance from '@/axios';
import { ThemedSecondaryView } from "@/components/ThemedSecondaryView";
import { ThemedText } from "@/components/ThemedText";
import { darkMainColor, lightMainColor } from "@/settings";
import { setJobMessage } from "@/app/(redux)/jobSlice";
import JobForm from "@/components/jobs/JobForm";


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
        } else {
            setAddress(address)
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
                    dispatch(setJobMessage(response.data.message));
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
        let clientA = clients.find((clientA: { name: string; }) => clientA.name === client);
        if (clientA !== undefined) {
            if ( clientA.address === "") {
                return "no address saved"
            }
            return clientA.address
        } else {
            return "no client selected"
        }
    };

    return (
        <KeyboardAvoidingView
            behavior="padding"
            keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
            style={[styles.container, { backgroundColor: darkTheme ? darkMainColor : lightMainColor}]}
        >
            { isLoading ?
            <ActivityIndicator style={styles.loading} color={color} size="large" />
            :
            <ThemedSecondaryView style={[styles.form, {shadowColor: darkTheme ? '#fff' : '#000'}]}>
                <ScrollView 
                    keyboardShouldPersistTaps={'handled'}
                    contentContainerStyle={{ flexGrow: 1 }}
                >
                    <JobForm
                        clientsNames={clientsNames}
                        setClient={setClient}
                        description={description}
                        setDescription={setDescription}
                        address={address}
                        setAddress={setAddress}
                        price={price}
                        setPrice={setPrice}
                        errors={errors}
                        isEnabled={isEnabled}
                        toggleSwitch={toggleSwitch}
                        clientAddress={clientAddress}
                        isUpdate={false}
                    />
                    <View style={{width: '100%', flexDirection: 'row',justifyContent: 'space-evenly', marginTop: 15}}>
                        <TouchableOpacity style={[styles.button, {borderColor: color, backgroundColor: darkTheme ? darkMainColor : lightMainColor}]} onPress={() => handleSubmit()}>
                            <ThemedText type="subtitle" style={{color: color}}>Create</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, {borderColor: 'red', backgroundColor: darkTheme ? darkMainColor : lightMainColor}]} onPress={() => router.back()}>
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
});