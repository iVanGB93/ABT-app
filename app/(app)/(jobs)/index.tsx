import {
  TextInput,
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import JobCard from '@/components/jobs/JobCard';
import { setJob, setJobMessage } from '@/app/(redux)/jobSlice';
import { useAppDispatch, RootState } from '@/app/(redux)/store';
import { commonStyles } from '@/constants/commonStyles';
import { useJobs } from '@/hooks';

// Helper function to format date
const formatDateHeader = (dateString: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Reset time to compare dates only
  today.setHours(0, 0, 0, 0);
  yesterday.setHours(0, 0, 0, 0);
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  const isCurrentYear = date.getFullYear() === today.getFullYear();

  if (targetDate.getTime() === today.getTime()) {
    return isCurrentYear ? 'Today' : `Today, ${date.getFullYear()}`;
  } else if (targetDate.getTime() === yesterday.getTime()) {
    return isCurrentYear ? 'Yesterday' : `Yesterday, ${date.getFullYear()}`;
  } else {
    // Always show the year for clarity
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  }
};

// Helper function to group jobs by date
const groupJobsByDate = (jobs: any[]) => {
  const grouped: { [key: string]: any[] } = {};
  
  jobs.forEach(job => {
    if (job.created_at) {
      const date = new Date(job.created_at).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(job);
    }
  });

  // Convert to array and sort by date (newest first)
  return Object.entries(grouped)
    .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
    .flatMap(([dateString, jobs]) => [
      { type: 'date_header', date: dateString, id: `header-${dateString}` },
      ...jobs.map(job => ({ ...job, type: 'job' }))
    ]);
};

// Date separator component
const DateSeparator = ({ date, color }: { date: string, color: string }) => (
  <View style={{
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
    borderRadius: 8,
    marginHorizontal: 10,
    marginVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
  }}>
    <Ionicons name="calendar-outline" size={18} color={color} style={{ marginRight: 8 }} />
    <ThemedText style={{ 
      fontSize: 16, 
      fontWeight: '600',
      color: color 
    }}>
      {formatDateHeader(date)}
    </ThemedText>
  </View>
);

export default function Jobs() {
  const { color, darkTheme, business } = useSelector((state: RootState) => state.settings);
  const { jobMessage, jobLoading, jobError } = useSelector((state: RootState) => state.job);
  const [search, setSearch] = useState('');
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { jobs, refresh } = useJobs();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  useEffect(() => {
    if (jobMessage) {
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: jobMessage,
      });
      dispatch(setJobMessage(null));
    }
  }, [jobMessage]);

  const filteredAndGroupedJobs = useMemo(() => {
    if (!Array.isArray(jobs)) return [];
    const filtered = jobs.filter(
      (job) =>
        (job.description || '').toLowerCase().includes(search.toLowerCase()) ||
        (job.client_name_lastName || '').toLowerCase().includes(search.toLowerCase()),
    );
    const sorted = filtered.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
    return groupJobsByDate(sorted);
  }, [jobs, search]);

  const handlePressable = (id: number) => {
    let job = jobs.find((job) => job.id === id);
    dispatch(setJob(job));
    router.navigate('/(app)/(jobs)/jobDetails');
  };

  return (
      <ThemedView style={commonStyles.container}>
        <View style={commonStyles.tabHeader}>
          <ThemedText type="subtitle">Jobs</ThemedText>
          <ThemedText type="subtitle">{business.name}</ThemedText>
        </View>
        <View style={{ paddingHorizontal: 10, marginBottom: 5 }}>
          <TextInput
            placeholder="Search by description or client"
            placeholderTextColor="#888"
            value={search}
            onChangeText={setSearch}
            style={{
              backgroundColor: darkTheme ? '#222' : '#f2f2f2',
              color: darkTheme ? '#fff' : '#000',
              borderRadius: 8,
              padding: 10,
              borderWidth: 1,
              borderColor: darkTheme ? '#444' : '#ccc',
            }}
          />
        </View>
        {jobLoading ? (
          <ActivityIndicator style={commonStyles.containerCentered} color={color} size="large" />
        ) : jobError ? (
          <View style={commonStyles.containerCentered}>
            <ThemedText>{jobError}</ThemedText>
            <TouchableOpacity
              style={[commonStyles.button, { backgroundColor: color }]}
              onPress={() => refresh()}
            >
              <ThemedText>Try again</ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <FlatList
              data={filteredAndGroupedJobs}
              keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
              renderItem={({ item }) => {
                // Render date separator
                if (item.type === 'date_header') {
                  return <DateSeparator date={item.date} color={color} />;
                }

                // Render job card
                return (
                  <TouchableOpacity onPress={() => handlePressable(item.id)}>
                    <JobCard
                      image={item.image}
                      id={item.id}
                      status={item.status}
                      client={item.client}
                      address={item.address}
                      description={item.description}
                      price={item.price}
                      inDetail={true}
                      date={item.created_at}
                      isList={true}
                    />
                  </TouchableOpacity>
                );
              }}
              ItemSeparatorComponent={({ leadingItem }) => {
                // No separator after date headers
                if (leadingItem?.type === 'date_header') {
                  return null;
                }
                return <View style={{ height: 5 }} />;
              }}
              contentContainerStyle={
                filteredAndGroupedJobs.length === 0
                  ? { flexGrow: 1, justifyContent: 'center', alignItems: 'center' }
                  : undefined
              }
              ListEmptyComponent={
                <View style={{ alignItems: 'center', justifyContent: 'center', padding: 16 }}>
                  <ThemedText type="subtitle" style={{ textAlign: 'center' }}>
                    {jobError
                      ? jobError.toString() + ', pull to refresh'
                      : 'No jobs found, create your first one'}
                  </ThemedText>
                </View>
              }
              ListHeaderComponent={<View style={{ margin: 5 }} />}
              ListFooterComponent={<View style={{ margin: 5 }} />}
              refreshControl={
                <RefreshControl
                  refreshing={jobLoading}
                  onRefresh={() => refresh()}
                  colors={[color]} // Colores del indicador de carga
                  tintColor={color} // Color del indicador de carga en iOS
                />
              }
            />
            <TouchableOpacity
              style={[commonStyles.createButton, { backgroundColor: color }]}
              onPress={() => router.push('/(app)/(jobs)/jobCreate')}
            >
              <Ionicons name="add" size={36} color="#FFF" />
            </TouchableOpacity>
          </>
        )}
      </ThemedView>
  );
}
