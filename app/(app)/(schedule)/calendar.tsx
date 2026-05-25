import React, { useState, useCallback, useMemo } from 'react';
import { View, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import MonthCalendar from '@/components/schedule/MonthCalendar';
import { setJob } from '@/app/(redux)/jobSlice';
import { useAppDispatch, type RootState } from '@/app/(redux)/store';
import { commonStyles } from '@/constants/commonStyles';
import { useJobs, useSchedules } from '@/hooks';
import type { ScheduleEvent } from '@/services';

const getEventsForDate = (events: ScheduleEvent[], targetDate: Date) => {
  return events.filter((event) => {
    const eventDate = new Date(event.start_at);
    return eventDate.toDateString() === targetDate.toDateString();
  });
};

export default function CalendarScreen() {
  const { color, darkTheme } = useSelector((state: RootState) => state.settings);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewDate, setViewDate] = useState(new Date());
  const dispatch = useAppDispatch();
  const router = useRouter();

  const {
    schedules,
    loading: scheduleLoading,
    error: scheduleError,
    refresh: refreshSchedules,
  } = useSchedules();

  const { jobs, refresh: refreshJobs } = useJobs();

  const refreshAll = useCallback(async () => {
    await Promise.all([refreshSchedules(), refreshJobs()]);
  }, [refreshJobs, refreshSchedules]);

  useFocusEffect(
    useCallback(() => {
      refreshAll();
    }, [refreshAll])
  );

  const visibleEvents = useMemo(() => {
    return schedules.filter((event) => !event.is_cancelled);
  }, [schedules]);

  const selectedDateEvents = useMemo(() => {
    return getEventsForDate(visibleEvents, selectedDate).sort((a, b) => {
      return new Date(a.start_at).getTime() - new Date(b.start_at).getTime();
    });
  }, [selectedDate, visibleEvents]);

  const handleDatePress = (date: Date) => {
    setSelectedDate(date);
  };

  const handleEventPress = (event: ScheduleEvent) => {
    if (event.object_id) {
      const linkedJob = jobs.find((job) => job.id === event.object_id);
      if (linkedJob) {
        dispatch(setJob(linkedJob));
        router.navigate('/(app)/(jobs)/jobDetails');
        return;
      }
    }

    Toast.show({
      type: 'info',
      text1: event.title,
      text2: event.location || 'No linked job details available',
    });
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
      <View style={[commonStyles.tabHeader, { justifyContent: 'space-between' }]}>
        <ThemedText type="subtitle">Calendar</ThemedText>
        <View style={{ flexDirection: 'row', gap: 14 }}>
          <TouchableOpacity onPress={goToToday} style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
            <Ionicons name="today" size={22} color={color} />
            <ThemedText>Today</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.navigate('/(app)/(schedule)')} style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
            <Ionicons name="time" size={22} color={color} />
            <ThemedText>Day</ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={scheduleLoading}
            onRefresh={refreshAll}
            colors={[color]}
            tintColor={color}
          />
        }
        style={{ flex: 1 }}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 12,
          }}
        >
          <TouchableOpacity onPress={() => navigateMonth('prev')}>
            <Ionicons name="chevron-back" size={24} color={color} />
          </TouchableOpacity>

          <ThemedText style={{ fontSize: 18, fontWeight: '600' }}>
            {viewDate.toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric',
            })}
          </ThemedText>

          <TouchableOpacity onPress={() => navigateMonth('next')}>
            <Ionicons name="chevron-forward" size={24} color={color} />
          </TouchableOpacity>
        </View>

        <MonthCalendar
          events={visibleEvents}
          viewDate={viewDate}
          selectedDate={selectedDate}
          onDatePress={handleDatePress}
          color={color}
          darkTheme={darkTheme}
        />

        {scheduleError && (
          <View style={{ paddingHorizontal: 16, paddingTop: 4 }}>
            <ThemedText style={{ opacity: 0.8 }}>{scheduleError}</ThemedText>
          </View>
        )}

        {selectedDateEvents.length > 0 && (
          <View style={{ padding: 16 }}>
            <View
              style={{
                paddingHorizontal: 16,
                paddingVertical: 12,
                backgroundColor: 'rgba(128, 128, 128, 0.1)',
                borderRadius: 8,
                marginBottom: 12,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Ionicons name="calendar" size={18} color={color} style={{ marginRight: 8 }} />
              <ThemedText
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color,
                }}
              >
                {selectedDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}{' '}
                ({selectedDateEvents.length})
              </ThemedText>
            </View>

            {selectedDateEvents.map((event, index) => (
              <TouchableOpacity
                key={event.id}
                style={{
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: darkTheme ? '#333' : '#e2e2e2',
                  padding: 12,
                  marginBottom: index < selectedDateEvents.length - 1 ? 10 : 0,
                  backgroundColor: darkTheme ? '#1f1f1f' : '#fff',
                }}
                onPress={() => handleEventPress(event)}
              >
                <ThemedText style={{ fontWeight: '700', fontSize: 15 }}>{event.title}</ThemedText>
                <ThemedText style={{ marginTop: 6, opacity: 0.8 }}>
                  {new Date(event.start_at).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                  {' - '}
                  {new Date(event.end_at).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </ThemedText>
                {!!event.location && (
                  <ThemedText style={{ marginTop: 4, opacity: 0.75 }}>{event.location}</ThemedText>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {selectedDateEvents.length === 0 && (
          <View style={{ alignItems: 'center', padding: 32 }}>
            <Ionicons name="calendar-outline" size={48} color="#ccc" />
            <ThemedText style={{ marginTop: 12, opacity: 0.7 }}>
              No events for{' '}
              {selectedDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </ThemedText>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={[commonStyles.createButton, { backgroundColor: color }]}
        onPress={() => router.push('/(app)/(schedule)')}
      >
        <Ionicons name="add" size={36} color="#FFF" />
      </TouchableOpacity>
    </ThemedView>
  );
}
