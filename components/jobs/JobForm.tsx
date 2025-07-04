import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
  Switch,
} from "react-native";
import { useSelector } from 'react-redux';
import SelectDropdown from 'react-native-select-dropdown';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from "expo-router";
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

import { RootState } from "@/app/(redux)/store";
import { ThemedText } from "@/components/ThemedText";
import { commonStyles } from "@/constants/commonStyles";
import { darkMainColor, darkTtextColor, lightMainColor, lightTextColor } from "@/settings";


interface JobFormProps {
    clientsNames?: any;
    setClient?: any;
    description?: string;
    setDescription?: any;
    address?: string;
    setAddress?: any;
    price?: string;
    setPrice?: any;
    errors?: any;
    isEnabled?: any;
    toggleSwitch?: any;
    clientAddress?: any;
    isUpdate?: boolean;
};

export default function JobForm({clientsNames, setClient, description, setDescription, address, setAddress, price, setPrice, errors, isEnabled, toggleSwitch, clientAddress, isUpdate }: JobFormProps) {
    const {color, darkTheme } = useSelector((state: RootState) => state.settings);
    const router = useRouter();

    return (
        <View>
            {!isUpdate ? <>
            <ThemedText type="subtitle">Client</ThemedText>
            <View style={{flexDirection: 'row'}}>
                <SelectDropdown
                    data={clientsNames}
                    onSelect={(selectedItem: string, index: number) => {
                        setClient(selectedItem);
                    }}
                    renderButton={(selectedItem, isOpened) => {
                        return (
                        <View style={[styles.dropdownButtonStyle, {borderBottomColor: darkTheme ? '#f2f2f2' : '#000'}]}>
                            <ThemedText style={styles.dropdownButtonTxtStyle}>
                            {(selectedItem ) || 'Select the client'}
                            </ThemedText>
                            <Ionicons name={isOpened ? 'chevron-up' : 'chevron-down'} size={26} color={darkTheme ? '#fff' : '#000'} />
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
                <TouchableOpacity onPress={() => router.push('(app)/(clients)/clientCreate')} style={[styles.buttonAdd, {backgroundColor: darkTheme ? darkMainColor: lightMainColor, borderColor: color}]}>
                    <Ionicons name="person-add-outline" color={color} size={28}/>
                </TouchableOpacity>
            </View>
            {errors.client ? (
                <Text style={styles.errorText}>{errors.client}</Text>
            ) : null}
            </>: null}
            <ThemedText style={commonStyles.text_action} type="subtitle">Description</ThemedText>
            <View style={[commonStyles.action, { borderBottomColor: darkTheme ? '#f2f2f2' : '#000'}]}>
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

            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <ThemedText style={commonStyles.text_action} type="subtitle">Address</ThemedText>
                {isUpdate ? null :
                <View style={{flexDirection: 'row', justifyContent: 'flex-end', alignSelf: 'center',}}>
                    <Switch
                        trackColor={{false: '#3e3e3e', true: '#3e3e3e'}}
                        thumbColor={isEnabled ? color : darkTheme ? lightMainColor : darkMainColor}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={toggleSwitch}
                        value={isEnabled}
                    />
                    <ThemedText style={[styles.label, {alignSelf: 'center'}]}>use client's address</ThemedText>
                </View>
                }
            </View>
            {isEnabled ?
            <View style={[commonStyles.action, { borderBottomColor: darkTheme ? '#f2f2f2' : '#000'}]}>
                <Ionicons name="location" color={darkTheme ? darkTtextColor: lightTextColor} />
                <ThemedText style={[styles.label, {marginLeft: 10, height: 26}]}>{clientAddress()}</ThemedText>
            </View>
            :
            <View style={[commonStyles.action, { borderBottomColor: darkTheme ? '#f2f2f2' : '#000'}]}>
                <Ionicons name="location" color={darkTheme ? darkTtextColor: lightTextColor} />
                <GooglePlacesAutocomplete
                    placeholder={address ? address : "Job address"}
                    textInputProps={{
                        placeholderTextColor: darkTheme ? darkTtextColor: lightTextColor,
                    }}
                    onPress={(data, details = null) => {
                        setAddress(data.description);
                    }}
                    query={{
                        key: 'AIzaSyCxFKe0gGStVNei-UNOVB3e0-l89uN38rY',
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
            }
            {errors.address ? (
                <Text style={styles.errorText}>{errors.address}</Text>
            ) : null}
            
            <ThemedText style={[commonStyles.text_action, {marginTop: 5}]} type="subtitle">Price</ThemedText>
            <View style={[commonStyles.action, { borderBottomColor: darkTheme ? '#f2f2f2' : '#000'}]}>
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
        </View>
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
        width: '80%'
    },
      dropdownButtonTxtStyle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '500',
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
      buttonAdd: {
        borderRadius: 10,
        width: 40,
        height: 40,
        alignContent: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 'auto',
        borderBottomWidth: 1,
        borderRightWidth: 1,
      }
});