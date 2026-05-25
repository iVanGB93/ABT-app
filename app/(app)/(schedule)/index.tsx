import { useCallback, useMemo, useState } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import DayColumn, { type TimelineScheduleEvent } from '@/components/schedule/DayColumn';
import TimeColumn from '@/components/schedule/TimeColumn';
import ScheduleJobModal from '@/components/schedule/ScheduleJobModal';
import { setJob } from '@/app/(redux)/jobSlice';
import { useAppDispatch, type RootState } from '@/app/(redux)/store';
import { commonStyles } from '@/constants/commonStyles';
import { useJobActions, useJobs, useSchedules } from '@/hooks';

const getDateRange = (centerDate = new Date()) => {
  const yesterday = new Date(centerDate);
  yesterday.setDate(centerDate.getDate() - 1);

  const today = new Date(centerDate);

  const tomorrow = new Date(centerDate);
  tomorrow.setDate(centerDate.getDate() + 1);

  return [yesterday, today, tomorrow];
};

const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

const getEventsForDate = (events: TimelineScheduleEvent[], targetDate: Date) => {
  return events.filter((event) => {
    const eventDate = new Date(event.start_at);
    return eventDate.toDateString() === targetDate.toDateString();
  });
};

export default function ScheduleScreen() {
  const { color, darkTheme, business } = useSelector((state: RootState) => state.settings);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSlotDate, setSelectedSlotDate] = useState<Date | null>(null);
  const [selectedSlotTime, setSelectedSlotTime] = useState<string>('');
  const dispatch = useAppDispatch();
  const router = useRouter();

  const {
    schedules,
    loading: scheduleLoading,
    error: scheduleError,
    refresh: refreshSchedules,
  } = useSchedules();
  // Keep jobs loaded for: 1) scheduling a job from slot, 2) opening linked job details from schedule event.
  const { jobs, refresh: refreshJobs } = useJobs();
  const { createUpdateJob } = useJobActions();

  const refreshAll = useCallback(async () => {
    await Promise.all([refreshSchedules(), refreshJobs()]);
  }, [refreshJobs, refreshSchedules]);

  useFocusEffect(
    useCallback(() => {
      refreshAll();
    }, [refreshAll])
  );

  const timelineEvents = useMemo(() => {
    const linkedJobStatusMap = new Map<number, string>();
    jobs.forEach((job) => {
      linkedJobStatusMap.set(job.id, job.status);
    });

    return schedules
      .filter((event) => !event.is_cancelled)
      .map((event) => ({
        ...event,
        linked_job_status: event.object_id ? linkedJobStatusMap.get(event.object_id) ?? null : null,
      }));
  }, [jobs, schedules]);

  const dateRange = useMemo(() => getDateRange(selectedDate), [selectedDate]);

  const handleEventPress = (event: TimelineScheduleEvent) => {
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

  const handleTimeSlotPress = (date: Date, time: string) => {
    setSelectedSlotDate(date);
    setSelectedSlotTime(time);
    setModalVisible(true);
  };

  const handleDatePress = (date: Date) => {
    setSelectedDate(date);
  };

  const handleCreateJobFromSlot = () => {
    if (!selectedSlotDate || !selectedSlotTime) return;
    const [hours, minutes] = selectedSlotTime.split(':');
    const scheduledDateTime = new Date(selectedSlotDate);
    scheduledDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
    closeModal();
    router.navigate({
      pathname: '/(app)/(jobs)/jobCreate',
      params: { scheduledAt: scheduledDateTime.toISOString() },
    });
  };

  const handleScheduleJob = async (job: { id: number }) => {
    if (!selectedSlotDate || !selectedSlotTime || !job?.id || !business?.name) {
      Toast.show({
        type: 'error',
        text1: 'Missing data',
        text2: 'Unable to schedule this job right now',
      });
      return;
    }

    try {
      const [hours, minutes] = selectedSlotTime.split(':');
      const scheduledDateTime = new Date(selectedSlotDate);
      scheduledDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

      const formData = new FormData();
      formData.append('action', 'update');
      formData.append('business', business.name);
      formData.append('id', job.id.toString());
      formData.append('scheduled_at', scheduledDateTime.toISOString());

      const result = await createUpdateJob(formData);

      if (result) {
        Toast.show({
          type: 'success',
          text1: 'Job scheduled',
          text2: 'The event has been synced to schedule',
        });
        closeModal();
        await refreshAll();
      }
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Schedule failed',
        text2: 'Could not update the job schedule',
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

  if (scheduleLoading && schedules.length === 0) {
    return (
      <ThemedView style={commonStyles.container}>
        <ActivityIndicator style={commonStyles.containerCentered} color={color} size="large" />
      </ThemedView>
    );
  }

  if (scheduleError && schedules.length === 0) {
    return (
      <ThemedView style={commonStyles.container}>
        <View style={commonStyles.containerCentered}>
          <ThemedText>{scheduleError}</ThemedText>
          <TouchableOpacity
            style={[commonStyles.button, { backgroundColor: color }]}
            onPress={refreshAll}
          >
            <ThemedText>Try again</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={commonStyles.container}>
      <View style={[commonStyles.tabHeader, { justifyContent: 'space-between' }]}>
        <ThemedText type="subtitle">My Schedule</ThemedText>
        <TouchableOpacity onPress={navigateToCalendar} style={{ flexDirection: 'row', gap: 12 }}>
          <Ionicons name="calendar" size={24} color={color} />
          <ThemedText>Month</ThemedText>
        </TouchableOpacity>
      </View>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderBottomWidth: 1,
          borderBottomColor: darkTheme ? '#333' : '#e0e0e0',
        }}
      >
        <TouchableOpacity onPress={() => navigateToDay('prev')}>
          <Ionicons name="chevron-back" size={24} color={color} />
        </TouchableOpacity>

        <ThemedText style={{ fontSize: 16, fontWeight: '600' }}>
          {selectedDate.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
          })}
        </ThemedText>

        <TouchableOpacity onPress={() => navigateToDay('next')}>
          <Ionicons name="chevron-forward" size={24} color={color} />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal={false}
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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View style={{ flexDirection: 'row', minWidth: 420 }}>
            <TimeColumn />

            {dateRange.map((date, index) => {
              const dayEvents = getEventsForDate(timelineEvents, date);
              const isTodayDate = isToday(date);
              const isMiddleDay = index === 1;
              let columnWidth = 120;

              if (index === 0) {
                columnWidth = 80;
              } else if (index === 1) {
                columnWidth = 160;
              }

              return (
                <DayColumn
                  key={date.toDateString()}
                  date={date}
                  events={dayEvents}
                  isToday={isTodayDate}
                  isSelected={isMiddleDay}
                  onEventPress={handleEventPress}
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

      {selectedSlotDate && (
        <ScheduleJobModal
          visible={modalVisible}
          onClose={closeModal}
          onScheduleJob={handleScheduleJob}
          onCreateJob={handleCreateJobFromSlot}
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
