import {
  TextInput,
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from 'react-native';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSelector } from 'react-redux';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
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
    // Show day of week first, then date with year
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  }
};

// Status options for filtering
const statusOptions = [
  { label: 'All Jobs', value: 'all', icon: 'list', color: '#888' },
  { label: 'Pending', value: 'pending', icon: 'clock-o', color: 'orange' },
  /* { label: 'Confirmed', value: 'confirmed', icon: 'check-circle', color: 'blue' }, */
  { label: 'In Progress', value: 'in_progress', icon: 'wrench', color: 'orange' },
  /* { label: 'On Hold', value: 'on_hold', icon: 'pause-circle', color: 'gray' },
  { label: 'Review', value: 'review', icon: 'search', color: 'purple' }, */
  { label: 'Completed', value: 'completed', icon: 'checkmark-done-sharp', color: 'green' },
/*   { label: 'Cancelled', value: 'cancelled', icon: 'times-circle', color: 'red' },
  { label: 'Invoiced', value: 'invoiced', icon: 'file-text', color: 'teal' },
  { label: 'Paid', value: 'paid', icon: 'money', color: 'green' }, */
];

const getStatusIcon = (status: string, size = 16) => {
  const statusOption = statusOptions.find(option => option.value === status);
  if (!statusOption || status === 'all') {
    return <Ionicons name="list" size={size} color="#888" />;
  }
  
  // Use Ionicons for some and FontAwesome for others
  if (status === 'completed') {
    return <Ionicons name="checkmark-done-sharp" size={size} color={statusOption.color} />;
  }
  
  return <FontAwesome name={statusOption.icon as any} size={size} color={statusOption.color} />;
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
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showStatusModal, setShowStatusModal] = useState(false);
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
    
    // Filter by search term
    let filtered = jobs.filter(
      (job) =>
        (job.description || '').toLowerCase().includes(search.toLowerCase()) ||
        (job.client_name_lastName || '').toLowerCase().includes(search.toLowerCase()),
    );
    
    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter((job) => job.status === selectedStatus);
    }
    
    const sorted = filtered.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
    return groupJobsByDate(sorted);
  }, [jobs, search, selectedStatus]);

  const handlePressable = (id: number) => {
    let job = jobs.find((job) => job.id === id);
    dispatch(setJob(job));
    router.navigate('/(app)/(jobs)/jobDetails');
  };

  return (
      <ThemedView style={commonStyles.container}>
        <View style={commonStyles.tabHeader}>
          <ThemedText type="subtitle">Jobs</ThemedText>

          {/* Status Filter Dropdown */}
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: darkTheme ? '#333' : '#f5f5f5',
              borderRadius: 5,
              paddingHorizontal: 10,
              borderWidth: 1,
              borderColor: darkTheme ? '#555' : '#ddd',
            }}
            onPress={() => setShowStatusModal(true)}
          >
            {getStatusIcon(selectedStatus, 16)}
            <ThemedText style={{ marginLeft: 8, marginRight: 4, fontSize: 16, fontWeight: '500' }}>
              {statusOptions.find(option => option.value === selectedStatus)?.label || 'All Jobs'}
            </ThemedText>
            <Ionicons name="chevron-down" size={14} color={darkTheme ? '#fff' : '#000'} />
          </TouchableOpacity>
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

        {/* Status Filter Modal */}
        <Modal
          visible={showStatusModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowStatusModal(false)}
        >
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.5)',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            activeOpacity={1}
            onPress={() => setShowStatusModal(false)}
          >
            <View
              style={{
                backgroundColor: darkTheme ? '#333' : '#fff',
                borderRadius: 12,
                padding: 20,
                width: '80%',
                maxHeight: '70%',
                elevation: 10,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
              }}
            >
              <ThemedText 
                type="subtitle" 
                style={{ 
                  textAlign: 'center', 
                  marginBottom: 16,
                  fontSize: 18,
                  fontWeight: '600'
                }}
              >
                Filter by Status
              </ThemedText>
              
              <FlatList
                data={statusOptions}
                keyExtractor={(item) => item.value}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 12,
                      paddingHorizontal: 8,
                      borderRadius: 8,
                      marginBottom: 4,
                      backgroundColor: selectedStatus === item.value 
                        ? (darkTheme ? '#555' : '#e3f2fd') 
                        : 'transparent',
                    }}
                    onPress={() => {
                      setSelectedStatus(item.value);
                      setShowStatusModal(false);
                    }}
                  >
                    {getStatusIcon(item.value, 20)}
                    <ThemedText 
                      style={{ 
                        marginLeft: 12, 
                        fontSize: 16,
                        fontWeight: selectedStatus === item.value ? '600' : 'normal',
                        color: selectedStatus === item.value ? item.color : darkTheme ? '#aaa' : '#555'
                      }}
                    >
                      {item.label}
                    </ThemedText>
                    {selectedStatus === item.value && (
                      <Ionicons 
                        name="checkmark" 
                        size={20} 
                        color={item.color} 
                        style={{ marginLeft: 'auto' }}
                      />
                    )}
                  </TouchableOpacity>
                )}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      </ThemedView>
  );
}
