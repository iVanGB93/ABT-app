import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';

interface Job {
  id: number;
  description: string;
  scheduled_at: string;
  status: string;
  client: string;
  price: number;
}

interface DayColumnProps {
  date: Date;
  jobs: Job[];
  isToday: boolean;
  isSelected: boolean;
  onJobPress: (job: Job) => void;
  onTimeSlotPress: (date: Date, time: string) => void;
  onDatePress?: (date: Date) => void; // New prop for date navigation
  color: string;
  darkTheme: boolean;
  width?: number; // Optional width prop
}

// Helper to get time slots (8 AM to 8 PM)
const timeSlots = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
  '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
];

// Helper to format job for display
const formatJobForTimeline = (job: Job) => {
  const maxLength = 12;
  const description = job.description || 'No description';
  return description.length > maxLength 
    ? description.substring(0, maxLength) + '...' 
    : description;
};

// Helper to get job time from scheduled_at
const getJobTime = (scheduledAt: string): string => {
  const date = new Date(scheduledAt);
  return date.toTimeString().substring(0, 5); // "09:30"
};

export default function DayColumn({
  date,
  jobs,
  isToday,
  isSelected,
  onJobPress,
  onTimeSlotPress,
  onDatePress,
  color,
  darkTheme,
  width
}: DayColumnProps) {
  
  // Group jobs by time slot
  const jobsByTime = jobs.reduce((acc, job) => {
    const jobTime = getJobTime(job.scheduled_at);
    const hour = jobTime.split(':')[0];
    const timeSlot = `${hour}:00`;
    
    if (!acc[timeSlot]) {
      acc[timeSlot] = [];
    }
    acc[timeSlot].push(job);
    return acc;
  }, {} as { [key: string]: Job[] });

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
          const hasJobs = jobsByTime[timeSlot]?.length > 0;
          
          return (
            <TouchableOpacity
              key={timeSlot}
              style={[
                styles.timeSlot,
                !hasJobs && styles.emptyTimeSlot
              ]}
              onPress={() => !hasJobs && onTimeSlotPress(date, timeSlot)}
              activeOpacity={hasJobs ? 1 : 0.7}
            >
              {/* Show jobs for this time slot */}
              {jobsByTime[timeSlot]?.map((job) => {
                const isCompleted = job.status === 'completed' || job.status === 'paid';
                
                return (
                  <TouchableOpacity
                    key={job.id}
                    style={[
                      styles.jobItem,
                      isCompleted 
                        ? { 
                            backgroundColor: '#e8f5e8', 
                            borderLeftColor: '#4caf50',
                            opacity: 0.8 
                          }
                        : { 
                            backgroundColor: color + '20', 
                            borderLeftColor: color 
                          }
                    ]}
                    onPress={() => onJobPress(job)}
                  >
                    <ThemedText style={[
                      styles.jobText,
                      isCompleted && { textDecorationLine: 'line-through', opacity: 0.7 }
                    ]}>
                      {formatJobForTimeline(job)}
                    </ThemedText>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      {isCompleted && (
                        <Ionicons name="checkmark-circle" size={12} color="#4caf50" />
                      )}
                      <ThemedText style={[
                        styles.jobPrice,
                        isCompleted && { opacity: 0.7 }
                      ]}>
                        ${job.price || 0}
                      </ThemedText>
                    </View>
                  </TouchableOpacity>
                );
              })}
              
              {/* Show plus icon for empty slots */}
              {!hasJobs && (
                <View style={styles.addJobIndicator}>
                  <Ionicons name="add" size={16} color="#ccc" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Jobs count indicator */}
      {jobs.length > 0 && (
        <View style={styles.jobCountContainer}>
          <View style={[styles.jobCount, { backgroundColor: color }]}>
            <ThemedText style={styles.jobCountText}>
              {jobs.filter(job => job.status !== 'completed' && job.status !== 'paid').length}
            </ThemedText>
          </View>
          {jobs.filter(job => job.status === 'completed' || job.status === 'paid').length > 0 && (
            <View style={[styles.jobCount, styles.completedJobCount]}>
              <Ionicons name="checkmark" size={10} color="#fff" />
              <ThemedText style={[styles.jobCountText, { fontSize: 10 }]}>
                {jobs.filter(job => job.status === 'completed' || job.status === 'paid').length}
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
  jobItem: {
    backgroundColor: '#f0f8ff',
    borderLeftWidth: 3,
    borderRadius: 4,
    padding: 6,
    marginBottom: 2,
  },
  jobText: {
    fontSize: 11,
    fontWeight: '600',
  },
  jobPrice: {
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
