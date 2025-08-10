import React, { useEffect, useState } from 'react';
import {
  View,
  RefreshControl,
  FlatList,
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
import { ThemedView } from '@/components/ThemedView';
import { RootState, useAppDispatch } from '@/app/(redux)/store';
import { businessSetMessage, setBusinesses } from '@/app/(redux)/businessSlice';
import axiosInstance from '@/axios';
import { setBusiness, setMessage, cleanSettings } from '@/app/(redux)/settingSlice';
import BusinessCard from '@/components/business/BusinessCard';
import { commonStyles } from '@/constants/commonStyles';
import { darkMainColor, darkSecondColor, lightMainColor, lightSecondColor } from '@/settings';
import { authLogout } from '../../(redux)/authSlice';

export default function IndexBusiness() {
  const { color, darkTheme, business } = useSelector((state: RootState) => state.settings);
  const { userName } = useSelector((state: RootState) => state.auth);
  const { businesses, businessMessage } = useSelector((state: RootState) => state.business);
  const { jobs } = useSelector((state: RootState) => state.job);
  const { clients } = useSelector((state: RootState) => state.client);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const hasBusiness = !!business && Object.keys(business).length > 0;

  // Quick stats calculations
  const activeJobs = Array.isArray(jobs)
    ? jobs.filter((job: any) => job.status !== 'finished').length
    : 0;
  const totalRevenue = Array.isArray(jobs)
    ? jobs.reduce((sum: number, job: any) => sum + (Number(job.price) || 0), 0)
    : 0;
  const totalClients = Array.isArray(clients) ? clients.length : 0;

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

  const renderStatCard = (title: string, value: string, icon: string, iconColor: string, onPress?: () => void) => (
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
          <Ionicons name="chevron-forward" size={16} color={darkTheme ? '#666' : '#999'} style={styles.statChevron} />
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
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <ThemedText type="title" style={styles.welcomeText}>
            Welcome {userName}
          </ThemedText>
        </View>
        <TouchableOpacity
          style={[styles.profileButton, { backgroundColor: color + '20' }]}
          onPress={() => router.navigate('/(app)/(profile)')}
        >
          <Ionicons name="person-outline" size={24} color={color} />
        </TouchableOpacity>
      </View>
      <View style={[styles.businessCard, { backgroundColor: darkTheme ? '#2A2A2A' : '#F8F9FA' }]}>
        <View style={styles.businessHeader}>
          {business?.logo ? (
            <Image source={{ uri: business.logo }} style={styles.businessLogo} />
          ) : (
            <View style={[styles.businessLogo, { backgroundColor: color + '20' }]}>
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
        </View>
      </View>
      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Quick Overview
        </ThemedText>
        <View style={styles.statsGrid}>
          {renderStatCard('Active Jobs', activeJobs.toString(), 'briefcase', '#2196F3')}
          {renderStatCard('Total Revenue', `$${totalRevenue.toFixed(0)}`, 'cash', '#4CAF50')}
        </View>
        <View style={styles.statsGrid}>
          {renderStatCard('Clients', totalClients.toString(), 'people', '#FF9800')}
          {renderStatCard('This Month', 'View Details', 'trending-up', color, () => router.navigate('/(app)/(business)/businessMonthDetails'))}
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
        <View style={[styles.recentCard, { backgroundColor: darkTheme ? '#2A2A2A' : '#F8F9FA' }]}>
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
  businessCard: {
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  businessHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  businessLogo: {
    width: 64,
    height: 64,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
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
});
