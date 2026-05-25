import React, { useMemo } from 'react';
import { 
  View, 
  Modal, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedSecondaryView } from '@/components/ThemedSecondaryView';

interface Job {
  id: number;
  description: string;
  client_name_lastName?: string;
  client?: number;
  price: number;
  status: string;
  address: string;
  scheduled_at?: string | null;
}

interface ScheduleJobModalProps {
  visible: boolean;
  onClose: () => void;
  onScheduleJob: (job: Job) => void;
  onCreateJob: () => void;
  selectedDate: Date;
  selectedTime: string;
  jobs: Job[];
  color: string;
  darkTheme: boolean;
}

export default function ScheduleJobModal({
  visible,
  onClose,
  onScheduleJob,
  onCreateJob,
  selectedDate,
  selectedTime,
  jobs,
  color,
  darkTheme
}: ScheduleJobModalProps) {

  // Filter unscheduled jobs that aren't completed/cancelled/paid
  const availableJobs = useMemo(() => {
    return jobs.filter(job => 
      job &&
      job.id &&
      !job.scheduled_at && 
      job.status !== 'completed' && 
      job.status !== 'cancelled' &&
      job.status !== 'paid'
    );
  }, [jobs]);

  const formatDateTime = () => {
    const dateStr = selectedDate.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric'
    });
    const hour = parseInt(selectedTime.split(':')[0]);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${dateStr} at ${displayHour}:00 ${ampm}`;
  };

  const renderJobItem = ({ item }: { item: Job }) => {
    if (!item || !item.id) return null;

    return (
      <TouchableOpacity 
        style={[styles.jobItem, { borderColor: darkTheme ? '#444' : '#e0e0e0' }]}
        onPress={() => onScheduleJob(item)}
      >
        <View style={styles.jobHeader}>
          <ThemedText style={styles.jobDescription}>
            {item.description || 'No description'}
          </ThemedText>
          <ThemedText style={[styles.jobPrice, { color }]}>
            ${item.price || 0}
          </ThemedText>
        </View>
        
        <View style={styles.jobDetails}>
          <View style={styles.jobDetailRow}>
            <Ionicons name="person" size={14} color="#666" />
            <ThemedText style={styles.jobDetailText}>
              {item.client_name_lastName || `Client #${item.client || 'Unknown'}`}
            </ThemedText>
          </View>
          <View style={styles.jobDetailRow}>
            <Ionicons name="location" size={14} color="#666" />
            <ThemedText style={styles.jobDetailText} numberOfLines={1}>
              {item.address || 'No address'}
            </ThemedText>
          </View>
          <View style={styles.jobDetailRow}>
            <Ionicons name="flag" size={14} color="#666" />
            <ThemedText style={[styles.jobDetailText, styles.statusText]}>
              {item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1).replace('_', ' ') : 'Unknown'}
            </ThemedText>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <ThemedSecondaryView style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View>
              <ThemedText type="subtitle" style={styles.modalTitle}>
                Schedule Job
              </ThemedText>
              <ThemedText style={styles.modalSubtitle}>
                {formatDateTime()}
              </ThemedText>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={color} />
            </TouchableOpacity>
          </View>

          {/* Section label */}
          <ThemedText style={styles.sectionLabel}>Unscheduled jobs</ThemedText>

          {/* Job List */}
          {availableJobs.length > 0 ? (
            <FlatList
              data={availableJobs}
              keyExtractor={(item, index) => item.id ? item.id.toString() : `job-${index}`}
              renderItem={renderJobItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.jobList}
              ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="briefcase-outline" size={48} color="#ccc" />
              <ThemedText style={styles.emptyStateText}>
                No unscheduled jobs available
              </ThemedText>
              <ThemedText style={styles.emptyStateSubtext}>
                All active jobs are already scheduled
              </ThemedText>
            </View>
          )}

          {/* Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.createJobButton, { backgroundColor: color }]}
              onPress={onCreateJob}
            >
              <Ionicons name="add-circle-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
              <ThemedText style={styles.createJobButtonText}>Create New Job</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: darkTheme ? '#444' : '#ccc' }]}
              onPress={onClose}
            >
              <ThemedText>Cancel</ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedSecondaryView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalSubtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  sectionLabel: {
    marginTop: 14,
    marginHorizontal: 20,
    opacity: 0.7,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  jobList: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  jobItem: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    backgroundColor: 'rgba(128, 128, 128, 0.05)',
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  jobDescription: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  jobPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  jobDetails: {
    gap: 6,
  },
  jobDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  jobDetailText: {
    fontSize: 14,
    opacity: 0.8,
    flex: 1,
  },
  statusText: {
    textTransform: 'capitalize',
  },
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 8,
    textAlign: 'center',
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 10,
  },
  createJobButton: {
    flexDirection: 'row',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createJobButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  cancelButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
});
