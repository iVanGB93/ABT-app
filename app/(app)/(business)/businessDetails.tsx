import {
  StyleSheet,
  View,
  ActivityIndicator,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Platform,
  Alert,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import BusinessCard from '@/components/business/BusinessCard';
import { RootState, useAppDispatch } from '@/app/(redux)/store';
import { darkMainColor, darkSecondColor, lightMainColor, lightSecondColor } from '@/settings';
import { commonStyles } from '@/constants/commonStyles';
import { businessSetMessage, setExtraExpenses, setExtraIncome } from '@/app/(redux)/businessSlice';
import { commonStylesDetails } from '@/constants/commonStylesDetails';
import axiosInstance from '@/axios';
import ExtrasCard from '@/components/business/ExtrasCard';
import { Ionicons } from '@expo/vector-icons';

export default function BusinessDetails() {
  const [activeTab, setActiveTab] = useState<'expenses' | 'income'>('expenses');
  const { color, darkTheme, business } = useSelector((state: RootState) => state.settings);
  const { businessMessage, extraExpenses, extraIncome } = useSelector(
    (state: RootState) => state.business,
  );
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const totalIncome = extraIncome?.reduce((sum: any, item: any) => sum + (Number(item.amount) || 0), 0) || 0;
  const totalExpenses = extraExpenses?.reduce((sum: any, item: any) => sum + (Number(item.amount) || 0), 0) || 0;
  const difference = totalIncome - totalExpenses;

  const getExtras = async () => {
    setIsLoading(true);
    await axiosInstance
      .get(`business/extras/${business.name}/`)
      .then(function (response) {
        if (response.data) {
          dispatch(setExtraExpenses(response.data.extra_expenses));
          dispatch(setExtraIncome(response.data.extra_income));
        } else {
          dispatch(businessSetMessage(response.data.message));
        }
        setIsLoading(false);
      })
      .catch(function (error) {
        console.error('Error fetching extras:', error);
        if (typeof error.response === 'undefined') {
          dispatch(businessSetMessage('Error fetching extras, undefined'));
        } else {
          if (error.response.status === 401) {
            router.push('/');
          } else {
            dispatch(businessSetMessage(error.message));
          }
        }
        setIsLoading(false);
      });
  };

  const handleDelete = async (id: any, type: 'income' | 'expense') => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append('action', 'delete');
    formData.append('type', type);
    formData.append('id', id);
    await axiosInstance
      .post(`business/extras/${business.name}/`, formData, {
          headers: {
            'content-Type': 'multipart/form-data',
          },
      })
      .then(function (response) {
        if (response.data) {
          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'Extra deleted successfully',
          });
          getExtras();
        } else {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: response.data.message,
          });
        }
        setIsLoading(false);
      })
      .catch(function (error) {
        console.error('Error deleting extra:', error);
        if (typeof error.response === 'undefined') {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2:
              'A server/network error occurred. Sorry about this - try again in a few minutes.',
          });
        } else {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: error.message,
          });
        }
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (businessMessage) {
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: businessMessage,
      });
      dispatch(businessSetMessage(null));
    }
    getExtras();
  }, []);

  return (
    <ThemedView
      style={[
        commonStylesDetails.container,
        { backgroundColor: darkTheme ? darkMainColor : lightMainColor },
      ]}
    >
      <BusinessCard
        id={business.id}
        logo={business.logo}
        name={business.name}
        description={business.description}
        address={business.address}
        phone={business.phone}
        email={business.email}
        inDetail={true}
        owners={business.owners}
        website={business.website}
        created_at={business.created_at}
        updated_at={business.updated_at}
      />
      <View style={commonStylesDetails.bottom}>
        <ThemedText
          type="subtitle"
          style={{
            color: difference >= 0 ? 'green' : 'red',
            fontWeight: 'bold',
            fontSize: 18,
            marginBottom: 8,
            textAlign: 'center',
          }}
        >
          {difference >= 0 ? '+' : '-'}${Math.abs(difference)}
        </ThemedText>
        {/* Tabs */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 10 }}>
          <TouchableOpacity
            style={{
              paddingVertical: 8,
              paddingHorizontal: 24,
              borderBottomWidth: activeTab === 'expenses' ? 2 : 0,
              borderBottomColor: color,
              marginRight: 10,
            }}
            onPress={() => setActiveTab('expenses')}
          >
            <ThemedText type="subtitle">Extra Expenses</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              paddingVertical: 8,
              paddingHorizontal: 24,
              borderBottomWidth: activeTab === 'income' ? 2 : 0,
              borderBottomColor: color,
            }}
            onPress={() => setActiveTab('income')}
          >
            <ThemedText type="subtitle">Extra Income</ThemedText>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <ActivityIndicator style={commonStylesDetails.loading} color={color} size="large" />
        ) : (
          <View style={commonStylesDetails.list}>
            <FlatList
              data={activeTab === 'expenses' ? extraExpenses : extraIncome}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onLongPress={() => {
                    Alert.alert('Delete', 'Are you sure you want to delete this item?', [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: () => handleDelete(item.id, activeTab === 'income' ? 'income' : 'expense'),
                      },
                    ]);
                  }}
                >
                  <ExtrasCard
                    id={item.id}
                    description={item.description}
                    amount={item.amount}
                    date={item.date}
                    income={activeTab === 'income'}
                  />
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
              ListEmptyComponent={
                <View>
                  <ThemedText style={[commonStylesDetails.headerText, { marginTop: 50 }]}>
                    No extra {activeTab === 'expenses' ? 'expenses' : 'income'} found, pull to
                    refresh
                  </ThemedText>
                </View>
              }
              ListHeaderComponent={<View style={{ margin: 5 }} />}
              refreshControl={
                <RefreshControl
                  refreshing={isLoading}
                  onRefresh={() => getExtras()}
                  colors={[color]}
                  tintColor={color}
                />
              }
            />
          </View>
        )}
      </View>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: darkTheme ? darkSecondColor : lightSecondColor }]}
        onPress={
          activeTab === 'income'
            ? () => router.navigate('/(app)/(business)/businessIncomeCreate')
            : () => router.navigate('/(app)/(business)/businessExpenseCreate')
        }
      >
        <Ionicons name="add" size={30} color={activeTab === 'income' ? 'green' : 'red'} />
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 1,
    elevation: 5,
  },
});
