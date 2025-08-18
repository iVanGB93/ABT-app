import {
  View,
  TouchableOpacity,
  ScrollView,
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
import DayColumn from '@/components/schedule/DayColumn';
import TimeColumn from '@/components/schedule/TimeColumn';
import ScheduleJobModal from '@/components/schedule/ScheduleJobModal';
import { setJob, setJobMessage } from '@/app/(redux)/jobSlice';
import { useAppDispatch, RootState } from '@/app/(redux)/store';
import { commonStyles } from '@/constants/commonStyles';
import { useJobs, useJobActions } from '@/hooks';

// Helper to get date range (yesterday, today, tomorrow)
const getDateRange = (centerDate = new Date()) => {
  const dates = [];
  
  // Yesterday
  const yesterday = new Date(centerDate);
  yesterday.setDate(centerDate.getDate() - 1);
  dates.push(yesterday);
  
  // Today (center)
  dates.push(new Date(centerDate));
  
  // Tomorrow  
  const tomorrow = new Date(centerDate);
  tomorrow.setDate(centerDate.getDate() + 1);
  dates.push(tomorrow);
  
  return dates;
};

// Helper to check if date is today
const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

// Helper to filter jobs by date
const getJobsForDate = (jobs: any[], targetDate: Date) => {
  return jobs.filter(job => {
    if (!job.scheduled_at) return false;
    
    const jobDate = new Date(job.scheduled_at);
    return jobDate.toDateString() === targetDate.toDateString();
  });
};

export default function Schedule() {
  const { color, darkTheme, business } = useSelector((state: RootState) => state.settings);
  const { jobMessage, jobLoading, jobError } = useSelector((state: RootState) => state.job);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSlotDate, setSelectedSlotDate] = useState<Date | null>(null);
  const [selectedSlotTime, setSelectedSlotTime] = useState<string>('');
  const dispatch = useAppDispatch();
  const router = useRouter();
  // Get ALL jobs from backend without any filters
  const { jobs, refresh } = useJobs();
  const { createUpdateJob } = useJobActions();

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

  // Get date range and scheduled jobs
  const dateRange = useMemo(() => getDateRange(selectedDate), [selectedDate]);
  
  const scheduledJobs = useMemo(() => {
    if (!Array.isArray(jobs)) return [];
    
    console.log('=== DEBUGGING JOBS ===');
    console.log('Total jobs from backend:', jobs.length);
    
    // Sample a few jobs to see their structure
    if (jobs.length > 0) {
      console.log('Sample job structure:', {
        id: jobs[0].id,
        status: jobs[0].status,
        scheduled_at: jobs[0].scheduled_at,
        description: jobs[0].description
      });
    }
    
    const completedJobs = jobs.filter(job => job.status === 'completed');
    const paidJobs = jobs.filter(job => job.status === 'paid');
    const scheduledCompletedJobs = jobs.filter(job => 
      job.scheduled_at && (job.status === 'completed' || job.status === 'paid')
    );
    
    console.log('Completed jobs (all):', completedJobs.length);
    console.log('Paid jobs (all):', paidJobs.length);
    console.log('Scheduled completed jobs:', scheduledCompletedJobs.length);
    
    // Show ALL scheduled jobs regardless of status (except cancelled)
    const filtered = jobs.filter(job => 
      job.scheduled_at && 
      job.status !== 'cancelled' // Only exclude cancelled jobs
    );
    
    console.log('Final filtered scheduled jobs:', filtered.length);
    console.log('====================');
    
    return filtered;
  }, [jobs]);

  const handleJobPress = (job: any) => {
    dispatch(setJob(job));
    router.navigate('/(app)/(jobs)/jobDetails');
  };

  const handleTimeSlotPress = (date: Date, time: string) => {
    console.log('Time slot pressed:', { date, time });
    setSelectedSlotDate(date);
    setSelectedSlotTime(time);
    setModalVisible(true);
  };

  const handleDatePress = (date: Date) => {
    setSelectedDate(date);
  };

  const handleScheduleJob = async (job: any) => {
    console.log('Scheduling job:', { job, selectedSlotDate, selectedSlotTime });
    
    if (!selectedSlotDate || !selectedSlotTime || !job?.id || !business?.name) {
      console.error('Missing data:', { 
        hasSlotDate: !!selectedSlotDate, 
        hasSlotTime: !!selectedSlotTime, 
        hasJobId: !!job?.id, 
        hasBusinessName: !!business?.name 
      });
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Missing required information',
      });
      return;
    }

    try {
      // Create scheduled_at datetime from selected date and time
      const [hours, minutes] = selectedSlotTime.split(':');
      let scheduledDateTime;
      
      // Handle if selectedSlotDate is already a Date object or a string
      if (selectedSlotDate instanceof Date) {
        scheduledDateTime = new Date(selectedSlotDate);
      } else {
        scheduledDateTime = new Date(selectedSlotDate);
      }
      
      scheduledDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      console.log('Scheduled datetime:', scheduledDateTime);

      // Create FormData to update the job
      const formData = new FormData();
      formData.append('action', 'update');
      formData.append('business', business.name);
      formData.append('id', job.id.toString());
      formData.append('scheduled_at', scheduledDateTime.toISOString());

      console.log('FormData contents:', {
        action: 'update',
        business: business.name,
        id: job.id.toString(),
        scheduled_at: scheduledDateTime.toISOString()
      });

      const result = await createUpdateJob(formData);
      
      if (result) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Job scheduled successfully',
        });
        setModalVisible(false);
        refresh(); // Refresh the jobs list
      }
    } catch (error) {
      console.error('Error scheduling job:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to schedule job',
      });
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedSlotDate(null);
    setSelectedSlotTime('');
  };

  const navigateToCalendar = () => {
    router.push('/(app)/(schedule)/calendar');
  };

  const navigateToDay = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  if (jobLoading) {
    return (
      <ThemedView style={commonStyles.container}>
        <ActivityIndicator style={commonStyles.containerCentered} color={color} size="large" />
      </ThemedView>
    );
  }

  if (jobError) {
    return (
      <ThemedView style={commonStyles.container}>
        <View style={commonStyles.containerCentered}>
          <ThemedText>{jobError}</ThemedText>
          <TouchableOpacity
            style={[commonStyles.button, { backgroundColor: color }]}
            onPress={() => refresh()}
          >
            <ThemedText>Try again</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={commonStyles.container}>
      {/* Header */}
      <View style={[commonStyles.tabHeader, { justifyContent: 'space-between' }]}>
        <ThemedText type="subtitle"> My Schedule</ThemedText>
        <TouchableOpacity onPress={navigateToCalendar} style={{ flexDirection: 'row', gap: 12 }}>
            <Ionicons name="calendar" size={24} color={color} />
            <ThemedText>Month</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Navigation controls */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: darkTheme ? '#333' : '#e0e0e0'
      }}>
        <TouchableOpacity onPress={() => navigateToDay('prev')}>
          <Ionicons name="chevron-back" size={24} color={color} />
        </TouchableOpacity>
        
        <ThemedText style={{ fontSize: 16, fontWeight: '600' }}>
          {selectedDate.toLocaleDateString('en-US', { 
            month: 'long',
            year: 'numeric'
          })}
        </ThemedText>
        
        <TouchableOpacity onPress={() => navigateToDay('next')}>
          <Ionicons name="chevron-forward" size={24} color={color} />
        </TouchableOpacity>
      </View>

      {/* Timeline view */}
      <ScrollView
        horizontal={false}
        refreshControl={
          <RefreshControl
            refreshing={jobLoading}
            onRefresh={() => refresh()}
            colors={[color]}
            tintColor={color}
          />
        }
        style={{ flex: 1 }}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View style={{ flexDirection: 'row', minWidth: 420 }}>
            {/* Time column */}
            <TimeColumn />
            
            {/* Day columns */}
            {dateRange.map((date, index) => {
              const dayJobs = getJobsForDate(scheduledJobs, date);
              const isTodayDate = isToday(date);
              const isMiddleDay = index === 1; // Middle day (selected)
              let columnWidth;
              if (index === 0) columnWidth = 80; // Previous day (narrower)
              else if (index === 1) columnWidth = 160; // Selected day (widest)
              else columnWidth = 120; // Next day (medium)
              
              return (
                <DayColumn
                  key={date.toDateString()}
                  date={date}
                  jobs={dayJobs}
                  isToday={isTodayDate}
                  isSelected={isMiddleDay}
                  onJobPress={handleJobPress}
                  onTimeSlotPress={handleTimeSlotPress}
                  onDatePress={handleDatePress}
                  color={color}
                  darkTheme={darkTheme}
                  width={columnWidth}
                />
              );
            })}
          </View>
        </ScrollView>
      </ScrollView>

      {/* Schedule Job Modal */}
      {selectedSlotDate && (
        <ScheduleJobModal
          visible={modalVisible}
          onClose={closeModal}
          onScheduleJob={handleScheduleJob}
          selectedDate={selectedSlotDate}
          selectedTime={selectedSlotTime}
          jobs={jobs}
          color={color}
          darkTheme={darkTheme}
        />
      )}
    </ThemedView>
  );
}
