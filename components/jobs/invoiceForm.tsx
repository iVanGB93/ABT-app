import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text, Modal, FlatList, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { RootState, useAppDispatch } from '@/app/(redux)/store';
import { useRouter } from 'expo-router';

import { ThemedView } from '@/components/ThemedView';
import CustomAlert from '@/constants/customAlert';
import { setInvoice } from '@/app/(redux)/jobSlice';
import { ThemedSecondaryView } from '@/components/ThemedSecondaryView';
import { ThemedText } from '@/components/ThemedText';
import { commonStyles } from '@/constants/commonStyles';
import {
  darkMainColor,
  darkThirdColor,
  darkTextColor,
  lightMainColor,
  lightTextColor,
} from '@/settings';
import { commonStylesForm } from '@/constants/commonStylesForm';
import { commonStylesCards } from '@/constants/commonStylesCard';
import { useJobActions } from '@/hooks';

interface InvoiceFormProps {
  action: string;
  loading: boolean;
  setLoading: any;
}

interface Errors {
  description?: string;
  paid?: any;
  amount?: any;
}

export default function InvoiceForm({ action, loading, setLoading }: InvoiceFormProps) {
  const { color, darkTheme } = useSelector((state: RootState) => state.settings);
  const { job, invoice, charges } = useSelector((state: RootState) => state.job);
  const [modalVisible, setModalVisible] = useState(false);
  const [paid, setPaid] = useState<any>(action === 'create' ? 0 : invoice.paid);
  const [price, setPrice] = useState<any>(action === 'create' ? 0 : invoice.total);
  const [newCharges, setNewCharges] = useState<NewCharge[]>(action === 'create' ? [] : charges);
  const [description, setDescription] = useState<string>('');
  const [amount, setAmount] = useState<any>(0);
  const [errors, setErrors] = useState<Errors>({});
  const [error, setError] = useState<string>('');
  const [alertVisible, setAlertVisible] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { createUpdateInvoice } = useJobActions();

  const validateForm = () => {
    let errors: Errors = {};
    if (!description) errors.description = 'Description is required';
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (Object.keys(newCharges).length !== 0) {
      setLoading(true);
      try {
        const result = await createUpdateInvoice(job.id, action, {
          price: price,
          paid: paid,
          charges: newCharges,
        });
        if (result) {
          dispatch(setInvoice(result));
          router.replace('/(app)/(jobs)/invoice');
        } else {
          setError('Error creating invoice');
          setAlertVisible(true);
        }
        setLoading(false);
      } catch (error: any) {
        console.error('Error creating invoice:', error);
        setError(error.message || 'Error creating invoice');
        setLoading(false);
        setAlertVisible(true);
      }
    } else {
      setError('No charges added yet, please create at least one.');
      setAlertVisible(true);
    }
  };

  type NewCharge = {
    description: string;
    amount: number;
  };

  const handleCharge = () => {
    if (validateForm()) {
      const newCharge: NewCharge = { description: description, amount: amount };
      setNewCharges((prevCharges: NewCharge[]) => [...prevCharges, newCharge]);
      setDescription('');
      setAmount(0);
      setNewCharges((prevCharges: NewCharge[]) => {
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

  const handleChargeDelete = (description: string) => {
    const updatedCharges = newCharges.filter(
      (charge: NewCharge) => charge.description !== description,
    );
    setNewCharges(updatedCharges);
    const newPrice = updatedCharges.reduce(
      (accumulator: number, charge: NewCharge) => accumulator + Number(charge.amount),
      0,
    );
    setPrice(newPrice);
  };

  return (
    <>
      <ThemedSecondaryView
        style={[commonStylesForm.form, { shadowColor: darkTheme ? '#fff' : '#000' }]}
      >
        <ThemedText type="subtitle" style={{ marginBottom: 5 }}>
          {job.description}
        </ThemedText>
        <ThemedText style={[styles.label, { marginBottom: 5, textAlign: 'right' }]}>
          for {job.client}
        </ThemedText>
        <FlatList
          data={newCharges}
          renderItem={({ item }) => {
            return (
              <View style={styles.dataContainer}>
                <TouchableOpacity onPress={() => handleChargeDelete(item.description)}>
                  <ThemedText style={styles.label}>
                    <Ionicons style={{ color: 'red', fontSize: 20 }} name="trash-outline" />
                    {item.description}{' '}
                  </ThemedText>
                </TouchableOpacity>
                <ThemedText style={styles.label}>${item.amount}</ThemedText>
              </View>
            );
          }}
          ItemSeparatorComponent={() => (
            <View style={{ height: 10, borderTopColor: 'white', borderTopWidth: 1 }} />
          )}
          ListEmptyComponent={
            <ThemedText style={[styles.label, { marginBottom: 5 }]}>
              No charges added yet
            </ThemedText>
          }
          ListFooterComponent={
            <View style={{ height: 10, borderTopColor: 'white', borderTopWidth: 1 }} />
          }
        />
        <TouchableOpacity
          style={[
            commonStyles.button,
            {
              borderColor: color,
              alignSelf: 'center',
              backgroundColor: darkTheme ? darkThirdColor : lightMainColor,
            },
          ]}
          onPress={() => setModalVisible(true)}
        >
          <ThemedText>+ Charge</ThemedText>
        </TouchableOpacity>
      </ThemedSecondaryView>

      <ThemedSecondaryView
        style={[commonStylesForm.form, { shadowColor: darkTheme ? '#fff' : '#000', marginTop: 30 }]}
      >
        <View style={[commonStyles.action, { justifyContent: 'space-between' }]}>
          <ThemedText style={[commonStyles.text_action, { marginTop: 0 }]} type="subtitle">
            Total Price
          </ThemedText>
          <ThemedText style={styles.label}>${price}</ThemedText>
        </View>
        <View style={[commonStyles.action, { justifyContent: 'space-between' }]}>
          <ThemedText style={[commonStyles.text_action, { marginTop: 0 }]} type="subtitle">
            Paid
          </ThemedText>
          <View style={styles.label}>
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
        </View>
        {errors.paid ? <Text style={styles.errorText}>{errors.paid}</Text> : null}
        <View
          style={{
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'space-evenly',
            marginTop: 15,
          }}
        >
          <TouchableOpacity
            style={[
              commonStyles.button,
              {
                borderColor: color,
                backgroundColor: darkTheme ? darkThirdColor : lightMainColor,
              },
            ]}
            onPress={() => handleSubmit()}
          >
            <ThemedText>Save</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              commonStyles.button,
              {
                borderColor: 'red',
                backgroundColor: darkTheme ? darkThirdColor : lightMainColor,
              },
            ]}
            onPress={() => router.back()}
          >
            <ThemedText style={{ color: 'red' }}>Cancel</ThemedText>
          </TouchableOpacity>
        </View>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(!modalVisible)}
        >
          <View style={[commonStyles.containerCentered, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
            <ThemedSecondaryView style={[commonStylesCards.card, { padding: 10, width: '90%' }]}>
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
                <Text style={styles.errorText}>{errors.description}</Text>
              ) : null}
              <ThemedText style={commonStyles.text_action} type="subtitle">
                How much?
              </ThemedText>
              <View style={commonStyles.action}>
                <Ionicons name="cash-outline" color={darkTheme ? darkTextColor : lightTextColor} />
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
              {errors.amount ? <Text style={styles.errorText}>{errors.amount}</Text> : null}
              <View style={[styles.dataContainer, { padding: 10, justifyContent: 'space-evenly' }]}>
                <TouchableOpacity
                  style={[
                    commonStyles.button,
                    {
                      borderColor: color,
                      marginHorizontal: 5,
                      flex: 1,
                      backgroundColor: darkTheme ? darkThirdColor : lightMainColor,
                    },
                  ]}
                  onPress={() => handleCharge()}
                >
                  <ThemedText>Save</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    [
                      commonStyles.button,
                      {
                        borderColor: 'red',
                        marginHorizontal: 5,
                        flex: 1,
                        backgroundColor: darkTheme ? darkThirdColor : lightMainColor,
                      },
                    ],
                  ]}
                  onPress={() => setModalVisible(!modalVisible)}
                >
                  <ThemedText style={{ color: 'red' }}>Cancel</ThemedText>
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
    </>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 'auto',
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 5,
    padding: 10,
    borderRadius: 5,
  },
  errorText: {
    color: 'red',
    marginBottom: 5,
  },
  loading: {
    flex: 1,
    marginTop: 20,
    verticalAlign: 'middle',
    alignSelf: 'center',
  },
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
