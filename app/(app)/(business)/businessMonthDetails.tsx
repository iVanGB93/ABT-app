import React, { useEffect, useState } from 'react';
import {
  View,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import Toast from 'react-native-toast-message';

import { ThemedText } from '@/components/ThemedText';
import { RootState, useAppDispatch } from '@/app/(redux)/store';
import { businessSetMessage } from '@/app/(redux)/businessSlice';
import axiosInstance from '@/axios';
import { setBusiness } from '@/app/(redux)/settingSlice';
import { authLogout } from '../../(redux)/authSlice';
import { darkMainColor, lightMainColor } from '@/settings';
import { ThemedView } from '@/components/ThemedView';
import { commonStyles } from '@/constants/commonStyles';

interface MonthlyData {
  totalRevenue: number;
  jobRevenue: number;
  extraIncome: number;
  totalExpenses: number;
  deductibleExpenses: number;
  nonDeductibleExpenses: number;
  netProfit: number;
  taxableIncome: number;
  estimatedTax: number;
  jobs: any[];
  expenses: any[];
  income: any[];
}

export default function BusinessMonthDetails() {
  const { color, darkTheme, business } = useSelector((state: RootState) => state.settings);
  const { jobs } = useSelector((state: RootState) => state.job);
  const { businessMessage, extraExpenses, extraIncome } = useSelector(
    (state: RootState) => state.business,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [monthlyData, setMonthlyData] = useState<MonthlyData>({
    totalRevenue: 0,
    jobRevenue: 0,
    extraIncome: 0,
    totalExpenses: 0,
    deductibleExpenses: 0,
    nonDeductibleExpenses: 0,
    netProfit: 0,
    taxableIncome: 0,
    estimatedTax: 0,
    jobs: [],
    expenses: [],
    income: [],
  });
  const dispatch = useAppDispatch();
  const router = useRouter();

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const calculateMonthlyData = () => {
    const currentDate = new Date();
    const targetMonth = selectedMonth;
    const targetYear = selectedYear;

    // Filter data for selected month
    const monthJobs = Array.isArray(jobs)
      ? jobs.filter((job: any) => {
          const jobDate = new Date(job.date);
          return jobDate.getMonth() === targetMonth && jobDate.getFullYear() === targetYear;
        })
      : [];

    const monthExpenses = Array.isArray(extraExpenses)
      ? extraExpenses.filter((expense: any) => {
          const expenseDate = new Date(expense.date);
          return expenseDate.getMonth() === targetMonth && expenseDate.getFullYear() === targetYear;
        })
      : [];

    const monthIncome = Array.isArray(extraIncome)
      ? extraIncome.filter((income: any) => {
          const incomeDate = new Date(income.date);
          return incomeDate.getMonth() === targetMonth && incomeDate.getFullYear() === targetYear;
        })
      : [];

    // Calculate metrics
    const jobRevenue = monthJobs.reduce(
      (sum: number, job: any) => sum + (Number(job.price) || 0),
      0,
    );
    const extraIncomeTotal = monthIncome.reduce(
      (sum: number, income: any) => sum + (Number(income.amount) || 0),
      0,
    );
    const totalRevenue = jobRevenue + extraIncomeTotal;

    const deductibleExpenses = monthExpenses
      .filter((expense: any) => expense.tax_deductible)
      .reduce((sum: number, expense: any) => sum + (Number(expense.amount) || 0), 0);

    const nonDeductibleExpenses = monthExpenses
      .filter((expense: any) => !expense.tax_deductible)
      .reduce((sum: number, expense: any) => sum + (Number(expense.amount) || 0), 0);

    const totalExpenses = deductibleExpenses + nonDeductibleExpenses;
    const netProfit = totalRevenue - totalExpenses;
    const taxableIncome = totalRevenue - deductibleExpenses;
    const estimatedTax = Math.max(0, taxableIncome * 0.25); // Simplified 25% tax rate

    setMonthlyData({
      totalRevenue,
      jobRevenue,
      extraIncome: extraIncomeTotal,
      totalExpenses,
      deductibleExpenses,
      nonDeductibleExpenses,
      netProfit,
      taxableIncome,
      estimatedTax,
      jobs: monthJobs,
      expenses: monthExpenses,
      income: monthIncome,
    });
  };

  useEffect(() => {
    calculateMonthlyData();
  }, [selectedMonth, selectedYear, jobs, extraExpenses, extraIncome]);

  const handleRefresh = async () => {
    setIsLoading(true);
    // Refresh data logic here if needed
    calculateMonthlyData();
    setIsLoading(false);
  };

  const renderStatCard = (
    title: string,
    value: string,
    icon: string,
    iconColor: string,
    subtitle?: string,
  ) => (
    <View style={[styles.statCard, { backgroundColor: darkTheme ? '#2A2A2A' : '#F8F9FA' }]}>
      <View style={styles.statHeader}>
        <Ionicons name={icon as any} size={24} color={iconColor} />
        <View style={styles.statTextContainer}>
          <ThemedText style={styles.statTitle}>{title}</ThemedText>
          {subtitle && <ThemedText style={styles.statSubtitle}>{subtitle}</ThemedText>}
        </View>
      </View>
      <ThemedText style={[styles.statValue, { color: iconColor }]}>{value}</ThemedText>
    </View>
  );

  const renderLargeStatCard = (
    title: string,
    value: string,
    icon: string,
    iconColor: string,
    subtitle: string,
  ) => (
    <View style={[styles.largeStatCard, { backgroundColor: darkTheme ? '#2A2A2A' : '#F8F9FA' }]}>
      <View style={styles.largeStatHeader}>
        <View style={[styles.largeIconContainer, { backgroundColor: iconColor + '20' }]}>
          <Ionicons name={icon as any} size={32} color={iconColor} />
        </View>
        <View style={styles.largeStatContent}>
          <ThemedText style={styles.largeStatTitle}>{title}</ThemedText>
          <ThemedText style={[styles.largeStatValue, { color: iconColor }]}>{value}</ThemedText>
          <ThemedText style={styles.largeStatSubtitle}>{subtitle}</ThemedText>
        </View>
      </View>
    </View>
  );

  const changeMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (selectedMonth === 0) {
        setSelectedMonth(11);
        setSelectedYear(selectedYear - 1);
      } else {
        setSelectedMonth(selectedMonth - 1);
      }
    } else {
      if (selectedMonth === 11) {
        setSelectedMonth(0);
        setSelectedYear(selectedYear + 1);
      } else {
        setSelectedMonth(selectedMonth + 1);
      }
    }
  };

  return (
    <ThemedView style={commonStyles.container}>
      <ThemedView style={commonStyles.tabHeader}>
        <TouchableOpacity
          onPress={() => {
            router.back();
          }}
        >
          <Ionicons name="arrow-back" size={24} color={darkTheme ? '#fff' : '#000'} />
        </TouchableOpacity>
        <ThemedText type="subtitle">Monthly Report</ThemedText>
        <ThemedText type="subtitle"></ThemedText>
      </ThemedView>
      <View style={styles.monthSelector}>
        <TouchableOpacity
          style={[styles.monthButton, { backgroundColor: darkTheme ? '#2A2A2A' : '#F8F9FA' }]}
          onPress={() => changeMonth('prev')}
        >
          <Ionicons name="chevron-back" size={20} color={color} />
        </TouchableOpacity>

        <View style={[styles.monthDisplay, { backgroundColor: darkTheme ? '#2A2A2A' : '#F8F9FA' }]}>
          <ThemedText style={styles.monthText}>
            {months[selectedMonth]} {selectedYear}
          </ThemedText>
        </View>

        <TouchableOpacity
          style={[styles.monthButton, { backgroundColor: darkTheme ? '#2A2A2A' : '#F8F9FA' }]}
          onPress={() => changeMonth('next')}
        >
          <Ionicons name="chevron-forward" size={20} color={color} />
        </TouchableOpacity>
      </View>
      <ScrollView
        style={[
          styles.container,
          { backgroundColor: darkTheme ? darkMainColor : lightMainColor },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            colors={[color]}
            tintColor={color}
          />
        }
      >
        {/* Month Selector */}

        {/* Revenue Overview */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Revenue Overview
          </ThemedText>

          {renderLargeStatCard(
            'Total Revenue',
            `$${monthlyData.totalRevenue.toFixed(2)}`,
            'cash',
            '#4CAF50',
            'All income sources combined',
          )}

          <View style={styles.statsGrid}>
            {renderStatCard(
              'Job Revenue',
              `$${monthlyData.jobRevenue.toFixed(2)}`,
              'briefcase',
              '#2196F3',
              `${monthlyData.jobs.length} jobs`,
            )}
            {renderStatCard(
              'Extra Income',
              `$${monthlyData.extraIncome.toFixed(2)}`,
              'add-circle',
              '#4CAF50',
              `${monthlyData.income.length} entries`,
            )}
          </View>
        </View>

        {/* Expenses Breakdown */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Expenses Breakdown
          </ThemedText>

          <View style={styles.statsGrid}>
            {renderStatCard(
              'Tax Deductible',
              `$${monthlyData.deductibleExpenses.toFixed(2)}`,
              'receipt',
              '#FF9800',
              'Business expenses',
            )}
            {renderStatCard(
              'Non-Deductible',
              `$${monthlyData.nonDeductibleExpenses.toFixed(2)}`,
              'remove-circle',
              '#FF5722',
              'Personal expenses',
            )}
          </View>

          {renderLargeStatCard(
            'Total Expenses',
            `$${monthlyData.totalExpenses.toFixed(2)}`,
            'card',
            '#FF9800',
            `${monthlyData.expenses.length} total expenses`,
          )}
        </View>

        {/* Financial Summary */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Financial Summary
          </ThemedText>

          <View style={styles.statsGrid}>
            {renderStatCard(
              'Net Profit',
              `${monthlyData.netProfit >= 0 ? '+' : '-'}$${Math.abs(monthlyData.netProfit).toFixed(
                2,
              )}`,
              monthlyData.netProfit >= 0 ? 'trending-up' : 'trending-down',
              monthlyData.netProfit >= 0 ? '#4CAF50' : '#FF5722',
              'After all expenses',
            )}
            {renderStatCard(
              'Taxable Income',
              `$${monthlyData.taxableIncome.toFixed(2)}`,
              'document-text',
              '#9C27B0',
              'Revenue - deductibles',
            )}
          </View>

          {renderLargeStatCard(
            'Estimated Tax',
            `$${monthlyData.estimatedTax.toFixed(2)}`,
            'calculator',
            '#9C27B0',
            '25% of taxable income (estimated)',
          )}
        </View>

        {/* Performance Metrics */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Performance Metrics
          </ThemedText>

          <View style={styles.statsGrid}>
            {renderStatCard(
              'Profit Margin',
              `${
                monthlyData.totalRevenue > 0
                  ? ((monthlyData.netProfit / monthlyData.totalRevenue) * 100).toFixed(1)
                  : '0'
              }%`,
              'pie-chart',
              color,
              'Profitability ratio',
            )}
            {renderStatCard(
              'Avg Job Value',
              `$${
                monthlyData.jobs.length > 0
                  ? (monthlyData.jobRevenue / monthlyData.jobs.length).toFixed(0)
                  : '0'
              }`,
              'stats-chart',
              '#607D8B',
              'Per job average',
            )}
          </View>

          <View style={styles.statsGrid}>
            {renderStatCard(
              'Expense Ratio',
              `${
                monthlyData.totalRevenue > 0
                  ? ((monthlyData.totalExpenses / monthlyData.totalRevenue) * 100).toFixed(1)
                  : '0'
              }%`,
              'analytics',
              '#FF9800',
              'Expenses vs Revenue',
            )}
            {renderStatCard(
              'Tax Efficiency',
              `${
                monthlyData.totalExpenses > 0
                  ? ((monthlyData.deductibleExpenses / monthlyData.totalExpenses) * 100).toFixed(1)
                  : '0'
              }%`,
              'shield-checkmark',
              '#4CAF50',
              'Deductible percentage',
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Month Actions
          </ThemedText>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: darkTheme ? '#2A2A2A' : '#F8F9FA' }]}
            onPress={() => router.navigate('/(app)/(business)/businessIncomeCreate')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#4CAF50' + '20' }]}>
              <Ionicons name="add-circle" size={24} color="#4CAF50" />
            </View>
            <View style={styles.actionContent}>
              <ThemedText style={styles.actionTitle}>Add Income</ThemedText>
              <ThemedText style={styles.actionSubtitle}>Record additional revenue</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={darkTheme ? '#666' : '#999'} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: darkTheme ? '#2A2A2A' : '#F8F9FA' }]}
            onPress={() => router.navigate('/(app)/(business)/businessExpenseCreate')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#FF9800' + '20' }]}>
              <Ionicons name="remove-circle" size={24} color="#FF9800" />
            </View>
            <View style={styles.actionContent}>
              <ThemedText style={styles.actionTitle}>Add Expense</ThemedText>
              <ThemedText style={styles.actionSubtitle}>Track business costs</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={darkTheme ? '#666' : '#999'} />
          </TouchableOpacity>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  businessName: {
    fontSize: 16,
    opacity: 0.7,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginBottom: 5,
  },
  monthButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  monthDisplay: {
    flex: 1,
    marginHorizontal: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    marginBottom: 12,
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
  largeStatCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  largeStatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  largeIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  largeStatContent: {
    flex: 1,
  },
  largeStatTitle: {
    fontSize: 16,
    fontWeight: '600',
    opacity: 0.8,
    marginBottom: 4,
  },
  largeStatValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  largeStatSubtitle: {
    fontSize: 14,
    opacity: 0.6,
  },
  actionCard: {
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
  actionIcon: {
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
});
