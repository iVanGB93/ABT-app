import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Text,
  Platform,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
  Alert,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { RootState, useAppDispatch } from '@/app/(redux)/store';
import { useRouter } from 'expo-router';

import { ThemedView } from '@/components/ThemedView';
import axiosInstance from '@/axios';
import { setInvoice } from '@/app/(redux)/jobSlice';
import CustomAlert from '@/constants/customAlert';
import { ThemedSecondaryView } from '@/components/ThemedSecondaryView';
import { ThemedText } from '@/components/ThemedText';
import { commonStyles } from '@/constants/commonStyles';
import { darkMainColor, darkTextColor, lightMainColor, lightTextColor } from '@/settings';
import { StatusBar } from 'expo-status-bar';
import { commonStylesForm } from '@/constants/commonStylesForm';
import { commonStylesCards } from '@/constants/commonStylesCard';

interface Errors {
  description?: string;
  paid?: any;
  amount?: any;
}

export default function InvoiceUpdate() {
  const { color, darkTheme } = useSelector((state: RootState) => state.settings);
  const { job, invoice, charges } = useSelector((state: RootState) => state.job);
  const [modalVisible, setModalVisible] = useState(false);
  const [paid, setPaid] = useState<any>(invoice.paid);
  const [price, setPrice] = useState<any>(invoice.total);
  const [description, setDescription] = useState<string>('');
  const [amount, setAmount] = useState<any>(0);
  const [newCharges, setNewCharges] = useState<Charge[]>(charges);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [alertVisible, setAlertVisible] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const router = useRouter();
  const dispatch = useAppDispatch();

  const validateForm = () => {
    let errors: Errors = {};
    if (!description) errors.description = 'Description is required';
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (Object.keys(newCharges).length !== 0) {
      setLoading(true);
      await axiosInstance
        .put(`jobs/invoice/update/${job.id}/`, { price: price, paid: paid, charges: newCharges })
        .then(function (response) {
          dispatch(setInvoice(response.data));
          router.push('/(app)/(jobs)/invoice');
        })
        .catch(function (error) {
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
    id: number;
  };

  const handleCharge = () => {
    if (validateForm()) {
      const newCharge = { description: description, amount: amount, id: Math.random() };
      setNewCharges((prevCharges) => [...prevCharges, newCharge]);
      setDescription('');
      setAmount(0);
      setNewCharges((prevCharges) => {
        const newPrice = prevCharges.reduce(
          (accumulator, charge) => accumulator + Number(charge.amount),
          0,
        );
        setPrice(newPrice);
        return prevCharges;
      });
      setModalVisible(false);
    }
  };

  const handleChargeDelete = (id: number) => {
    const updatedCharges = newCharges.filter((charge) => charge.id !== id);
    setNewCharges(updatedCharges);
    const newPrice = updatedCharges.reduce(
      (accumulator, charge) => accumulator + Number(charge.amount),
      0,
    );
    setPrice(newPrice);
  };

  return (
    <>
      <StatusBar style={darkTheme ? 'light' : 'dark'} />
      <KeyboardAvoidingView
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        style={commonStyles.container}
      >
        <ThemedView style={commonStyles.tabHeader}>
          <TouchableOpacity
            onPress={() => {
              router.back();
            }}
          >
            <Ionicons name="arrow-back" size={24} color={darkTheme ? '#fff' : '#000'} />
          </TouchableOpacity>
          <ThemedText type="subtitle">Update Invoice</ThemedText>
          <ThemedText type="subtitle"></ThemedText>
        </ThemedView>
        {loading ? (
          <ActivityIndicator style={commonStyles.loading} color={color} size={36} />
        ) : (
          <ThemedSecondaryView
            style={[commonStylesForm.form, { shadowColor: darkTheme ? '#fff' : '#000' }]}
          >
            <ThemedText style={commonStyles.text_action}>{job.description}</ThemedText>
            <ThemedText style={[commonStyles.text_action, { textAlign: 'right' }]}>
              for {job.client}
            </ThemedText>

            <FlatList
              data={newCharges}
              renderItem={({ item }) => {
                return (
                  <View style={styles.dataContainer}>
                    <TouchableOpacity onPress={() => handleChargeDelete(item.id)}>
                      <ThemedText style={commonStyles.text_action}>
                        {item.description}{' '}
                        <Ionicons style={{ color: 'red', fontSize: 20 }} name="trash-outline" />
                      </ThemedText>
                    </TouchableOpacity>
                    <ThemedText style={commonStyles.text_action}>${item.amount}</ThemedText>
                  </View>
                );
              }}
              ItemSeparatorComponent={() => (
                <View style={{ height: 10, borderTopColor: 'white', borderTopWidth: 1 }} />
              )}
              ListEmptyComponent={
                <ThemedText style={commonStyles.text_action}>
                  No charges added yet
                </ThemedText>
              }
              ListFooterComponent={
                <View style={{ height: 10, borderTopColor: 'white', borderTopWidth: 1 }} />
              }
            />
            <TouchableOpacity
              style={[commonStyles.button, { borderColor: color, alignSelf: 'center' }]}
              onPress={() => setModalVisible(true)}
            >
              <ThemedText>
                + Charge
              </ThemedText>
            </TouchableOpacity>
            <View style={[commonStyles.action, { justifyContent: 'space-between' }]}>
              <ThemedText style={[commonStyles.text_action, { marginTop: 0 }]} type="subtitle">
                Price
              </ThemedText>
              <ThemedText style={commonStyles.text_action}>${price}</ThemedText>
            </View>
            <ThemedText style={commonStyles.text_action} type="subtitle">
              Paid
            </ThemedText>
            <View style={commonStyles.action}>
              <Ionicons name="cash-outline" color={darkTheme ? darkTextColor : lightTextColor} />
              <TextInput
                style={[
                  commonStyles.textInput,
                  { color: darkTheme ? darkTextColor : lightTextColor },
                ]}
                placeholder="Enter amount paid"
                placeholderTextColor={darkTheme ? darkTextColor : lightTextColor}
                value={paid}
                onChangeText={setPaid}
                keyboardType="numeric"
              />
            </View>
            {errors.paid ? <Text style={commonStyles.errorMsg}>{errors.paid}</Text> : null}

            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                justifyContent: 'space-evenly',
                marginTop: 15,
              }}
            >
              <TouchableOpacity
                style={[commonStyles.button, { borderColor: color }]}
                onPress={() => handleSubmit()}
              >
                <ThemedText >
                  Save
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[commonStyles.button, { borderColor: 'red' }]}
                onPress={() => router.back()}
              >
                <ThemedText style={{ color: 'red' }}>
                  Cancel
                </ThemedText>
              </TouchableOpacity>
            </View>
            <Modal
              animationType="slide"
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => {
                Alert.alert('Action canceled.');
                setModalVisible(!modalVisible);
              }}
            >
              <View style={commonStyles.containerCentered}>
                <ThemedSecondaryView style={[commonStylesCards.card, { padding: 10, width: '90%'}]}>
                  <ThemedText type="subtitle" style={{ textAlign: 'center', margin: 5 }}>
                    New Charge
                  </ThemedText>
                  <ThemedText style={commonStyles.text_action} type="subtitle">
                    Description
                  </ThemedText>
                  <View style={commonStyles.action}>
                    <Ionicons name="text" color={darkTheme ? darkTextColor : lightTextColor} />
                    <TextInput
                      style={[
                        commonStyles.textInput,
                        { color: darkTheme ? darkTextColor : lightTextColor },
                      ]}
                      placeholder="Enter description"
                      placeholderTextColor={darkTheme ? darkTextColor : lightTextColor}
                      value={description}
                      autoFocus={true}
                      onChangeText={setDescription}
                    />
                  </View>
                  {errors.description ? (
                    <Text style={commonStyles.errorMsg}>{errors.description}</Text>
                  ) : null}
                  <ThemedText style={commonStyles.text_action} type="subtitle">
                    How much?
                  </ThemedText>
                  <View style={commonStyles.action}>
                    <Ionicons
                      name="cash-outline"
                      color={darkTheme ? darkTextColor : lightTextColor}
                    />
                    <TextInput
                      style={[
                        commonStyles.textInput,
                        { color: darkTheme ? darkTextColor : lightTextColor },
                      ]}
                      placeholder="Enter amount"
                      placeholderTextColor={darkTheme ? darkTextColor : lightTextColor}
                      value={amount}
                      onChangeText={setAmount}
                      keyboardType="numeric"
                    />
                  </View>
                  {errors.amount ? <Text style={commonStyles.errorMsg}>{errors.amount}</Text> : null}
                  <View
                    style={[styles.dataContainer, { padding: 10, justifyContent: 'space-evenly' }]}
                  >
                    <TouchableOpacity
                      style={[commonStyles.button, { borderColor: color, marginHorizontal: 5, flex: 1 }]}
                      onPress={() => handleCharge()}
                    >
                      <ThemedText>
                        Save
                      </ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        [commonStyles.button, { borderColor: 'red', marginHorizontal: 5, flex: 1 }],
                      ]}
                      onPress={() => setModalVisible(!modalVisible)}
                    >
                      <ThemedText style={{ color: 'red' }}>
                        Cancel
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                </ThemedSecondaryView>
              </View>
            </Modal>
            <CustomAlert
              title="Invoice error"
              visible={alertVisible}
              message={error}
              onClose={() => setAlertVisible(false)}
            />
          </ThemedSecondaryView>
        )}
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginTop: 5,
  },
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    borderBottomWidth: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  dataContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  LabelText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  dataText: {
    fontSize: 12,
    color: 'darkblue',
  },
});
