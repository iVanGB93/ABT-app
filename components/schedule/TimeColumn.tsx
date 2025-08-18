import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

// Time slots from 8 AM to 8 PM
const timeSlots = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
  '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
];

// Helper to format time display
const formatTimeDisplay = (time: string): string => {
  const hour = parseInt(time.split(':')[0]);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour} ${ampm}`;
};

export default function TimeColumn() {
  return (
    <View style={styles.timeColumn}>
      {/* Header spacer to align with day headers */}
      <View style={styles.headerSpacer} />
      
      {/* Time slots */}
      {timeSlots.map((time) => (
        <View key={time} style={styles.timeSlot}>
          <ThemedText style={styles.timeText}>
            {formatTimeDisplay(time)}
          </ThemedText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  timeColumn: {
    width: 60,
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
    backgroundColor: 'rgba(128, 128, 128, 0.05)',
  },
  headerSpacer: {
    height: 74, // Match day header height + borders + margins
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  timeSlot: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
  },
  timeText: {
    fontSize: 10,
    fontWeight: '500',
    opacity: 0.7,
  },
});
