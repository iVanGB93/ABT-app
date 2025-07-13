import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
} from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "@/app/(redux)/store";
import { Ionicons } from "@expo/vector-icons";
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import PhoneInput, { ICountry, isValidPhoneNumber, } from 'react-native-international-phone-number';
import Constants from 'expo-constants';
const GOOGLE_PLACES_API_KEY = Constants.expoConfig?.extra?.googlePlacesApiKey;

import { ThemedText } from "@/components/ThemedText";
import { darkTtextColor, lightTextColor } from "@/settings";
import { commonStyles } from "@/constants/commonStyles";


interface ClientFormProps {
    name?: string;
    setName?: any;
    lastName?: string;
    setLastName?: any;
    phone?: string;
    setPhone?: any;
    email?: string;
    setEmail?: any;
    address?: string;
    setAddress?: any;
    errors?: any;
};

export default function ClientForm({name, setName, lastName, setLastName, phone, setPhone, email, setEmail, address, setAddress, errors, }: ClientFormProps) {
    const {color, darkTheme } = useSelector((state: RootState) => state.settings);
    const [selectedCountry, setSelectedCountry] =
    useState<null | ICountry>(null);
    const [inputValue, setInputValue] = useState<string>('');

    function handleInputValue(phoneNumber: string) {
        setInputValue(phoneNumber);
    }

    function handleSelectedCountry(country: ICountry) {
        setSelectedCountry(country);
    }

    return (
        <View>
            <ThemedText style={commonStyles.text_action} type="subtitle">Name</ThemedText>
            <View style={[commonStyles.action, { borderBottomColor: darkTheme ? '#f2f2f2' : '#000'}]}>
                <Ionicons style={{marginBottom: 5, fontSize: 16}} name="person" color={darkTheme ? darkTtextColor: lightTextColor} />
                <TextInput
                    style={[commonStyles.textInput, {color: darkTheme ? darkTtextColor: lightTextColor}]}
                    placeholder={name ? name : "Enter client's name"}
                    placeholderTextColor={darkTheme ? darkTtextColor: lightTextColor}
                    value={name}
                    onChangeText={setName}
                />
            </View>
            {errors.name ? (
                <Text style={styles.errorText}>{errors.name}</Text>
            ) : null}
            <ThemedText style={commonStyles.text_action} type="subtitle">Last Name</ThemedText>
            <View style={[commonStyles.action, { borderBottomColor: darkTheme ? '#f2f2f2' : '#000'}]}>
                <Ionicons style={{marginBottom: 5, fontSize: 16}} name="person-add" color={darkTheme ? darkTtextColor: lightTextColor} />
                <TextInput
                    style={[commonStyles.textInput, {color: darkTheme ? darkTtextColor: lightTextColor}]}
                    placeholder={lastName ? lastName : "Enter client's last name"}
                    placeholderTextColor={darkTheme ? darkTtextColor: lightTextColor}
                    value={lastName}
                    onChangeText={setLastName}
                />
            </View>
            {errors.lastName ? (
                <Text style={styles.errorText}>{errors.lastName}</Text>
            ) : null}
            <ThemedText style={commonStyles.text_action} type="subtitle">Phone</ThemedText>
            <PhoneInput
                defaultCountry="US"
                value={phone ?? ""}
                onChangePhoneNumber={setPhone}
                selectedCountry={selectedCountry}
                onChangeSelectedCountry={handleSelectedCountry}
                theme={darkTheme ? 'dark' : 'light'}
                placeholder="Enter client's phone"
                phoneInputStyles={{
                    flagContainer: {
                        margin: 0,
                        width: 90,
                        padding: 0,
                    },
                    caret: {
                        fontSize: 12,
                        width: 3,
                    },
                    callingCode: {
                        fontSize: 12,
                    }
                }}
            />
            {errors.phone ? (
                <Text style={styles.errorText}>{errors.phone}</Text>
            ) : null}
            <ThemedText style={commonStyles.text_action} type="subtitle">Email</ThemedText>
            <View style={[commonStyles.action, { borderBottomColor: darkTheme ? '#f2f2f2' : '#000'}]}>
                <Ionicons style={{marginBottom: 5, fontSize: 16}} name="mail" color={darkTheme ? darkTtextColor: lightTextColor} />
                <TextInput
                    style={[commonStyles.textInput, {color: darkTheme ? darkTtextColor: lightTextColor}]}
                    placeholder="Enter client's email"
                    placeholderTextColor={darkTheme ? darkTtextColor: lightTextColor}
                    value={email}
                    onChangeText={setEmail}
                />
            </View>
            {errors.email ? (
                <Text style={styles.errorText}>{errors.email}</Text>
            ) : null}
            <ThemedText style={commonStyles.text_action} type="subtitle">Address</ThemedText>
            <View style={[commonStyles.action, { borderBottomColor: darkTheme ? '#f2f2f2' : '#000'}]}>
              <Ionicons style={{marginBottom: 5, fontSize: 16}} name="location" color={darkTheme ? darkTtextColor: lightTextColor} />
              <GooglePlacesAutocomplete
                predefinedPlaces={[]}
                placeholder={address ? address : "Client's address"}
                minLength={2}
                timeout={1000}
                textInputProps={{
                    placeholderTextColor: darkTheme ? darkTtextColor: lightTextColor,
                }}
                onPress={(data, details = null) => {
                    setAddress(data.description);
                }}
                query={{
                    key: GOOGLE_PLACES_API_KEY,
                    language: 'en',
                }}
                styles={{
                    textInputContainer: {
                        height: 26,
                    },
                    textInput: {
                        height: 26,
                        color: darkTheme ? '#fff' : '#000',
                        fontSize: 16,
                        backgroundColor: 'transparent'
                    },
                    predefinedPlacesDescription: {
                        color: darkTheme ? darkTtextColor: lightTextColor,
                    },
                }}
                enablePoweredByContainer={false}
                disableScroll={true}
                listEmptyComponent={
                    <ThemedText>No results, sorry.</ThemedText>
                }
              />
            </View>
            {errors.address ? (
                <Text style={styles.errorText}>{errors.address}</Text>
            ) : null}
        </View>
    )
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      paddingHorizontal: 20,
    },
    form: {
      paddingHorizontal: 20,
      paddingBottom: 20,
      borderRadius: 10,
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
    image: {
        width: 100,
        height: 100,
        margin: 10,
        borderRadius: 75,
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
});