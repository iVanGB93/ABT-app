import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import type { ScheduleEvent } from '@/services';

type EventStatus = 'active' | 'completed' | 'cancelled';

export interface TimelineScheduleEvent extends ScheduleEvent {
  linked_job_status?: string | null;
}

interface DayColumnProps {
  date: Date;
  events: TimelineScheduleEvent[];
  isToday: boolean;
  isSelected: boolean;
  onEventPress: (event: TimelineScheduleEvent) => void;
  onTimeSlotPress: (date: Date, time: string) => void;
  onDatePress?: (date: Date) => void;
  color: string;
  darkTheme: boolean;
  width?: number;
}

// Helper to get time slots (8 AM to 8 PM)
const timeSlots = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
  '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
];

const formatEventForTimeline = (event: TimelineScheduleEvent) => {
  const maxLength = 12;
  const title = event.title || 'Untitled';
  return title.length > maxLength
    ? title.substring(0, maxLength) + '...'
    : title;
};

const getEventTime = (startAt: string): string => {
  const date = new Date(startAt);
  return date.toTimeString().substring(0, 5); // "09:30"
};

const resolveEventStatus = (event: TimelineScheduleEvent): EventStatus => {
  if (event.is_cancelled || event.linked_job_status === 'cancelled') {
    return 'cancelled';
  }

  if (event.linked_job_status === 'completed' || event.linked_job_status === 'paid') {
    return 'completed';
  }

  return 'active';
};

export default function DayColumn({
  date,
  events,
  isToday,
  isSelected,
  onEventPress,
  onTimeSlotPress,
  onDatePress,
  color,
  darkTheme,
  width
}: DayColumnProps) {
  
  const eventsByTime = events.reduce((acc, event) => {
    const eventTime = getEventTime(event.start_at);
    const hour = eventTime.split(':')[0];
    const timeSlot = `${hour}:00`;
    
    if (!acc[timeSlot]) {
      acc[timeSlot] = [];
    }
    acc[timeSlot].push(event);
    return acc;
  }, {} as { [key: string]: TimelineScheduleEvent[] });

  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
  const dayNumber = date.getDate();

  return (
    <View style={[
      styles.dayColumn,
      isSelected && { backgroundColor: darkTheme ? '#333' : '#f0f0f0' },
      width ? { width: width, flex: 0 } : {} // Apply custom width and disable flex
    ]}>
      {/* Day header */}
      <TouchableOpacity
        style={[
          styles.dayHeader,
          isToday && { backgroundColor: color }
        ]}
        onPress={() => onDatePress?.(date)}
        activeOpacity={0.7}
      >
        <ThemedText style={[
          styles.dayName,
          isToday && { color: '#fff' }
        ]}>
          {dayName}
        </ThemedText>
        <ThemedText style={[
          styles.dayNumber,
          isToday && { color: '#fff' }
        ]}>
          {dayNumber}
        </ThemedText>
      </TouchableOpacity>

      {/* Time slots */}
      <View style={styles.timeSlots}>
        {timeSlots.map((timeSlot) => {
          const hasEvents = eventsByTime[timeSlot]?.length > 0;
          
          return (
            <TouchableOpacity
              key={timeSlot}
              style={[
                styles.timeSlot,
                !hasEvents && styles.emptyTimeSlot
              ]}
              onPress={() => !hasEvents && onTimeSlotPress(date, timeSlot)}
              activeOpacity={hasEvents ? 1 : 0.7}
            >
              {/* Show events for this time slot */}
              {eventsByTime[timeSlot]?.map((event) => {
                const status = resolveEventStatus(event);
                const isCompleted = status === 'completed';
                const isCancelled = status === 'cancelled';
                
                return (
                  <TouchableOpacity
                    key={event.id}
                    style={[
                      styles.eventItem,
                      isCancelled
                        ? {
                            backgroundColor: '#fdeaea',
                            borderLeftColor: '#d9534f',
                            opacity: 0.7,
                          }
                        : isCompleted
                        ? {
                            backgroundColor: '#e8f5e8',
                            borderLeftColor: '#4caf50',
                            opacity: 0.8,
                          }
                        : {
                            backgroundColor: color + '20',
                            borderLeftColor: color,
                          }
                    ]}
                    onPress={() => onEventPress(event)}
                  >
                    <ThemedText style={[
                      styles.eventText,
                      isCompleted && { textDecorationLine: 'line-through', opacity: 0.7 }
                    ]}>
                      {formatEventForTimeline(event)}
                    </ThemedText>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      {isCancelled && (
                        <Ionicons name="close-circle" size={12} color="#d9534f" />
                      )}
                      {isCompleted && (
                        <Ionicons name="checkmark-circle" size={12} color="#4caf50" />
                      )}
                      <ThemedText style={[
                        styles.eventMeta,
                        isCompleted && { opacity: 0.7 }
                      ]}>
                        {new Date(event.start_at).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </ThemedText>
                    </View>
                  </TouchableOpacity>
                );
              })}
              
              {/* Show plus icon for empty slots */}
              {!hasEvents && (
                <View style={styles.addJobIndicator}>
                  <Ionicons name="add" size={16} color="#ccc" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Event count indicator */}
      {events.length > 0 && (
        <View style={styles.jobCountContainer}>
          <View style={[styles.jobCount, { backgroundColor: color }]}>
            <ThemedText style={styles.jobCountText}>
              {events.filter((event) => resolveEventStatus(event) === 'active').length}
            </ThemedText>
          </View>
          {events.filter((event) => resolveEventStatus(event) === 'completed').length > 0 && (
            <View style={[styles.jobCount, styles.completedJobCount]}>
              <Ionicons name="checkmark" size={10} color="#fff" />
              <ThemedText style={[styles.jobCountText, { fontSize: 10 }]}>
                {events.filter((event) => resolveEventStatus(event) === 'completed').length}
              </ThemedText>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  dayColumn: {
    flex: 1,
    minHeight: 600,
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
  },
  dayHeader: {
    padding: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    borderRadius: 8,
    height: 69, // Match day header height + borders + margins
    margin: 4,
  },
  dayName: {
    fontSize: 12,
    fontWeight: '600',
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  timeSlots: {
    flex: 1,
  },
  timeSlot: {
    height: 60,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  emptyTimeSlot: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  addJobIndicator: {
    opacity: 0.3,
  },
  eventItem: {
    backgroundColor: '#f0f8ff',
    borderLeftWidth: 3,
    borderRadius: 4,
    padding: 6,
    marginBottom: 2,
  },
  eventText: {
    fontSize: 11,
    fontWeight: '600',
  },
  eventMeta: {
    fontSize: 10,
    opacity: 0.7,
  },
  jobCount: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  jobCountContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    gap: 4,
  },
  completedJobCount: {
    backgroundColor: '#4caf50',
    flexDirection: 'row',
    paddingHorizontal: 4,
    width: 'auto',
    minWidth: 20,
  },
  jobCountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
