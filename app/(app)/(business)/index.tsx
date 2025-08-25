import React, { useEffect, useState } from 'react';
import {
  View,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import Toast from 'react-native-toast-message';

import { ThemedText } from '@/components/ThemedText';
import { RootState, useAppDispatch } from '@/app/(redux)/store';
import { setBusiness, setMessage, cleanSettings } from '@/app/(redux)/settingSlice';
import { darkMainColor, darkSecondColor, lightMainColor, lightSecondColor } from '@/settings';
import { commonStylesCards } from '@/constants/commonStylesCard';
import { useClients, useJobs } from '@/hooks';
import { useBusinessExtras } from '@/hooks/useBusinessExtras';

export default function IndexBusiness() {
  const { color, darkTheme, business } = useSelector((state: RootState) => state.settings);
  const { userName } = useSelector((state: RootState) => state.auth);
  const { jobLoading, jobError } = useSelector((state: RootState) => state.job);
  const { clientLoading, clientError } = useSelector((state: RootState) => state.client);

  // Using new hooks for data fetching
  const { clients, refresh: refreshClients } = useClients();

  const { jobs, refresh: refreshJobs } = useJobs();

  const {
    extraExpenses,
    extraIncome,
    loading: extrasLoading,
    error: extrasError,
    refresh: refreshExtras,
  } = useBusinessExtras();

  const [refreshing, setRefreshing] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const hasBusiness = !!business && Object.keys(business).length > 0;

  // Handle refresh of all data
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refreshClients(), refreshJobs(), refreshExtras()]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const activeJobs = Array.isArray(jobs)
    ? jobs.filter((job: any) => job.status === 'pending' || job.status === 'in_progress').length
    : 0;

  // Calculate total revenue (jobs + extra income)
  const totalJobRevenue = Array.isArray(jobs)
    ? jobs.reduce((sum: number, job: any) => sum + (Number(job.price) || 0), 0)
    : 0;

  const totalExtraIncome = Array.isArray(extraIncome)
    ? extraIncome.reduce((sum: number, item: any) => sum + (Number(item.amount) || 0), 0)
    : 0;

  const totalExpenses = Array.isArray(extraExpenses)
    ? extraExpenses.reduce((sum: number, item: any) => sum + (Number(item.amount) || 0), 0)
    : 0;

  const totalRevenue = totalJobRevenue + totalExtraIncome;
  const netProfit = totalRevenue - totalExpenses;

  const totalClients = Array.isArray(clients) ? clients.length : 0;

  // Show loading state
  const isLoading = clientLoading || jobLoading || extrasLoading;

  // Show error if any
  const hasError = clientError || jobError || extrasError;

  // Toast error messages
  useEffect(() => {
    if (clientError) {
      Toast.show({
        type: 'error',
        text1: 'Error loading clients',
        text2: clientError,
      });
    }
  }, [clientError]);

  useEffect(() => {
    if (jobError) {
      Toast.show({
        type: 'error',
        text1: 'Error loading jobs',
        text2: jobError,
      });
    }
  }, [jobError]);

  useEffect(() => {
    if (extrasError) {
      Toast.show({
        type: 'error',
        text1: 'Error loading financial data',
        text2: extrasError,
      });
    }
  }, [extrasError]);

  const renderQuickAction = (
    icon: string,
    title: string,
    subtitle: string,
    onPress: () => void,
    iconColor: string,
  ) => (
    <TouchableOpacity
      style={[styles.quickActionCard, { backgroundColor: darkTheme ? '#2A2A2A' : '#F8F9FA' }]}
      onPress={onPress}
    >
      <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
        <Ionicons name={icon as any} size={28} color={iconColor} />
      </View>
      <View style={styles.actionContent}>
        <ThemedText style={styles.actionTitle}>{title}</ThemedText>
        <ThemedText style={styles.actionSubtitle}>{subtitle}</ThemedText>
      </View>
      <Ionicons name="chevron-forward" size={20} color={darkTheme ? '#666' : '#999'} />
    </TouchableOpacity>
  );

  const renderStatCard = (
    title: string,
    value: string,
    icon: string,
    iconColor: string,
    onPress?: () => void,
  ) => (
    <TouchableOpacity
      style={[styles.statCard, { backgroundColor: darkTheme ? '#2A2A2A' : '#F8F9FA' }]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.statHeader}>
        <Ionicons name={icon as any} size={24} color={iconColor} />
        <ThemedText style={styles.statTitle}>{title}</ThemedText>
      </View>
      <View style={styles.statValueContainer}>
        <ThemedText style={[styles.statValue, { color: iconColor }]}>{value}</ThemedText>
        {onPress && (
          <Ionicons
            name="chevron-forward"
            size={16}
            color={darkTheme ? '#666' : '#999'}
            style={styles.statChevron}
          />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: darkTheme ? darkMainColor : lightMainColor, marginTop: 20 },
      ]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={color}
          colors={[color]}
        />
      }
    >
      {/* Loading overlay */}
      {isLoading && !refreshing && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={color} />
          <ThemedText style={styles.loadingText}>Loading data...</ThemedText>
        </View>
      )}

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <ThemedText type="title" style={styles.welcomeText}>
            Welcome {userName}
          </ThemedText>
          {hasError && (
            <View style={styles.errorBadge}>
              <Ionicons name="warning-outline" size={16} color="#FF5722" />
              <ThemedText style={styles.errorText}>Data loading issues</ThemedText>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={[styles.profileButton, { backgroundColor: color + '20' }]}
          onPress={() => router.navigate('/(app)/(business)/settings')}
        >
          <Ionicons name="settings-outline" size={24} color={color} />
        </TouchableOpacity>
      </View>
      <View
        style={[commonStylesCards.card, { backgroundColor: darkTheme ? '#2A2A2A' : '#F8F9FA' }]}
      >
        <View style={styles.businessHeader}>
          {business?.logo ? (
            <Image source={{ uri: business.logo }} style={commonStylesCards.businessLogo} />
          ) : (
            <View style={[commonStylesCards.businessLogo, { backgroundColor: color + '20' }]}>
              <Ionicons name="briefcase-outline" size={32} color={color} />
            </View>
          )}
          <View style={styles.businessInfo}>
            <ThemedText type="subtitle" style={styles.businessTitle}>
              {business.name}
            </ThemedText>
            {business.phone && (
              <View style={styles.businessLocation}>
                <Ionicons name="call-outline" size={16} color={color} />
                <ThemedText style={styles.businessDescription}>{business.phone}</ThemedText>
              </View>
            )}
            {business.address && (
              <View style={styles.businessLocation}>
                <Ionicons name="location-outline" size={16} color={color} />
                <ThemedText style={styles.locationText}>{business.address}</ThemedText>
              </View>
            )}
          </View>
          {/* Data status indicator */}
          <View style={styles.dataStatusContainer}>
            <View
              style={[
                styles.dataStatusDot,
                { backgroundColor: hasError ? '#FF5722' : isLoading ? '#FFC107' : '#4CAF50' },
              ]}
            />
            <ThemedText style={styles.dataStatusText}>
              {hasError ? 'Error' : isLoading ? 'Loading' : 'Live'}
            </ThemedText>
          </View>
        </View>
      </View>
      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statsHeader}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Quick Overview
          </ThemedText>
          {(clientLoading || jobLoading || extrasLoading) && (
            <ActivityIndicator size="small" color={color} />
          )}
        </View>
        <View style={styles.statsGrid}>
          {renderStatCard(
            'Active Jobs',
            isLoading ? '...' : activeJobs.toString(),
            'briefcase',
            '#2196F3',
            () => router.navigate('/(app)/(jobs)'),
          )}
          {renderStatCard(
            'Total Revenue',
            isLoading ? '...' : `$${totalRevenue.toFixed(0)}`,
            'cash',
            '#4CAF50',
          )}
        </View>
        <View style={styles.statsGrid}>
          {renderStatCard(
            'Clients',
            isLoading ? '...' : totalClients.toString(),
            'people',
            '#FF9800',
            () => router.navigate('/(app)/(clients)'),
          )}
          {renderStatCard(
            'Net Profit',
            isLoading ? '...' : `$${netProfit.toFixed(0)}`,
            'trending-up',
            netProfit >= 0 ? '#4CAF50' : '#FF5722',
            () => router.navigate('/(app)/(business)/businessMonthDetails'),
          )}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Quick Actions
        </ThemedText>

        {renderQuickAction(
          'briefcase-outline',
          'Business Details',
          'View financial insights and details',
          () => router.navigate('/(app)/(business)/businessDetails'),
          color,
        )}

        {renderQuickAction(
          'create-outline',
          'Edit Business',
          'Update business information',
          () => router.navigate('/(app)/(business)/businessUpdate'),
          '#2196F3',
        )}

        {renderQuickAction(
          'exit-outline',
          'Change Business',
          'Go to my businesses list',
          () => dispatch(setBusiness({})),
          '#f32121ff',
        )}

        {renderQuickAction(
          'add-circle-outline',
          'New Job',
          'Create a new job entry',
          () => router.navigate('/(app)/(jobs)/jobCreate'),
          '#4CAF50',
        )}

        {renderQuickAction(
          'person-add-outline',
          'New Client',
          'Create a new client entry',
          () => router.navigate('/(app)/(clients)/clientCreate'),
          '#4CAF50',
        )}

        {/* {renderQuickAction(
          'document-text-outline',
          'New Invoice',
          'Generate a new invoice',
          () => router.navigate('/(app)/(jobs)/invoiceCreate'),
          '#FF9800',
        )} */}

        {renderQuickAction(
          'people-outline',
          'Manage Clients',
          'View and manage your clients',
          () => router.navigate('/(app)/(clients)'),
          '#9C27B0',
        )}

        {renderQuickAction(
          'list-outline',
          'View Jobs',
          'Browse all your jobs',
          () => router.navigate('/(app)/(jobs)'),
          '#607D8B',
        )}
      </View>

      {/* Recent Activity Section */}
      <View style={styles.recentContainer}>
        <View style={styles.recentHeader}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Recent Activity
          </ThemedText>
          <TouchableOpacity onPress={() => router.navigate('/(app)/(jobs)')}>
            <ThemedText style={[styles.viewAllText, { color }]}>View All</ThemedText>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={[styles.recentCard, { backgroundColor: darkTheme ? '#2A2A2A' : '#F8F9FA' }]}>
            <ActivityIndicator size="small" color={color} />
            <View style={styles.recentContent}>
              <ThemedText style={styles.recentTitle}>Loading recent activity...</ThemedText>
            </View>
          </View>
        ) : (
          <>
            <View
              style={[styles.recentCard, { backgroundColor: darkTheme ? '#2A2A2A' : '#F8F9FA' }]}
            >
              <Ionicons name="time-outline" size={24} color={color} />
              <View style={styles.recentContent}>
                <ThemedText style={styles.recentTitle}>
                  {activeJobs > 0
                    ? `You have ${activeJobs} active job${activeJobs > 1 ? 's' : ''}`
                    : 'No active jobs'}
                </ThemedText>
                <ThemedText style={styles.recentSubtitle}>
                  {activeJobs > 0 ? 'Keep up the great work!' : 'Create a new job to get started'}
                </ThemedText>
              </View>
            </View>

            {/* Show recent jobs if available */}
            {Array.isArray(jobs) && jobs.length > 0 && (
              <View
                style={[
                  styles.recentCard,
                  { backgroundColor: darkTheme ? '#2A2A2A' : '#F8F9FA', marginTop: 12 },
                ]}
              >
                <Ionicons name="briefcase-outline" size={24} color="#2196F3" />
                <View style={styles.recentContent}>
                  <ThemedText style={styles.recentTitle}>
                    Latest Job: {jobs[0]?.description || 'No description'}
                  </ThemedText>
                  <ThemedText style={styles.recentSubtitle}>
                    Status: {jobs[0]?.status || 'Unknown'} • ${jobs[0]?.price || 0}
                  </ThemedText>
                </View>
                <TouchableOpacity
                  onPress={() => router.navigate(`/(app)/(jobs)/jobDetails?id=${jobs[0]?.id}`)}
                >
                  <Ionicons name="arrow-forward-outline" size={20} color={color} />
                </TouchableOpacity>
              </View>
            )}

            {/* Show recent clients if available */}
            {Array.isArray(clients) && clients.length > 0 && (
              <View
                style={[
                  styles.recentCard,
                  { backgroundColor: darkTheme ? '#2A2A2A' : '#F8F9FA', marginTop: 12 },
                ]}
              >
                <Ionicons name="person-outline" size={24} color="#FF9800" />
                <View style={styles.recentContent}>
                  <ThemedText style={styles.recentTitle}>
                    Latest Client: {clients[0]?.name || 'Unnamed'}
                  </ThemedText>
                  <ThemedText style={styles.recentSubtitle}>
                    {clients[0]?.business ? `${clients[0].business} • ` : ''}
                    Contact: {clients[0]?.phone || clients[0]?.email || 'No contact info'}
                  </ThemedText>
                </View>
                <TouchableOpacity
                  onPress={() =>
                    router.navigate(`/(app)/(clients)/clientDetails?id=${clients[0]?.id}`)
                  }
                >
                  <Ionicons name="arrow-forward-outline" size={20} color={color} />
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
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
    paddingHorizontal: 10,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerLeft: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  businessHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  businessInfo: {
    flex: 1,
  },
  businessTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  businessDescription: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 8,
  },
  businessLocation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    marginLeft: 6,
    fontSize: 14,
    opacity: 0.7,
  },
  statsContainer: {
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 6,
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  statTitle: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statValueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statChevron: {
    marginLeft: 4,
  },
  actionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
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
  recentContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  recentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  recentContent: {
    marginLeft: 16,
    flex: 1,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  recentSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  errorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  errorText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#FF5722',
    fontWeight: '500',
  },
  dataStatusContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dataStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  dataStatusText: {
    fontSize: 10,
    fontWeight: '500',
    opacity: 0.8,
  },
});
