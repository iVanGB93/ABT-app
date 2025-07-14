import {
  Image,
  Text,
  Modal,
  View,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  RefreshControl,
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
import {
  darkMainColor,
  darkSecondColor,
  darkTtextColor,
  lightMainColor,
  lightSecondColor,
  lightTextColor,
} from '@/settings';
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
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const totalIncome =
    extraIncome?.reduce((sum: any, item: any) => sum + (Number(item.amount) || 0), 0) || 0;
  const totalExpenses =
    extraExpenses?.reduce((sum: any, item: any) => sum + (Number(item.amount) || 0), 0) || 0;
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

  useEffect(() => {
    if (business === undefined) {
      router.push('/(businessSelect)');
      return;
    }

    if (businessMessage) {
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: businessMessage,
      });
      dispatch(businessSetMessage(null));
    }
    getExtras();
  }, [business]);

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
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            width: '100%',
            justifyContent: 'space-between',
            paddingHorizontal: 10,
          }}
        >
          <ThemedText>Balance</ThemedText>
          <ThemedText
            style={{
              flex: 1,
              textAlign: 'center',
              color: darkTheme ? darkTtextColor : lightTextColor,
              fontWeight: 'bold',
              letterSpacing: 2,
              fontSize: 18,
              includeFontPadding: false,
            }}
            numberOfLines={1}
            ellipsizeMode="clip"
          >
            {'.'.repeat(50)}
          </ThemedText>
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
            {difference >= 0 ? '+' : '-'}${Math.abs(difference).toFixed(2)}
          </ThemedText>
        </View>
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
                  onPress={() => {
                    setSelectedItem(item);
                    setDetailsModalVisible(true);
                  }}
                >
                  <ExtrasCard
                    id={item.id}
                    description={item.description}
                    amount={item.amount}
                    date={item.date}
                    income={activeTab === 'income'}
                    image={item.image}
                  />
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View>
                  <ThemedText style={[commonStylesDetails.headerText, { marginTop: 50 }]}>
                    No extra {activeTab === 'expenses' ? 'expenses' : 'income'} found, pull to
                    refresh or create a new one.
                  </ThemedText>
                </View>
              }
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
        style={[
          commonStyles.createButton,
          { backgroundColor: darkTheme ? darkSecondColor : lightSecondColor },
        ]}
        onPress={
          activeTab === 'income'
            ? () => router.navigate('/(app)/(business)/businessIncomeCreate')
            : () => router.navigate('/(app)/(business)/businessExpenseCreate')
        }
      >
        <Ionicons name="add" size={30} color={activeTab === 'income' ? 'green' : 'red'} />
      </TouchableOpacity>
      <Modal
        visible={detailsModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setDetailsModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: darkTheme ? darkMainColor : lightMainColor,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <View style={{ width: '90%' }}>
            <ThemedText type="subtitle" style={{ marginBottom: 10 }}>
              {activeTab === 'income' ? 'Income Details' : 'Expense Details'}
            </ThemedText>
            {selectedItem && (
              <ExtrasCard
                id={selectedItem.id}
                description={selectedItem.description}
                amount={selectedItem.amount}
                date={selectedItem.date}
                image={selectedItem.image}
                income={activeTab === 'income'}
                inDetail={true}
              />
            )}
            <TouchableOpacity
              style={[
                commonStyles.button,
                {
                  marginTop: 20,
                  borderColor: color,
                  backgroundColor: darkTheme ? darkSecondColor : lightSecondColor,
                },
              ]}
              onPress={() => setDetailsModalVisible(false)}
            >
              <ThemedText type="link" style={{ color }}>
                Close
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}
