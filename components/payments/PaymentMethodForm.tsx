import React, { useState, useEffect } from 'react';
import { TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  PaymentMethodType,
  BusinessPaymentMethod,
  PaymentMethodCreateData,
} from '@/services/paymentService';
import { usePaymentMethodActions } from '@/hooks/usePayment';
import { commonStyles } from '@/constants/commonStyles';
import { ThemedText } from '../ThemedText';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/(redux)/store';
import { darkSecondColor, darkTextColor, lightSecondColor, lightTextColor } from '@/settings';
import { ThemedView } from '../ThemedView';
import { commonStylesForm } from '@/constants/commonStylesForm';

interface PaymentMethodFormProps {
  action?: any;
}

export default function PaymentMethodForm({ action }: PaymentMethodFormProps) {
  const { refreshPaymentMethodTypes, paymentMethodTypes, createMethod, updateMethod, isLoading } =
    usePaymentMethodActions();
  const { color, darkTheme, business } = useSelector((state: RootState) => state.settings);
  const { paymentMethods } = useSelector((state: RootState) => state.business);
  const [account_username, setAccount_username] = useState(action === 'create' ? '' : '');
  const [account_email, setAccount_email] = useState(action === 'create' ? '' : '');
  const [account_phone, setAccount_phone] = useState(action === 'create' ? '' : '');
  const [notes, setNotes] = useState(action === 'create' ? '' : '');
  const [is_enabled, setIs_enabled] = useState(action === 'create' ? true : false);
  const [is_default, setIs_default] = useState(action === 'create' ? false : false);
  const [selectedType, setSelectedType] = useState<PaymentMethodType | null>(null);
  const router = useRouter();

  const display_name = selectedType ? `My ${selectedType.name} Account` : '';

  useEffect(() => {
    refreshPaymentMethodTypes();
  }, []);

  const validateForm = () => {
    if (!selectedType) {
      Alert.alert('Error', 'Please select a payment method type');
      return false;
    }

    if (selectedType.requires_email && !account_email) {
      Alert.alert('Error', `${selectedType.name} requires an email address`);
      return false;
    }

    if (selectedType.requires_phone && !account_phone) {
      Alert.alert('Error', `${selectedType.name} requires a phone number`);
      return false;
    }

    if (selectedType.requires_username && !account_username) {
      Alert.alert('Error', `${selectedType.name} requires a username`);
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const paymentData: PaymentMethodCreateData = {
        action: action,
        payment_type_id: selectedType?.id || 0,
        account_email,
        account_phone,
        account_username,
        display_name,
        notes,
        is_enabled,
        is_default,
      };
      if (action === 'create') {
        const result = await createMethod(business.id, paymentData);
        if (result && (result as any).OK) {
          router.replace('/(app)/(business)/(paymentMethods)');
        } else {
          const errorMessage =
            (result as any)?.error || (result as any)?.message || 'Failed to create payment method';
          Alert.alert('Error', errorMessage);
        }
      } else {
        const result = await updateMethod(business.id, paymentData);
        if (result) {
          router.replace('/(app)/(business)/(paymentMethods)');
        } else {
          Alert.alert('Error', 'Failed to update payment method');
        }
      }
    } catch (error) {
      console.error('Error saving payment method:', error);
    }
  };

  const handleTypeSelect = (type: PaymentMethodType) => {
    setSelectedType(type);
    console.log(type);

    /* setFormData((prev) => ({
      ...prev,
      payment_type_id: type.id,
      display_name: prev.display_name || type.name,
    })); */
  };

  const getPaymentIcon = (code: string) => {
    const icons: { [key: string]: keyof typeof Ionicons.glyphMap } = {
      paypal: 'logo-paypal',
      venmo: 'card',
      cashapp: 'cash',
      zelle: 'flash',
      bank_transfer: 'business',
      stripe: 'card',
      apple_pay: 'logo-apple',
      google_pay: 'logo-google',
    };
    return icons[code] || 'card-outline';
  };

  return (
    <ScrollView>
      {paymentMethodTypes.length === 0 ? (
        <ThemedText type="default" style={{ textAlign: 'center' }}>
          No payment methods available, sorry
        </ThemedText>
      ) : (
        <>
          <ThemedText type="subtitle" style={{ textAlign: 'center', marginBottom: 5 }}>
            Payment Method Type
          </ThemedText>
          <ThemedView style={styles.typeGrid}>
            {paymentMethodTypes
              .filter((type) => {
              const isActive = type.is_active;
              const isNotInPaymentMethods = !paymentMethods.some((method: any) => method.payment_type === type.id);
              return isActive && isNotInPaymentMethods;
              })
              .map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                styles.typeCard,
                {
                  borderColor: darkTheme ? darkTextColor : lightTextColor,
                  backgroundColor: selectedType?.id === type.id ? color + '20' : 'transparent',
                },
                ]}
                onPress={() => handleTypeSelect(type)}
              >
                <Ionicons
                name={getPaymentIcon(type.code)}
                size={32}
                color={
                  selectedType?.id === type.id
                  ? color
                  : darkTheme
                  ? darkTextColor
                  : lightTextColor
                }
                />
                <ThemedText
                style={[
                  styles.typeName,
                  {
                  color:
                    selectedType?.id === type.id
                    ? color
                    : darkTheme
                    ? darkTextColor
                    : lightTextColor,
                  fontWeight: selectedType?.id === type.id ? '600' : '400',
                  },
                ]}
                >
                {type.name}
                </ThemedText>
              </TouchableOpacity>
              ))}
          </ThemedView>
        </>
      )}
      {/* Form Fields */}
      {selectedType && (
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={{ textAlign: 'center' }}>
            {display_name}
          </ThemedText>
          <ThemedText type="default" style={{ textAlign: 'center' }}>
            add your details
          </ThemedText>
          {/* Email (if required) */}
          {selectedType.requires_email && (
            <ThemedView style={styles.fieldContainer}>
              <ThemedText style={commonStylesForm.label}>Email Address *</ThemedText>
              <ThemedView
                style={[
                  commonStylesForm.action,
                  { borderBottomColor: darkTheme ? darkTextColor : lightTextColor },
                ]}
              >
                <Ionicons
                  style={{ marginBottom: 5, fontSize: 16 }}
                  name="mail"
                  color={darkTheme ? darkTextColor : lightTextColor}
                />
                <TextInput
                  style={[commonStylesForm.textInput, { borderColor: color, color: color }]}
                  value={account_email}
                  onChangeText={(text) => setAccount_email(text)}
                  placeholder={account_email ? account_email : 'your@email.com'}
                  placeholderTextColor={darkTheme ? darkTextColor : lightTextColor}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </ThemedView>
            </ThemedView>
          )}
          {/* Phone (if required) */}
          {selectedType.requires_phone && (
            <ThemedView style={styles.fieldContainer}>
              <ThemedText style={commonStylesForm.label}>Phone Number *</ThemedText>
              <ThemedView
                style={[
                  commonStylesForm.action,
                  { borderBottomColor: darkTheme ? darkTextColor : lightTextColor },
                ]}
              >
                <Ionicons
                  style={{ marginBottom: 5, fontSize: 16 }}
                  name="call"
                  color={darkTheme ? darkTextColor : lightTextColor}
                />
                <TextInput
                  style={[
                    commonStylesForm.textInput,
                    { color: darkTheme ? darkTextColor : lightTextColor },
                  ]}
                  value={account_phone}
                  onChangeText={(text) => setAccount_phone(text)}
                  placeholder={account_phone ? account_phone : '+1 (555) 123-4567'}
                  placeholderTextColor={darkTheme ? darkTextColor : lightTextColor}
                  keyboardType="phone-pad"
                />
              </ThemedView>
            </ThemedView>
          )}
          {/* Username (if required) */}
          {selectedType.requires_username && (
            <ThemedView style={styles.fieldContainer}>
              <ThemedText style={commonStylesForm.label}>Username *</ThemedText>
              <ThemedView
                style={[
                  commonStylesForm.action,
                  { borderBottomColor: darkTheme ? darkTextColor : lightTextColor },
                ]}
              >
                <Ionicons
                  style={{ marginBottom: 5, fontSize: 16 }}
                  name="person"
                  color={darkTheme ? darkTextColor : lightTextColor}
                />
                <TextInput
                  style={[
                    commonStylesForm.textInput,
                    { color: darkTheme ? darkTextColor : lightTextColor },
                  ]}
                  value={account_username}
                  onChangeText={(text) => setAccount_username(text)}
                  placeholder="username"
                  placeholderTextColor={darkTheme ? darkTextColor : lightTextColor}
                  autoCapitalize="none"
                />
              </ThemedView>
            </ThemedView>
          )}
          {/* Notes */}
          <ThemedView style={styles.fieldContainer}>
            <ThemedText style={commonStylesForm.label}>Notes (Optional)</ThemedText>
            <ThemedView
              style={[
                commonStylesForm.action,
                { borderBottomColor: darkTheme ? darkTextColor : lightTextColor },
              ]}
            >
              <TextInput
                style={[
                  commonStylesForm.textInput,
                  { color: darkTheme ? darkTextColor : lightTextColor },
                ]}
                value={notes}
                onChangeText={(text) => setNotes(text)}
                placeholder="Additional notes..."
                placeholderTextColor={darkTheme ? darkTextColor : lightTextColor}
              />
            </ThemedView>
          </ThemedView>
          {/* Settings */}
          <ThemedView style={styles.section}>
            <ThemedText type="subtitle">Settings</ThemedText>

            <ThemedView style={styles.switchContainer}>
              <ThemedText type="subtitle">Enabled</ThemedText>
              <Switch
                value={is_enabled}
                onValueChange={(value) => setIs_enabled(value)}
                trackColor={{
                  false: darkTheme ? darkTextColor + '30' : lightTextColor + '30',
                  true: darkTheme ? darkTextColor + '30' : lightTextColor + '30',
                }}
                thumbColor={is_enabled ? color : darkTheme ? darkTextColor : lightTextColor}
              />
            </ThemedView>

            <ThemedView style={styles.switchContainer}>
              <ThemedText type="subtitle">Set as Default</ThemedText>
              <Switch
                value={is_default}
                onValueChange={(value) => setIs_default(value)}
                trackColor={{
                  false: darkTheme ? darkTextColor + '30' : lightTextColor + '30',
                  true: darkTheme ? darkTextColor + '30' : lightTextColor + '30',
                }}
                thumbColor={is_default ? color : darkTheme ? darkTextColor : lightTextColor}
              />
            </ThemedView>
          </ThemedView>
          <ThemedView style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                commonStyles.button,
                {
                  borderColor: color,
                  backgroundColor: darkTheme ? darkSecondColor : lightSecondColor,
                },
              ]}
              onPress={() => handleSave()}
              disabled={isLoading || !selectedType}
            >
              <ThemedText>
                {isLoading ? 'Saving...' : action === 'create' ? 'Save' : 'Update'}
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[commonStyles.button, { borderColor: 'red' }]}
              onPress={() => router.back()}
            >
              <ThemedText style={{ color: 'red' }}>Cancel</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 20,
    paddingHorizontal: 10,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  typeCard: {
    width: '40%',
    padding: 15,
    borderWidth: 2,
    borderRadius: 10,
    alignItems: 'center',
    minHeight: 70,
    justifyContent: 'center',
  },
  typeName: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 10,
  },
});
