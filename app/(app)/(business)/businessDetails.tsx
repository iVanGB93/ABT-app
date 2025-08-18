import {
  Modal,
  View,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter, useFocusEffect } from 'expo-router';
import Toast from 'react-native-toast-message';

import { ThemedText } from '@/components/ThemedText';
import { RootState, useAppDispatch } from '@/app/(redux)/store';
import {
  darkMainColor,
  lightMainColor,
} from '@/settings';
import { commonStyles } from '@/constants/commonStyles';
import { businessSetMessage, setExtraExpenses, setExtraIncome } from '@/app/(redux)/businessSlice';
import ExtrasCard from '@/components/business/ExtrasCard';
import { Ionicons } from '@expo/vector-icons';
import { setBusiness } from '@/app/(redux)/settingSlice';
import { useBusinessExtras } from '@/hooks/useBusinessExtras';
import { useJobs } from '@/hooks/useJobs';
import { useCallback } from 'react';

export default function BusinessDetails() {
  const [activeTab, setActiveTab] = useState<'expenses' | 'income'>('expenses');
  const { color, darkTheme, business } = useSelector((state: RootState) => state.settings);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();

  // Use custom hooks
  const { extraExpenses, extraIncome, loading: extrasLoading, refresh: refreshExtras } = useBusinessExtras();
  const { jobs, refresh: refreshJobs } = useJobs();
  const { businessMessage } = useSelector((state: RootState) => state.business);

  const isLoading = extrasLoading;

  // Auto-refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refreshExtras();
      refreshJobs();
    }, [refreshExtras, refreshJobs])
  );

  // Financial calculations
  const totalJobs = Array.isArray(jobs)
    ? jobs.reduce((sum: number, job: any) => sum + (Number(job.price) || 0), 0)
    : 0;
  const totalIncome = Array.isArray(extraIncome)
    ? extraIncome.reduce((sum: any, item: any) => sum + (Number(item.amount) || 0), 0)
    : 0;
  const totalExpenses = Array.isArray(extraExpenses)
    ? extraExpenses.reduce((sum: any, item: any) => sum + (Number(item.amount) || 0), 0)
    : 0;
  const netProfit = totalIncome + totalJobs - totalExpenses;

  const renderStatCard = (title: string, value: string, icon: string, iconColor: string) => (
    <View style={[styles.statCard, { backgroundColor: darkTheme ? '#2A2A2A' : '#F8F9FA' }]}>
      <View style={styles.statHeader}>
        <Ionicons name={icon as any} size={24} color={iconColor} />
        <View style={styles.statTextContainer}>
          <ThemedText style={styles.statTitle}>{title}</ThemedText>
        </View>
      </View>
      <ThemedText style={[styles.statValue, { color: iconColor }]}>{value}</ThemedText>
    </View>
  );

  const handleChangeBusiness = async () => {
    dispatch(setBusiness({}));
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

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: darkTheme ? darkMainColor : lightMainColor, marginTop: 40 },
      ]}
    >
      {/* Financial Overview */}
      <View style={styles.statsContainer}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/(app)/(business)')}>
            <Ionicons name="arrow-back" size={24} color={darkTheme ? '#fff' : '#000'} />
          </TouchableOpacity>
          <ThemedText type="subtitle">
            Financial Overview
          </ThemedText>
        </View>

        {/* Net Profit Card */}
        <View
          style={[
            styles.profitCard,
            { backgroundColor: netProfit >= 0 ? '#4CAF50' + '15' : '#FF5722' + '15' },
          ]}
        >
          <View style={styles.profitHeader}>
            <Ionicons
              name={netProfit >= 0 ? 'trending-up' : 'trending-down'}
              size={32}
              color={netProfit >= 0 ? '#4CAF50' : '#FF5722'}
            />
            <View style={styles.profitInfo}>
              <ThemedText style={styles.profitLabel}>Net Profit</ThemedText>
              <ThemedText
                style={[styles.profitValue, { color: netProfit >= 0 ? '#4CAF50' : '#FF5722' }]}
              >
                {netProfit >= 0 ? '+' : '-'}${Math.abs(netProfit).toFixed(2)}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {renderStatCard('Job Revenue', `$${totalJobs.toFixed(0)}`, 'briefcase', '#2196F3')}
          {renderStatCard('Extra Income', `$${totalIncome.toFixed(0)}`, 'cash', '#4CAF50')}
        </View>
        <View style={styles.statsGrid}>
          {renderStatCard('Total Expenses', `$${totalExpenses.toFixed(0)}`, 'card', '#FF9800')}
          {renderStatCard(
            'Profit Margin',
            `${totalJobs > 0 ? ((netProfit / (totalJobs + totalIncome)) * 100).toFixed(1) : '0'}%`,
            'analytics',
            color,
          )}
        </View>
      </View>
      {/* Expense/Income Tabs */}
      <View style={styles.tabsContainer}>
        <View style={styles.tabsHeader}>
          <ThemedText type="subtitle">Financial Records</ThemedText>
        </View>
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'expenses' && [styles.activeTab, { borderBottomColor: color }],
            ]}
            onPress={() => setActiveTab('expenses')}
          >
            <Ionicons
              name="remove-circle-outline"
              size={20}
              color={activeTab === 'expenses' ? color : darkTheme ? '#666' : '#999'}
            />
            <ThemedText
              style={[styles.tabText, activeTab === 'expenses' && { color, fontWeight: '600' }]}
            >
              Expenses ({extraExpenses?.length || 0})
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'income' && [styles.activeTab, { borderBottomColor: color }],
            ]}
            onPress={() => setActiveTab('income')}
          >
            <Ionicons
              name="add-circle-outline"
              size={20}
              color={activeTab === 'income' ? color : darkTheme ? '#666' : '#999'}
            />
            <ThemedText
              style={[styles.tabText, activeTab === 'income' && { color, fontWeight: '600' }]}
            >
              Income ({extraIncome?.length || 0})
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {isLoading ? (
            <View style={styles.centeredContainer}>
              <ActivityIndicator color={color} size="large" />
              <ThemedText style={styles.loadingText}>Loading financial records...</ThemedText>
            </View>
          ) : (
            <>
              {!Array.isArray(activeTab === 'expenses' ? extraExpenses : extraIncome) || 
               (activeTab === 'expenses' ? extraExpenses : extraIncome).length === 0 ? (
                <View style={styles.emptyContainer}>
                  <View style={styles.emptyStateIcon}>
                    <Ionicons
                      name={
                        activeTab === 'expenses' ? 'remove-circle-outline' : 'add-circle-outline'
                      }
                      size={64}
                      color={activeTab === 'expenses' ? '#FF9800' : '#4CAF50'}
                    />
                  </View>
                  <ThemedText style={styles.emptyStateTitle}>
                    No {activeTab === 'expenses' ? 'expenses' : 'income'} found
                  </ThemedText>
                  <ThemedText style={styles.emptyStateSubtitle}>
                    Create your first {activeTab} entry to track your business finances
                  </ThemedText>
                  <TouchableOpacity
                    style={[
                      styles.primaryButton,
                      { backgroundColor: activeTab === 'expenses' ? '#FF9800' : '#4CAF50' },
                    ]}
                    onPress={() =>
                      router.navigate(
                        activeTab === 'income'
                          ? '/(app)/(business)/businessIncomeCreate'
                          : '/(app)/(business)/businessExpenseCreate',
                      )
                    }
                  >
                    <ThemedText style={styles.primaryButtonText}>
                      Add {activeTab === 'expenses' ? 'Expense' : 'Income'}
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              ) : (
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
                  scrollEnabled={true}
                  showsVerticalScrollIndicator={true}
                  ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                  ListFooterComponent={<View style={{ height: 100 }} />}
                  refreshControl={
                    <RefreshControl
                      refreshing={isLoading}
                      onRefresh={() => {
                        refreshExtras();
                        refreshJobs();
                      }}
                      colors={[color]}
                      tintColor={color}
                    />
                  }
                />
              )}
            </>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={[
          commonStyles.createButton,
          { backgroundColor: activeTab === 'income' ? '#4CAF50' : '#FF9800' },
        ]}
        onPress={() =>
          router.navigate(
            activeTab === 'income'
              ? '/(app)/(business)/businessIncomeCreate'
              : '/(app)/(business)/businessExpenseCreate',
          )
        }
      >
        <Ionicons name="add" size={36} color="#FFFFFF" />
      </TouchableOpacity>

      <Modal
        visible={detailsModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDetailsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { backgroundColor: darkTheme ? '#2A2A2A' : '#FFFFFF' }]}
          >
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle" style={styles.modalTitle}>
                {activeTab === 'income' ? 'Income Details' : 'Expense Details'}
              </ThemedText>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setDetailsModalVisible(false)}
              >
                <Ionicons name="close" size={24} color={darkTheme ? '#fff' : '#000'} />
              </TouchableOpacity>
            </View>

            {selectedItem && (
              <ScrollView style={styles.modalBody}>
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
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  businessName: {
    fontSize: 16,
    opacity: 0.7,
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  profitCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  profitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profitInfo: {
    marginLeft: 16,
    flex: 1,
  },
  profitLabel: {
    fontSize: 16,
    fontWeight: '600',
    opacity: 0.8,
    marginBottom: 4,
  },
  profitValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 6,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  statTextContainer: {
    marginLeft: 8,
    flex: 1,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.8,
  },
  statSubtitle: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  actionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 5,
  },
  quickActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  tabsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  tabsHeader: {
    marginBottom: 16,
  },
  tabBar: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  tabContent: {
    flex: 1,
  },
  centeredContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    opacity: 0.7,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    marginBottom: 24,
    opacity: 0.6,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 32,
  },
  primaryButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    padding: 20,
  },
});
