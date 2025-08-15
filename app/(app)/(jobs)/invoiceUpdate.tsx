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
import { setInvoice } from '@/app/(redux)/jobSlice';
import CustomAlert from '@/constants/customAlert';
import { ThemedSecondaryView } from '@/components/ThemedSecondaryView';
import { ThemedText } from '@/components/ThemedText';
import { commonStyles } from '@/constants/commonStyles';
import { darkMainColor, darkTextColor, lightMainColor, lightTextColor } from '@/settings';
import { StatusBar } from 'expo-status-bar';
import { commonStylesForm } from '@/constants/commonStylesForm';
import { commonStylesCards } from '@/constants/commonStylesCard';
import { useJobActions } from '@/hooks';
import InvoiceForm from '@/components/jobs/invoiceForm';

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
        const result = await createUpdateInvoice(job.id, 'update', { price: price, paid: paid, charges: newCharges });
        if (result) {
          dispatch(setInvoice(result));
          router.push('/(app)/(jobs)/invoice');
        } else {
          setError('Error updating invoice');
          setAlertVisible(true);
        }
        setLoading(false);
      } catch (error: any) {
        console.error('Error updating invoice:', error);
        setError(error.message || 'Error updating invoice');
        setLoading(false);
        setAlertVisible(true);
      }
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
          <InvoiceForm action="update" loading={loading} setLoading={setLoading} />
        )}
      </KeyboardAvoidingView>
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
