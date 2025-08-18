import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

interface Job {
  id: number;
  scheduled_at?: string | null;
}

interface MonthCalendarProps {
  jobs: Job[];
  selectedDate: Date;
  onDatePress: (date: Date) => void;
  color: string;
  darkTheme: boolean;
}

// Helper to get days in month
const getDaysInMonth = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay();
  
  const days = [];
  
  // Add empty days for previous month
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push(null);
  }
  
  // Add days of current month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(year, month, day));
  }
  
  return days;
};

// Helper to count jobs for a specific date
const getJobCountForDate = (jobs: Job[], targetDate: Date): number => {
  return jobs.filter(job => {
    if (!job.scheduled_at) return false;
    
    const jobDate = new Date(job.scheduled_at);
    return jobDate.toDateString() === targetDate.toDateString();
  }).length;
};

// Helper to check if date is today
const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

// Helper to check if date is selected
const isSelected = (date: Date, selectedDate: Date): boolean => {
  return date.toDateString() === selectedDate.toDateString();
};

export default function MonthCalendar({
  jobs,
  selectedDate,
  onDatePress,
  color,
  darkTheme
}: MonthCalendarProps) {
  
  const days = getDaysInMonth(selectedDate);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return (
    <View style={[styles.calendar, { backgroundColor: darkTheme ? '#1a1a1a' : '#fff' }]}>
      {/* Week days header */}
      <View style={[styles.weekHeader, { borderBottomColor: darkTheme ? '#333' : '#e0e0e0' }]}>
        {weekDays.map(day => (
          <View key={day} style={styles.weekDayCell}>
            <ThemedText style={styles.weekDayText}>{day}</ThemedText>
          </View>
        ))}
      </View>
      
      {/* Calendar grid */}
      <View style={styles.calendarGrid}>
        {Array.from({ length: Math.ceil(days.length / 7) }, (_, weekIndex) => (
          <View key={weekIndex} style={styles.weekRow}>
            {days.slice(weekIndex * 7, (weekIndex + 1) * 7).map((date, dayIndex) => {
              if (!date) {
                return <View key={`empty-${weekIndex}-${dayIndex}`} style={styles.dayCell} />;
              }
              
              const jobCount = getJobCountForDate(jobs, date);
              const isTodayDate = isToday(date);
              const isSelectedDate = isSelected(date, selectedDate);
              
              return (
                <TouchableOpacity
                  key={date.toDateString()}
                  style={[
                    styles.dayCell,
                    isTodayDate && { backgroundColor: color + '20' },
                    isSelectedDate && { backgroundColor: color }
                  ]}
                  onPress={() => onDatePress(date)}
                >
                  <ThemedText style={[
                    styles.dayText,
                    isTodayDate && { color: color, fontWeight: 'bold' },
                    isSelectedDate && { color: '#fff', fontWeight: 'bold' }
                  ]}>
                    {date.getDate()}
                  </ThemedText>
                  
                  {/* Job count indicator */}
                  {jobCount > 0 && (
                    <View style={[
                      styles.jobCountBadge,
                      { backgroundColor: isSelectedDate ? '#fff' : color }
                    ]}>
                      <ThemedText style={[
                        styles.jobCountText,
                        { color: isSelectedDate ? color : '#fff' }
                      ]}>
                        {jobCount}
                      </ThemedText>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  calendar: {
    borderRadius: 12,
    margin: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  weekHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  weekDayCell: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.7,
  },
  calendarGrid: {
    padding: 8,
  },
  weekRow: {
    flexDirection: 'row',
  },
  dayCell: {
    flex: 1,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
    borderRadius: 8,
    position: 'relative',
  },
  dayText: {
    fontSize: 16,
  },
  jobCountBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 18,
  },
  jobCountText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
});
