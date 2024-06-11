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


interface Errors {
    description?: string;
    paid?: any;
    amount?: any
}

export default function InvoiceCreate() {
    const { color } = useSelector((state: RootState) => state.settings);
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
            <ThemedView style={styles.form}>
                <Text style={[styles.label, {marginBottom: 5}]}>{job.description}</Text>
                <Text style={[styles.label, {marginBottom: 5, textAlign: 'right'}]}>for {job.client}</Text>

                <FlatList 
                data={charges}
                renderItem={({item}) => {
                    return (
                    <View style={styles.dataContainer}>
                        <TouchableOpacity onPress={() => handleChargeDelete(item.description)}><Text style={styles.label}>{item.description}  <Ionicons style={{color: 'red', fontSize: 20}} name="trash-outline"/></Text></TouchableOpacity>
                        <Text style={styles.label}>${item.amount}</Text>
                    </View>
                    )
                }}
                ItemSeparatorComponent={<View style={{ height: 10, borderTopColor: 'black', borderTopWidth: 1}}/>}
                ListEmptyComponent={<Text style={[styles.label, {marginBottom: 5}]}>No charges added yet</Text>}
                ListFooterComponent={<View style={{ height: 10, borderTopColor: 'black', borderTopWidth: 1}} />}
                />
                <TouchableOpacity style={[styles.button, {backgroundColor: color}]} onPress={() => setModalVisible(true)}><Text style={[styles.headerText, {color: 'white'}]}>+ Charge</Text></TouchableOpacity>
                
                <View style={[styles.dataContainer, {marginVertical: 5}]}>
                    <Text style={styles.label}>Price</Text>
                    <Text style={styles.label}>${price}</Text>
                </View>
                <View style={{ height: 10, borderTopColor: 'black', borderTopWidth: 1}} />
                <Text style={styles.label}>Paid</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter amount paid"
                    value={paid}
                    onChangeText={setPaid}
                    keyboardType="numeric"
                />
                {errors.paid ? (
                    <Text style={styles.errorText}>{errors.paid}</Text>
                ) : null}
                
                <TouchableOpacity style={[styles.button, {backgroundColor: color}]} onPress={() => handleSubmit()}><Text style={[styles.headerText, {color: 'white'}]}>Save</Text></TouchableOpacity>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(!modalVisible)}>
                    <View style={styles.centeredView}>
                        <View style={[styles.card, {padding: 10}]}>
                            <Text style={[styles.name, {padding: 10}]}>Charge for...</Text>
                            <Text style={styles.label}>Description</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Description"
                                value={description}
                                onChangeText={setDescription}
                            />
                            {errors.description ? (
                                <Text style={styles.errorText}>{errors.description}</Text>
                            ) : null}
                            <Text style={styles.label}>How much?</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter amount"
                                value={amount}
                                onChangeText={setAmount}
                                keyboardType="numeric"
                            />
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
                        </View>
                    </View>
                </Modal>
            <CustomAlert
                title='Invoice error'
                visible={alertVisible}
                message={error}
                onClose={() => setAlertVisible(false)}
            />
            </ThemedView>
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
    card: {
        backgroundColor: "white",
        borderRadius: 16,
        width: '80%',
        borderWidth: 2,
        marginHorizontal: 10,
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