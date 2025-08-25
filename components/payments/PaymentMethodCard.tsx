import React from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BusinessPaymentMethod } from '@/services/paymentService';
import { useThemeColor } from '@/hooks/useThemeColor';
import { commonStylesCards } from '@/constants/commonStylesCard';

interface PaymentMethodCardProps {
  paymentMethod: BusinessPaymentMethod;
  onEdit: (method: BusinessPaymentMethod) => void;
  onDelete: (methodId: number) => void;
  onToggleEnabled: (methodId: number) => void;
  onSetDefault: (methodId: number) => void;
}

export const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
  paymentMethod,
  onEdit,
  onDelete,
  onToggleEnabled,
  onSetDefault,
}) => {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const secondaryColor = useThemeColor({}, 'tabIconDefault');

  const handleDelete = () => {
    Alert.alert(
      'Delete Payment Method',
      `Are you sure you want to delete ${paymentMethod.display_name || paymentMethod.payment_type.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => onDelete(paymentMethod.id)
        }
      ]
    );
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

  const getAccountDisplay = () => {
    if (paymentMethod.account_email) return paymentMethod.account_email;
    if (paymentMethod.account_phone) return paymentMethod.account_phone;
    if (paymentMethod.account_username) return `@${paymentMethod.account_username}`;
    if (paymentMethod.account_number) return `****${paymentMethod.account_number.slice(-4)}`;
    return 'Account configured';
  };

  return (
    <View style={[commonStylesCards.card, { backgroundColor }]}>
      <View style={styles.cardHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <View style={[styles.iconContainer, { backgroundColor: tintColor + '33' }]}>
            <Ionicons 
              name={getPaymentIcon(paymentMethod.payment_type.code)} 
              size={24} 
              color={tintColor} 
            />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Text style={[styles.cardTitle, { color: textColor }]}>
                {paymentMethod.display_name || paymentMethod.payment_type.name}
              </Text>
              {paymentMethod.is_default && (
                <View style={[styles.badge, { backgroundColor: tintColor, marginLeft: 8 }]}>
                  <Text style={[styles.badgeText, { color: tintColor === '#fff' ? '#000' : 'white' }]}>DEFAULT</Text>
                </View>
              )}
              {!paymentMethod.is_enabled && (
                <View style={[styles.badge, { backgroundColor: secondaryColor, marginLeft: 8 }]}>
                  <Text style={[styles.badgeText, { color: secondaryColor === '#9BA1A6' ? 'white' : 'white' }]}>DISABLED</Text>
                </View>
              )}
            </View>
            <Text style={[styles.cardSubtitle, { color: secondaryColor }]}>
              {getAccountDisplay()}
            </Text>
            {paymentMethod.notes && (
              <Text style={[styles.cardDescription, { color: secondaryColor, marginTop: 4 }]}>
                {paymentMethod.notes}
              </Text>
            )}
          </View>
        </View>
      </View>

      <View style={styles.cardActions}>
        {/* Toggle Enabled/Disabled */}
        <TouchableOpacity
          style={[styles.actionButton, { 
            backgroundColor: paymentMethod.is_enabled ? secondaryColor + '33' : tintColor + '33'
          }]}
          onPress={() => onToggleEnabled(paymentMethod.id)}
        >
          <Ionicons
            name={paymentMethod.is_enabled ? 'eye-off' : 'eye'}
            size={18}
            color={paymentMethod.is_enabled ? secondaryColor : tintColor}
          />
        </TouchableOpacity>

        {/* Set as Default */}
        {!paymentMethod.is_default && paymentMethod.is_enabled && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: tintColor + '33' }]}
            onPress={() => onSetDefault(paymentMethod.id)}
          >
            <Ionicons name="star-outline" size={18} color={tintColor} />
          </TouchableOpacity>
        )}

        {/* Edit */}
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: tintColor + '33' }]}
          onPress={() => onEdit(paymentMethod)}
        >
          <Ionicons name="create-outline" size={18} color={tintColor} />
        </TouchableOpacity>

        {/* Delete */}
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#ff444433' }]}
          onPress={handleDelete}
        >
          <Ionicons name="trash-outline" size={18} color="#ff4444" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardHeader: {
    paddingVertical: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  cardSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  cardDescription: {
    fontSize: 12,
    opacity: 0.6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  cardActions: {
    flexDirection: 'row',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#00000010',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
