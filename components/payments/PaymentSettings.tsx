import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor';
import { usePayment } from '@/hooks/usePayment';
import { BusinessPaymentMethod } from '@/services/paymentService';
import { PaymentMethodCard } from './PaymentMethodCard';
import { PaymentMethodForm } from './PaymentMethodForm';
import { commonStyles } from '@/constants/commonStyles';

interface PaymentSettingsProps {
  businessId: number;
}

export const PaymentSettings: React.FC<PaymentSettingsProps> = ({ businessId }) => {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const secondaryColor = useThemeColor({}, 'tabIconDefault');

  const {
    paymentMethodTypes,
    businessPaymentMethods,
    isLoading,
    hasErrors,
    errorMessage,
    paymentMessage,
    loadTypes,
    loadMethods,
    deleteMethod,
    toggleEnabled,
    setDefault,
    clearErrors,
  } = usePayment();

  const [showForm, setShowForm] = useState(false);
  const [editingMethod, setEditingMethod] = useState<BusinessPaymentMethod | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, [businessId]);

  const loadInitialData = async () => {
    try {
      await Promise.all([
        loadTypes(),
        loadMethods(businessId)
      ]);
    } catch (error) {
      console.error('Error loading payment data:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  };

  const handleAddNew = () => {
    setEditingMethod(null);
    setShowForm(true);
  };

  const handleEdit = (method: BusinessPaymentMethod) => {
    setEditingMethod(method);
    setShowForm(true);
  };

  const handleDelete = async (methodId: number) => {
    try {
      await deleteMethod(businessId, methodId);
    } catch (error) {
      Alert.alert('Error', 'Failed to delete payment method');
    }
  };

  const handleToggleEnabled = async (methodId: number) => {
    try {
      await toggleEnabled(methodId);
    } catch (error) {
      Alert.alert('Error', 'Failed to update payment method');
    }
  };

  const handleSetDefault = async (methodId: number) => {
    try {
      await setDefault(methodId);
    } catch (error) {
      Alert.alert('Error', 'Failed to set default payment method');
    }
  };

  const handleFormSave = () => {
    setShowForm(false);
    setEditingMethod(null);
    loadMethods(businessId); // Refresh the list
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingMethod(null);
  };

  const enabledMethods = businessPaymentMethods.filter(method => method.is_enabled);
  const disabledMethods = businessPaymentMethods.filter(method => !method.is_enabled);

  if (showForm) {
    return (
      <PaymentMethodForm
        paymentTypes={paymentMethodTypes}
        editingMethod={editingMethod}
        businessId={businessId}
        onSave={handleFormSave}
        onCancel={handleFormCancel}
      />
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>Payment Methods</Text>
        <Text style={[styles.subtitle, { color: secondaryColor }]}>
          Configure how customers can pay you
        </Text>
      </View>

      {/* Error Message */}
      {hasErrors && (
        <View style={[styles.errorContainer, { backgroundColor: '#ff444420' }]}>
          <Ionicons name="alert-circle" size={20} color="#ff4444" />
          <Text style={[styles.errorText, { color: '#ff4444' }]}>{errorMessage}</Text>
          <TouchableOpacity onPress={clearErrors}>
            <Ionicons name="close" size={20} color="#ff4444" />
          </TouchableOpacity>
        </View>
      )}

      {/* Success Message */}
      {paymentMessage && (
        <View style={[styles.successContainer, { backgroundColor: tintColor + '33' }]}>
          <Ionicons name="checkmark-circle" size={20} color={tintColor} />
          <Text style={[styles.successText, { color: tintColor }]}>{paymentMessage}</Text>
          <TouchableOpacity onPress={clearErrors}>
            <Ionicons name="close" size={20} color={tintColor} />
          </TouchableOpacity>
        </View>
      )}

      {/* Add New Button */}
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: tintColor }]}
        onPress={handleAddNew}
        disabled={isLoading}
      >
        <Ionicons name="add" size={24} color={tintColor === '#fff' ? '#000' : 'white'} />
        <Text style={[styles.addButtonText, { color: tintColor === '#fff' ? '#000' : 'white' }]}>Add Payment Method</Text>
      </TouchableOpacity>

      {/* Loading */}
      {isLoading && businessPaymentMethods.length === 0 && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={tintColor} />
          <Text style={[styles.loadingText, { color: secondaryColor }]}>
            Loading payment methods...
          </Text>
        </View>
      )}

      {/* Active Payment Methods */}
      {enabledMethods.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Active Methods ({enabledMethods.length})
          </Text>
          {enabledMethods.map((method) => (
            <PaymentMethodCard
              key={method.id}
              paymentMethod={method}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleEnabled={handleToggleEnabled}
              onSetDefault={handleSetDefault}
            />
          ))}
        </View>
      )}

      {/* Disabled Payment Methods */}
      {disabledMethods.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: secondaryColor }]}>
            Disabled Methods ({disabledMethods.length})
          </Text>
          {disabledMethods.map((method) => (
            <PaymentMethodCard
              key={method.id}
              paymentMethod={method}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleEnabled={handleToggleEnabled}
              onSetDefault={handleSetDefault}
            />
          ))}
        </View>
      )}

      {/* Empty State */}
      {businessPaymentMethods.length === 0 && !isLoading && (
        <View style={styles.emptyState}>
          <Ionicons name="card-outline" size={64} color={secondaryColor} />
          <Text style={[styles.emptyTitle, { color: textColor }]}>No Payment Methods</Text>
          <Text style={[styles.emptyDescription, { color: secondaryColor }]}>
            Add payment methods to let customers pay you easily
          </Text>
          <TouchableOpacity
            style={[styles.emptyButton, { backgroundColor: tintColor }]}
            onPress={handleAddNew}
          >
            <Text style={[styles.emptyButtonText, { color: tintColor === '#fff' ? '#000' : 'white' }]}>Add Your First Payment Method</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Payment Tips */}
      {businessPaymentMethods.length > 0 && (
        <View style={[styles.tipsContainer, { backgroundColor: tintColor + '1A' }]}>
          <Ionicons name="bulb-outline" size={20} color={tintColor} />
          <View style={styles.tipsContent}>
            <Text style={[styles.tipsTitle, { color: tintColor }]}>Tips</Text>
            <Text style={[styles.tipsText, { color: textColor }]}>
              • Set a default payment method for invoices{'\n'}
              • Add multiple methods to give customers options{'\n'}
              • Use notes to specify business vs personal accounts
            </Text>
          </View>
        </View>
      )}
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
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  successText: {
    flex: 1,
    fontSize: 14,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 48,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    padding: 48,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  tipsContainer: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    gap: 12,
  },
  tipsContent: {
    flex: 1,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
