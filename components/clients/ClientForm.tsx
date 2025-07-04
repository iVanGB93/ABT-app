import React from "react";
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
import PhoneInput from 'react-native-phone-input';

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
            <View style={[commonStyles.action, { borderBottomColor: darkTheme ? '#f2f2f2' : '#000'}]}>
                <Ionicons style={{marginBottom: 5, fontSize: 16}} name="phone-portrait-sharp" color={darkTheme ? darkTtextColor: lightTextColor} />
                <PhoneInput
                initialCountry="us"
                style={commonStyles.textInput}
                textProps={{placeholder: "Phone number"}}
                autoFormat={true}
                textStyle={{ color: darkTheme ? darkTtextColor : lightTextColor, fontSize: 18 }}
                flagStyle={{ borderWidth: 0, marginHorizontal: 5 }}
                onChangePhoneNumber={(phoneNumber) => setPhone(phoneNumber)}
                initialValue={phone ? phone : ""}
                />
            </View>
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
                    placeholder={address ? address : "Client's address"}
                    textInputProps={{
                        placeholderTextColor: darkTheme ? darkTtextColor: lightTextColor,
                    }}
                    onPress={(data, details = null) => {
                        setAddress(data.description);
                    }}
                    query={{
                        key: '#',
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