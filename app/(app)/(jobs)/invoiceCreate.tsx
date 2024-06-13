import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Text,
  Platform,
  ActivityIndicator,
  ScrollView,
  Modal,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { RootState, useAppDispatch } from "@/app/(redux)/store";
import { useRouter } from "expo-router";

import { ThemedView } from "@/components/ThemedView";
import CustomAlert from "@/constants/customAlert";
import axiosInstance from "@/axios";
import { setInvoice } from "@/app/(redux)/jobSlice";
import { ThemedSecondaryView } from "@/components/ThemedSecondaryView";
import { ThemedText } from "@/components/ThemedText";
import { commonStyles } from "@/constants/commonStyles";
import { darkMainColor, darkTtextColor, lightMainColor, lightTextColor } from "@/settings";


interface Errors {
    description?: string;
    paid?: any;
    amount?: any
}

export default function InvoiceCreate() {
    const { color, darkTheme } = useSelector((state: RootState) => state.settings);
    const {job, invoice} = useSelector((state: RootState) => state.job);
    const [modalVisible, setModalVisible] = useState(false);
    const [paid, setPaid] = useState<number>(0);
    const [price, setPrice] = useState<number>(0);
    const [description, setDescription] = useState<string>("");
    const [amount, setAmount] = useState<number>(0);
    const [charges, setCharges] = useState<Charge[]>([]);
    const [errors, setErrors] = useState<Errors>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [alertVisible, setAlertVisible] = useState(false);
    const router = useRouter();
    const dispatch = useAppDispatch();

    const validateForm = () => {
        let errors: Errors = {};
        if (!description) errors.description = "Description is required";
        setErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async () => {
        if (Object.keys(charges).length !== 0) {
            setLoading(true);
            await axiosInstance
            .post(`jobs/invoice/create/${job.id}/`, {price: price, paid: paid, charges: charges})
            .then(function(response) {
                dispatch(setInvoice(response.data));
                router.push('(app)/(jobs)/invoice');
            })
            .catch(function(error) {
                console.error('Error creating invoice:', error);
                if (error.response.status === 404) {
                    setError(error.response.data.message);
                    setLoading(false);
                    setAlertVisible(true);
                } else {
                    setError(error.message);
                    setLoading(false);
                    setAlertVisible(true);
                }
            });
        } else {
            setError('No charges added yet, please create at least one.');
            setAlertVisible(true);
        }
    };

    type Charge = {
        description: string;
        amount: number;
    };

    const handleCharge = () => {
        if (validateForm()) {
            const newCharge: Charge = {description: description, amount: amount};
            setCharges((prevCharges: Charge[]) => [...prevCharges, newCharge]);
            setDescription("");
            setAmount(0);
            setCharges((prevCharges: Charge[]) => {
                const newPrice = prevCharges.reduce((accumulator, charge) => accumulator + Number(charge.amount), 0);
                setPrice(newPrice);
                return prevCharges;
            });
            setModalVisible(false);
        };
    };

    const handleChargeDelete = (description: string) => {
        const updatedCharges = charges.filter((charge: Charge) => charge.description !== description);
        setCharges(updatedCharges);
        const newPrice = updatedCharges.reduce((accumulator: number, charge: Charge) => accumulator + Number(charge.amount), 0);
        setPrice(newPrice);
    };

    return (
        <KeyboardAvoidingView
            behavior="padding"
            keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
            style={styles.container}
        >
            {loading ? (
            <ActivityIndicator color={color} size={36} />
            ) : (
            <ThemedSecondaryView style={styles.form}>
                <ThemedText style={[styles.label, {marginBottom: 5}]}>{job.description}</ThemedText>
                <ThemedText style={[styles.label, {marginBottom: 5, textAlign: 'right'}]}>for {job.client}</ThemedText>

                <FlatList 
                data={charges}
                renderItem={({item}) => {
                    return (
                    <View style={styles.dataContainer}>
                        <TouchableOpacity onPress={() => handleChargeDelete(item.description)}><ThemedText style={styles.label}>{item.description}  <Ionicons style={{color: 'red', fontSize: 20}} name="trash-outline"/></ThemedText></TouchableOpacity>
                        <ThemedText style={styles.label}>${item.amount}</ThemedText>
                    </View>
                    )
                }}
                ItemSeparatorComponent={<View style={{ height: 10, borderTopColor: 'black', borderTopWidth: 1}}/>}
                ListEmptyComponent={<ThemedText style={[styles.label, {marginBottom: 5}]}>No charges added yet</ThemedText>}
                ListFooterComponent={<View style={{ height: 10, borderTopColor: 'black', borderTopWidth: 1}} />}
                />
                <TouchableOpacity style={[styles.button, {backgroundColor: color}]} onPress={() => setModalVisible(true)}><Text style={{color: 'white', margin: 'auto'}}>+ Charge</Text></TouchableOpacity>
                <View style={[commonStyles.action, {backgroundColor: darkTheme ? darkMainColor : lightMainColor, borderBottomColor: color, justifyContent: 'space-between'}]}>
                    <ThemedText style={styles.label}>Price</ThemedText>
                    <ThemedText style={styles.label}>${price}</ThemedText>
                </View>
                <ThemedText type="subtitle">Paid</ThemedText>
                <View style={[commonStyles.action, {backgroundColor: darkTheme ? darkMainColor : lightMainColor, borderBottomColor: color}]}>
                    <TextInput
                        style={[commonStyles.textInput, {color: darkTheme ? darkTtextColor: lightTextColor}]}
                        placeholder="Enter amount paid"
                        placeholderTextColor={darkTheme ? darkTtextColor: lightTextColor}
                        value={paid}
                        onChangeText={setPaid}
                        keyboardType="numeric"
                    />
                </View>
                {errors.paid ? (
                    <Text style={styles.errorText}>{errors.paid}</Text>
                ) : null}
                <View style={{flexDirection: 'row',justifyContent: 'space-evenly'}}>
                    <TouchableOpacity style={[styles.button, {backgroundColor: color}]} onPress={() => handleSubmit()}><Text style={[styles.headerText, {color: 'white'}]}>Save</Text></TouchableOpacity>
                    <TouchableOpacity style={[styles.button, {backgroundColor: color}]} onPress={() => router.back()}><Text style={[styles.headerText, {color: 'white'}]}>Cancel</Text></TouchableOpacity>
                </View>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(!modalVisible)}>
                    <View style={styles.centeredView}>
                        <ThemedSecondaryView style={[styles.card, {padding: 10}]}>
                            <ThemedText type="subtitle" style={{textAlign: 'center', margin: 5}}>New Charge</ThemedText>
                            <ThemedText type="subtitle">Description</ThemedText>
                            <View style={[commonStyles.action, {backgroundColor: darkTheme ? darkMainColor : lightMainColor, borderBottomColor: color}]}>
                                <TextInput
                                    style={[commonStyles.textInput, {color: darkTheme ? darkTtextColor: lightTextColor}]}
                                    placeholder="Enter description"
                                    placeholderTextColor={darkTheme ? darkTtextColor: lightTextColor}
                                    value={description}
                                    onChangeText={setDescription}
                                />
                            </View>
                            {errors.description ? (
                                <Text style={styles.errorText}>{errors.description}</Text>
                            ) : null}
                            <ThemedText type="subtitle">How much?</ThemedText>
                            <View style={[commonStyles.action, {backgroundColor: darkTheme ? darkMainColor : lightMainColor, borderBottomColor: color}]}>
                                <TextInput
                                    style={[commonStyles.textInput, {color: darkTheme ? darkTtextColor: lightTextColor}]}
                                    placeholder="Enter amount"
                                    placeholderTextColor={darkTheme ? darkTtextColor: lightTextColor}
                                    value={amount}
                                    onChangeText={setAmount}
                                    keyboardType="numeric"
                                />
                            </View>
                            {errors.amount ? (
                                <Text style={styles.errorText}>{errors.amount}</Text>
                            ) : null}
                            <View style={[styles.dataContainer, {padding: 10, justifyContent: 'space-evenly'}]}>
                            <TouchableOpacity
                                style={[styles.button, {backgroundColor: color, marginHorizontal: 5, flex: 1}]}
                                onPress={() => setModalVisible(!modalVisible)}>
                                <Text style={{color:'white', textAlign: 'center'}}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[[styles.button, {backgroundColor: color, marginHorizontal: 5, flex: 1}]]}
                                onPress={() => handleCharge()}>
                                <Text style={{color:'white', textAlign: 'center'}}>Add</Text>
                            </TouchableOpacity>
                            </View>
                        </ThemedSecondaryView>
                    </View>
                </Modal>
            <CustomAlert
                title='Invoice error'
                visible={alertVisible}
                message={error}
                onClose={() => setAlertVisible(false)}
            />
            </ThemedSecondaryView>
            )}
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
        padding: 10,
        borderRadius: 10,
        verticalAlign: 'middle',
        alignSelf: 'center',
        width: 100,
        ...Platform.select({
            ios: {
            shadowOffset: { width: 2, height: 2 },
            shadowColor: "#fff",
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
    card: {
        borderRadius: 10,
        width: '80%',
        borderWidth: 1,
        marginHorizontal: 10,
        shadowColor: "#333",
        padding: 5,
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
      nameContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        borderBottomWidth: 1,
      },
      name: {
        fontSize: 20,
        fontWeight: "bold",
      },
      dataContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      },    
      LabelText: {
        fontSize: 16,
        fontWeight: "bold",
      },  
      dataText: {
          fontSize: 12,
          color: "darkblue"
      },
      centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
    },    
});