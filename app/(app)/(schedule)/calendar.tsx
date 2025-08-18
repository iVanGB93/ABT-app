import React, { useState, useCallback, useMemo } from 'react';
import { View, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import MonthCalendar from '@/components/schedule/MonthCalendar';
import JobCard from '@/components/jobs/JobCard';
import { setJob } from '@/app/(redux)/jobSlice';
import { useAppDispatch, RootState } from '@/app/(redux)/store';
import { commonStyles } from '@/constants/commonStyles';
import { useJobs } from '@/hooks';

// Helper to get jobs for a specific date
const getJobsForDate = (jobs: any[], targetDate: Date) => {
  return jobs.filter(job => {
    if (!job.scheduled_at) return false;
    
    const jobDate = new Date(job.scheduled_at);
    return jobDate.toDateString() === targetDate.toDateString();
  });
};

export default function Calendar() {
  const { color, darkTheme, business } = useSelector((state: RootState) => state.settings);
  const { jobLoading } = useSelector((state: RootState) => state.job);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewDate, setViewDate] = useState(new Date()); // For month navigation
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { jobs, refresh } = useJobs();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  // Filter scheduled jobs
  const scheduledJobs = useMemo(() => {
    if (!Array.isArray(jobs)) return [];
    
    return jobs.filter(job => 
      job.scheduled_at && 
      job.status !== 'completed' && 
      job.status !== 'cancelled' &&
      job.status !== 'paid'
    );
  }, [jobs]);

  // Get jobs for selected date
  const selectedDateJobs = useMemo(() => {
    return getJobsForDate(scheduledJobs, selectedDate);
  }, [scheduledJobs, selectedDate]);

  const handleDatePress = (date: Date) => {
    setSelectedDate(date);
  };

  const handleJobPress = (job: any) => {
    dispatch(setJob(job));
    router.navigate('/(app)/(jobs)/jobDetails');
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(viewDate);
    newDate.setMonth(viewDate.getMonth() + (direction === 'next' ? 1 : -1));
    setViewDate(newDate);
  };

  const goToToday = () => {
    const today = new Date();
    setViewDate(today);
    setSelectedDate(today);
  };

  return (
    <ThemedView style={commonStyles.container}>
      {/* Header */}
      <View style={[commonStyles.tabHeader, { justifyContent: 'space-between' }]}>
        <ThemedText type="subtitle">Calendar</ThemedText>
        <TouchableOpacity onPress={() => router.navigate('/(app)/(schedule)')} style={{ flexDirection: 'row', gap: 12 }}>
            <Ionicons name="today" size={24} color={color} />
            <ThemedText type="subtitle">Day</ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView
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
        {/* Month navigation */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}>
          <TouchableOpacity onPress={() => navigateMonth('prev')}>
            <Ionicons name="chevron-back" size={24} color={color} />
          </TouchableOpacity>
          
          <ThemedText style={{ fontSize: 18, fontWeight: '600' }}>
            {viewDate.toLocaleDateString('en-US', { 
              month: 'long',
              year: 'numeric'
            })}
          </ThemedText>
          
          <TouchableOpacity onPress={() => navigateMonth('next')}>
            <Ionicons name="chevron-forward" size={24} color={color} />
          </TouchableOpacity>
        </View>

        {/* Calendar */}
        <MonthCalendar
          jobs={scheduledJobs}
          selectedDate={viewDate}
          onDatePress={handleDatePress}
          color={color}
          darkTheme={darkTheme}
        />

        {/* Selected date jobs */}
        {selectedDateJobs.length > 0 && (
          <View style={{ padding: 16 }}>
            <View style={{
              paddingHorizontal: 16,
              paddingVertical: 12,
              backgroundColor: 'rgba(128, 128, 128, 0.1)',
              borderRadius: 8,
              marginBottom: 12,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
              <Ionicons name="calendar" size={18} color={color} style={{ marginRight: 8 }} />
              <ThemedText style={{ 
                fontSize: 16, 
                fontWeight: '600',
                color: color 
              }}>
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long',
                  month: 'long', 
                  day: 'numeric'
                })} ({selectedDateJobs.length})
              </ThemedText>
            </View>
            
            {selectedDateJobs.map((job, index) => (
              <View key={job.id}>
                <TouchableOpacity onPress={() => handleJobPress(job)}>
                  <JobCard
                    image={job.image}
                    id={job.id}
                    status={job.status}
                    client={job.client}
                    address={job.address}
                    description={job.description}
                    price={job.price}
                    inDetail={true}
                    date={job.scheduled_at}
                    isList={true}
                  />
                </TouchableOpacity>
                {index < selectedDateJobs.length - 1 && <View style={{ height: 8 }} />}
              </View>
            ))}
          </View>
        )}

        {/* Empty state for selected date */}
        {selectedDateJobs.length === 0 && (
          <View style={{ alignItems: 'center', padding: 32 }}>
            <Ionicons name="calendar-outline" size={48} color="#ccc" />
            <ThemedText style={{ marginTop: 12, opacity: 0.7 }}>
              No jobs scheduled for {selectedDate.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric'
              })}
            </ThemedText>
          </View>
        )}
      </ScrollView>

      {/* Floating action button */}
      <TouchableOpacity
        style={[commonStyles.createButton, { backgroundColor: color }]}
        onPress={() => router.push('/(app)/(jobs)/jobCreate')}
      >
        <Ionicons name="add" size={36} color="#FFF" />
      </TouchableOpacity>
    </ThemedView>
  );
}
