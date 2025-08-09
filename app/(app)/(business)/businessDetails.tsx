import {
  Modal,
  View,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image, // <-- añadido
} from 'react-native';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { StatusBar } from 'expo-status-bar';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import BusinessCard from '@/components/business/BusinessCard';
import { RootState, useAppDispatch } from '@/app/(redux)/store';
import {
  darkMainColor,
  darkSecondColor,
  darkTextColor,
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
import { jobFail, setJobs } from '@/app/(redux)/jobSlice';
import { setBusiness } from '@/app/(redux)/settingSlice';
import { authLogout } from '@/app/(redux)/authSlice';
import { ThemedSecondaryView } from '@/components/ThemedSecondaryView'; // <-- añadido

export default function BusinessDetails() {
  const [activeTab, setActiveTab] = useState<'expenses' | 'income'>('expenses');
  const { color, darkTheme, business } = useSelector((state: RootState) => state.settings);
  const { jobs } = useSelector((state: RootState) => state.job);
  const [isLoadingJob, setIsLoadingJob] = useState(true);
  const [difference, setDifference] = useState(0);
  const { businessMessage, extraExpenses, extraIncome } = useSelector(
    (state: RootState) => state.business,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    if (!business || Object.keys(business).length === 0) {
      router.replace('/(app)/(business)');
    }
  }, [business]);

  const handleChangeBusiness = async () => {
    dispatch(setBusiness({}));
  };

  const getExtras = async () => {
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
            dispatch(setBusiness([]));
            dispatch(authLogout());
            router.replace('/');
          } else {
            dispatch(businessSetMessage('Error fetching extras, undefined'));
          }
        }
        setIsLoading(false);
      });
  };

  const getJobs = async () => {
    await axiosInstance
      .get(`jobs/list/${business.name}/`)
      .then(function (response) {
        if (response.data) {
          dispatch(setJobs(response.data));
        } else {
          dispatch(jobFail(response.data.message));
        }
        setIsLoadingJob(false);
      })
      .catch(function (error) {
        console.error('Error fetching jobs:', error);
        try {
          const message = error.data.message;
          dispatch(jobFail(message));
        } catch (e) {
          dispatch(jobFail('Error getting your jobs.'));
        }
        setIsLoadingJob(false);
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
  }, [businessMessage]);

  useEffect(() => {
    getExtras();
    getJobs();
  }, []);

  useEffect(() => {
    if (Array.isArray(jobs) && Array.isArray(extraIncome) && Array.isArray(extraExpenses)) {
      const totalJobs = jobs.reduce((sum: number, job: any) => sum + (Number(job.price) || 0), 0);
      const totalIncome = extraIncome.reduce(
        (sum: any, item: any) => sum + (Number(item.amount) || 0),
        0,
      );
      const totalExpenses = extraExpenses.reduce(
        (sum: any, item: any) => sum + (Number(item.amount) || 0),
        0,
      );
      setDifference(totalIncome + totalJobs - totalExpenses);
    } else {
      setDifference(0);
    }
  }, [jobs, extraIncome, extraExpenses]);

  return (
    <>
      <StatusBar style={darkTheme ? 'light' : 'dark'} />
      <ThemedView style={commonStyles.container}>
        <View style={commonStyles.tabHeader}>
          <ThemedText type="subtitle">My Business Details</ThemedText>
          <TouchableOpacity
            onPress={() => {
              handleChangeBusiness();
            }}
            style={{ marginRight: 10 }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <ThemedText>Exit</ThemedText>
              <Ionicons name="exit" size={24} color={darkTheme ? darkTextColor : lightTextColor} />
            </View>
          </TouchableOpacity>
        </View>
        {/* Reemplazo del BusinessCard por una tarjeta moderna */}
        <ThemedSecondaryView
          style={{
            borderRadius: 16,
            padding: 16,
            marginHorizontal: 10,
            marginTop: 8,
            marginBottom: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.12,
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {/* Logo o ícono */}
            {business?.logo ? (
              <Image
                source={{ uri: business.logo }}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: '#eee',
                  marginRight: 12,
                }}
                resizeMode="cover"
              />
            ) : (
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: color + '22',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}
              >
                <Ionicons name="briefcase-outline" size={24} color={color} />
              </View>
            )}

            {/* Datos principales */}
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ThemedText type="title" style={{ fontWeight: 'bold', flex: 1 }}>
                  {business?.display_name || business?.name}
                </ThemedText>
                <TouchableOpacity onPress={() => router.navigate('/(app)/(business)/businessUpdate')}>
                  <Ionicons name="create-outline" size={20} color={color} />
                </TouchableOpacity>
              </View>
              {business?.email ? (
                <ThemedText style={{ opacity: 0.7 }}>{business.email}</ThemedText>
              ) : null}
              {business?.address ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                  <Ionicons name="location-outline" size={16} color={color} style={{ marginRight: 6 }} />
                  <ThemedText style={{ flex: 1 }}>{business.address}</ThemedText>
                </View>
              ) : null}
            </View>
          </View>
        </ThemedSecondaryView>
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
                color: darkTheme ? darkTextColor : lightTextColor,
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
            {isLoadingJob ? (
              <ActivityIndicator style={commonStyles.containerCentered} color={color} />
            ) : (
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
            )}
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
                      category={item.category}
                      deductible={item.tax_deductible}
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
                  category={selectedItem.category}
                  deductible={selectedItem.tax_deductible}
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
    </>
  );
}
