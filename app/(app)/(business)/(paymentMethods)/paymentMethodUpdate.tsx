import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { commonStyles } from '@/constants/commonStyles';
import { TouchableOpacity } from 'react-native';
import { RootState } from '@/app/(redux)/store';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import PaymentMethodForm from '@/components/payments/PaymentMethodForm';

export default function PaymentMethodUpdate() {
  const { darkTheme, color } = useSelector((state: RootState) => state.settings);
  const router = useRouter();

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
        <ThemedText type="subtitle">Edit Payment Methods</ThemedText>
        <ThemedText type="subtitle"></ThemedText>
      </ThemedView>
      <PaymentMethodForm action="update" />
    </ThemedView>
  );
}
