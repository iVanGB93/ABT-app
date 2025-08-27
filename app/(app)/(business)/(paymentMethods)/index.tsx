import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/app/(redux)/store';
import { ThemedView } from '@/components/ThemedView';
import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
  View
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePaymentMethodActions, usePaymentMethods } from '@/hooks/usePayment';
import { PaymentMethodCard } from '@/components/payments/PaymentMethodCard';
import { commonStyles } from '@/constants/commonStyles';
import { ThemedText } from '@/components/ThemedText';
import { useRouter } from 'expo-router';
import { darkSecondColor, lightSecondColor } from '@/settings';
import { setPaymentMethods } from '@/app/(redux)/businessSlice';

export default function PaymentMethods() {
  const { business } = useSelector((state: RootState) => state.settings);
  const { darkTheme, color } = useSelector((state: RootState) => state.settings);
  const [isLoading, setIsLoading] = useState(false);
  const { paymentMethods, refreshPaymentMethods } = usePaymentMethods(business.id);
  const { deleteMethod, toggleEnabled, setDefault } = usePaymentMethodActions();
  const router = useRouter();
  const dispatch = useDispatch();

  const handleRefresh = async () => {
    setIsLoading(true);
    await refreshPaymentMethods();
    dispatch(setPaymentMethods(paymentMethods));
    setIsLoading(false);
  };

  const handleDelete = async (methodId: number) => {
    try {
      setIsLoading(true);
      await deleteMethod(business.id, methodId);
    } catch (error) {
      Alert.alert('Error', 'Failed to delete payment method');
      setIsLoading(false);
    } finally {
      handleRefresh();
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
  useEffect(() => {
    handleRefresh();
  }, []);

  const enabledMethods = paymentMethods.filter((method) => method.is_enabled);
  const disabledMethods = paymentMethods.filter((method) => !method.is_enabled);

  return (
    <ThemedView>
      <ThemedView style={commonStyles.tabHeader}>
        <TouchableOpacity
          onPress={() => {
            router.back();
          }}
        >
          <Ionicons name="arrow-back" size={24} color={darkTheme ? '#fff' : '#000'} />
        </TouchableOpacity>
        <ThemedText type="subtitle">Payment Methods</ThemedText>
        <ThemedText type="subtitle"></ThemedText>
      </ThemedView>
      <ScrollView
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />}
      >
        <View style={styles.header}>
          <ThemedText type="default">Configure how customers can pay you</ThemedText>
        </View>
        <TouchableOpacity
          style={[
            commonStyles.button,
            {
              backgroundColor: darkTheme ? darkSecondColor : lightSecondColor,
              width: 'auto',
              flexDirection: 'row',
              alignItems: 'center',
              borderColor: color,
              paddingHorizontal: 5,
              marginBottom: 15,
            },
          ]}
          onPress={() => router.navigate('./(paymentMethods)/paymentMethodCreate')}
          disabled={isLoading}
        >
          <Ionicons name="add" size={24} color={darkTheme ? '#fff' : '#000'} />
          <ThemedText>Payment Method</ThemedText>
        </TouchableOpacity>
        {isLoading ? 
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={color} />
            <ThemedText>Loading payment methods...</ThemedText>
          </View>
         : 
          <>
        {/* Active Payment Methods */}
        {enabledMethods.length > 0 && (
          <View style={styles.section}>
            <ThemedText>Active Methods ({enabledMethods.length})</ThemedText>
            {enabledMethods.map((method) => (
              <PaymentMethodCard
                key={method.id}
                paymentMethod={method}
                onEdit={() => router.navigate('./(paymentMethods)/paymentMethodUpdate')}
                onDelete={() => handleDelete(method.id)}
                onToggleEnabled={handleToggleEnabled}
                onSetDefault={handleSetDefault}
              />
            ))}
          </View>
        )}
        {/* Disabled Payment Methods */}
        {disabledMethods.length > 0 && (
          <View style={styles.section}>
            <ThemedText>Disabled Methods ({disabledMethods.length})</ThemedText>
            {disabledMethods.map((method) => (
              <PaymentMethodCard
                key={method.id}
                paymentMethod={method}
                onEdit={() => router.push('./(paymentMethods)/paymentMethodUpdate')}
                onDelete={() => handleDelete(method.id)}
                onToggleEnabled={handleToggleEnabled}
                onSetDefault={handleSetDefault}
              />
            ))}
          </View>
        )}
        {/* Empty State */}
        {paymentMethods.length === 0 && !isLoading && (
          <View style={styles.emptyState}>
            <Ionicons name="card-outline" size={64} color={color} />
            <ThemedText style={[styles.emptyTitle]}>No Payment Methods</ThemedText>
            <ThemedText style={styles.emptyDescription}>
              Add payment methods to let customers pay you easily
            </ThemedText>
          </View>
        )}
        </>}
        <View style={styles.tipsContainer}>
        <Ionicons name="bulb-outline" size={20} color={color} />
        <View style={styles.tipsContent}>
            <ThemedText type="subtitle">Tips</ThemedText>
            <ThemedText type="default">
            • Set a default payment method for invoices{'\n'}• Add multiple methods to give
            customers options{'\n'}• Use notes to specify business vs personal accounts
            </ThemedText>
        </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
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
    paddingHorizontal: 10,
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
});
