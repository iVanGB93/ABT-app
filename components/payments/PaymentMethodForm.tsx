import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor';
import { usePayment } from '@/hooks/usePayment';
import { PaymentMethodType, BusinessPaymentMethod, PaymentMethodCreateData } from '@/services/paymentService';
import { commonStyles } from '@/constants/commonStyles';

interface PaymentMethodFormProps {
  paymentTypes: PaymentMethodType[];
  editingMethod?: BusinessPaymentMethod | null;
  businessId: number;
  onSave: () => void;
  onCancel: () => void;
}

export const PaymentMethodForm: React.FC<PaymentMethodFormProps> = ({
  paymentTypes,
  editingMethod,
  businessId,
  onSave,
  onCancel,
}) => {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const secondaryColor = useThemeColor({}, 'tabIconDefault');
  const borderColor = useThemeColor({}, 'tabIconDefault') + '30';

  const { createMethod, updateMethod, isLoading } = usePayment();

  const [formData, setFormData] = useState({
    payment_type_id: 0,
    account_email: '',
    account_phone: '',
    account_username: '',
    account_number: '',
    display_name: '',
    notes: '',
    is_enabled: true,
    is_default: false,
  });

  const [selectedType, setSelectedType] = useState<PaymentMethodType | null>(null);

  useEffect(() => {
    if (editingMethod) {
      setFormData({
        payment_type_id: editingMethod.payment_type.id,
        account_email: editingMethod.account_email || '',
        account_phone: editingMethod.account_phone || '',
        account_username: editingMethod.account_username || '',
        account_number: editingMethod.account_number || '',
        display_name: editingMethod.display_name || '',
        notes: editingMethod.notes || '',
        is_enabled: editingMethod.is_enabled,
        is_default: editingMethod.is_default,
      });
      setSelectedType(editingMethod.payment_type);
    }
  }, [editingMethod]);

  const validateForm = () => {
    if (!selectedType) {
      Alert.alert('Error', 'Please select a payment method type');
      return false;
    }

    if (selectedType.requires_email && !formData.account_email) {
      Alert.alert('Error', `${selectedType.name} requires an email address`);
      return false;
    }

    if (selectedType.requires_phone && !formData.account_phone) {
      Alert.alert('Error', `${selectedType.name} requires a phone number`);
      return false;
    }

    if (selectedType.requires_username && !formData.account_username) {
      Alert.alert('Error', `${selectedType.name} requires a username`);
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const paymentData: PaymentMethodCreateData = {
        payment_type_id: formData.payment_type_id,
        account_email: formData.account_email || undefined,
        account_phone: formData.account_phone || undefined,
        account_username: formData.account_username || undefined,
        account_number: formData.account_number || undefined,
        display_name: formData.display_name || undefined,
        notes: formData.notes || undefined,
        is_enabled: formData.is_enabled,
        is_default: formData.is_default,
      };

      if (editingMethod) {
        await updateMethod(businessId, editingMethod.id, paymentData);
      } else {
        await createMethod(businessId, paymentData);
      }
      
      onSave();
    } catch (error) {
      console.error('Error saving payment method:', error);
    }
  };

  const handleTypeSelect = (type: PaymentMethodType) => {
    setSelectedType(type);
    setFormData(prev => ({
      ...prev,
      payment_type_id: type.id,
      display_name: prev.display_name || type.name,
    }));
  };

  const getPaymentIcon = (code: string) => {
    const icons: { [key: string]: keyof typeof Ionicons.glyphMap } = {
      'paypal': 'logo-paypal',
      'venmo': 'card',
      'cashapp': 'cash',
      'zelle': 'flash',
      'bank_transfer': 'business',
      'stripe': 'card',
      'apple_pay': 'logo-apple',
      'google_pay': 'logo-google',
    };
    return icons[code] || 'card-outline';
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>
          {editingMethod ? 'Edit Payment Method' : 'Add Payment Method'}
        </Text>
      </View>

      {/* Payment Type Selection */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>Payment Method Type</Text>
        <View style={styles.typeGrid}>
          {paymentTypes.filter(type => type.is_active).map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.typeCard,
                { 
                  borderColor: borderColor,
                  backgroundColor: selectedType?.id === type.id ? tintColor + '20' : 'transparent'
                }
              ]}
              onPress={() => handleTypeSelect(type)}
            >
              <Ionicons
                name={getPaymentIcon(type.code)}
                size={32}
                color={selectedType?.id === type.id ? tintColor : secondaryColor}
              />
              <Text style={[
                styles.typeName, 
                { 
                  color: selectedType?.id === type.id ? tintColor : textColor,
                  fontWeight: selectedType?.id === type.id ? '600' : '400'
                }
              ]}>
                {type.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Form Fields */}
      {selectedType && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Account Details</Text>

          {/* Display Name */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: textColor }]}>Display Name</Text>
            <TextInput
              style={[styles.textInput, { borderColor, color: textColor }]}
              value={formData.display_name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, display_name: text }))}
              placeholder={`My ${selectedType.name} Account`}
              placeholderTextColor={secondaryColor}
            />
          </View>

          {/* Email (if required) */}
          {selectedType.requires_email && (
            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: textColor }]}>
                Email Address *
              </Text>
              <TextInput
                style={[styles.textInput, { borderColor, color: textColor }]}
                value={formData.account_email}
                onChangeText={(text) => setFormData(prev => ({ ...prev, account_email: text }))}
                placeholder="your@email.com"
                placeholderTextColor={secondaryColor}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          )}

          {/* Phone (if required) */}
          {selectedType.requires_phone && (
            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: textColor }]}>
                Phone Number *
              </Text>
              <TextInput
                style={[styles.textInput, { borderColor, color: textColor }]}
                value={formData.account_phone}
                onChangeText={(text) => setFormData(prev => ({ ...prev, account_phone: text }))}
                placeholder="+1 (555) 123-4567"
                placeholderTextColor={secondaryColor}
                keyboardType="phone-pad"
              />
            </View>
          )}

          {/* Username (if required) */}
          {selectedType.requires_username && (
            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: textColor }]}>
                Username *
              </Text>
              <TextInput
                style={[styles.textInput, { borderColor, color: textColor }]}
                value={formData.account_username}
                onChangeText={(text) => setFormData(prev => ({ ...prev, account_username: text }))}
                placeholder="username"
                placeholderTextColor={secondaryColor}
                autoCapitalize="none"
              />
            </View>
          )}

          {/* Account Number (optional) */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: textColor }]}>Account Number (Optional)</Text>
            <TextInput
              style={[styles.textInput, { borderColor, color: textColor }]}
              value={formData.account_number}
              onChangeText={(text) => setFormData(prev => ({ ...prev, account_number: text }))}
              placeholder="Last 4 digits"
              placeholderTextColor={secondaryColor}
              maxLength={4}
              keyboardType="numeric"
            />
          </View>

          {/* Notes */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: textColor }]}>Notes (Optional)</Text>
            <TextInput
              style={[styles.textInput, styles.textArea, { borderColor, color: textColor }]}
              value={formData.notes}
              onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
              placeholder="Additional notes..."
              placeholderTextColor={secondaryColor}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Settings */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Settings</Text>
            
            <View style={styles.switchContainer}>
              <Text style={[styles.switchLabel, { color: textColor }]}>Enabled</Text>
              <Switch
                value={formData.is_enabled}
                onValueChange={(value) => setFormData(prev => ({ ...prev, is_enabled: value }))}
                trackColor={{ false: secondaryColor + '30', true: tintColor + '30' }}
                thumbColor={formData.is_enabled ? tintColor : secondaryColor}
              />
            </View>

            <View style={styles.switchContainer}>
              <Text style={[styles.switchLabel, { color: textColor }]}>Set as Default</Text>
              <Switch
                value={formData.is_default}
                onValueChange={(value) => setFormData(prev => ({ ...prev, is_default: value }))}
                trackColor={{ false: secondaryColor + '30', true: tintColor + '30' }}
                thumbColor={formData.is_default ? tintColor : secondaryColor}
              />
            </View>
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton, { borderColor: secondaryColor }]}
          onPress={onCancel}
        >
          <Text style={[styles.buttonText, { color: secondaryColor }]}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.saveButton, { backgroundColor: tintColor }]}
          onPress={handleSave}
          disabled={isLoading || !selectedType}
        >
          <Text style={[styles.buttonText, { color: tintColor === '#fff' ? '#000' : 'white' }]}>
            {isLoading ? 'Saving...' : editingMethod ? 'Update' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeCard: {
    width: '45%',
    padding: 16,
    borderWidth: 2,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 100,
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
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 48,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 32,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 2,
  },
  saveButton: {
    // backgroundColor set dynamically
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
