import { ApiService } from './api';

export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RecurrenceRule {
  id: number;
  frequency: RecurrenceFrequency;
  interval: number;
  by_weekday: string;
  count: number | null;
  until: string | null;
  created_at: string;
  updated_at: string;
}

export interface ScheduleEvent {
  id: number;
  title: string;
  description: string;
  start_at: string;
  end_at: string;
  all_day: boolean;
  location: string;
  recurrence_rule: number | null;
  content_type: number | null;
  object_id: number | null;
  created_by: number | null;
  is_cancelled: boolean;
  created_at: string;
  updated_at: string;
}

export interface ScheduleCreateData {
  title: string;
  description?: string;
  start_at: string;
  end_at: string;
  all_day?: boolean;
  location?: string;
  recurrence_rule?: number | null;
  content_type?: number | null;
  object_id?: number | null;
  created_by?: number | null;
  is_cancelled?: boolean;
}

export interface ScheduleParticipant {
  id: number;
  schedule: number;
  user: number;
  role: 'organizer' | 'attendee';
  acceptance_status: 'pending' | 'accepted' | 'declined' | 'tentative';
  responded_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ScheduleParticipantCreateData {
  user: number;
  role?: 'organizer' | 'attendee';
  acceptance_status?: 'pending' | 'accepted' | 'declined' | 'tentative';
  responded_at?: string | null;
}

export interface ScheduleReminder {
  id: number;
  schedule: number;
  participant: number | null;
  minutes_before: number;
  channel: 'email' | 'push';
  is_sent: boolean;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ScheduleReminderCreateData {
  participant?: number | null;
  minutes_before: number;
  channel: 'email' | 'push';
  is_sent?: boolean;
  sent_at?: string | null;
}

export interface ScheduleOccurrence {
  start_at: string;
  end_at: string;
}

class ScheduleService extends ApiService {
  constructor() {
    super('/schedule');
  }

  async getSchedules(params?: { content_type?: number; object_id?: number }): Promise<ScheduleEvent[]> {
    return this.get<ScheduleEvent[]>('/list/', params);
  }

  async getRangeSchedules(start: string, end: string): Promise<ScheduleEvent[]> {
    return this.get<ScheduleEvent[]>('/range/', { start, end });
  }

  async getTodaySchedules(): Promise<ScheduleEvent[]> {
    return this.get<ScheduleEvent[]>('/today/');
  }

  async getUpcomingSchedules(days = 7): Promise<ScheduleEvent[]> {
    return this.get<ScheduleEvent[]>('/upcoming/', { days });
  }

  async getSchedule(id: number): Promise<ScheduleEvent> {
    return this.get<ScheduleEvent>(`/detail/${id}/`);
  }

  async createSchedule(data: ScheduleCreateData): Promise<ScheduleEvent> {
    return this.post<ScheduleEvent>('/create/', data);
  }

  async updateSchedule(id: number, data: Partial<ScheduleCreateData>): Promise<ScheduleEvent> {
    return this.put<ScheduleEvent>(`/update/${id}/`, data);
  }

  async deleteSchedule(id: number): Promise<{ message: string }> {
    return this.delete<{ message: string }>(`/delete/${id}/`);
  }

  async getRecurrenceRules(): Promise<RecurrenceRule[]> {
    return this.get<RecurrenceRule[]>('/recurrence-rules/');
  }

  async createRecurrenceRule(data: Omit<RecurrenceRule, 'id' | 'created_at' | 'updated_at'>): Promise<RecurrenceRule> {
    return this.post<RecurrenceRule>('/recurrence-rules/', data);
  }

  async updateRecurrenceRule(id: number, data: Partial<RecurrenceRule>): Promise<RecurrenceRule> {
    return this.put<RecurrenceRule>(`/recurrence-rules/${id}/`, data);
  }

  async deleteRecurrenceRule(id: number): Promise<{ message: string }> {
    return this.delete<{ message: string }>(`/recurrence-rules/${id}/`);
  }

  async getOccurrences(id: number, params?: { start?: string; end?: string; count?: number }): Promise<ScheduleOccurrence[]> {
    return this.get<ScheduleOccurrence[]>(`/occurrences/${id}/`, params);
  }

  async getParticipants(scheduleId: number): Promise<ScheduleParticipant[]> {
    return this.get<ScheduleParticipant[]>(`/participants/${scheduleId}/`);
  }

  async addParticipant(scheduleId: number, data: ScheduleParticipantCreateData): Promise<ScheduleParticipant> {
    return this.post<ScheduleParticipant>(`/participants/${scheduleId}/`, data);
  }

  async updateParticipant(id: number, data: Partial<ScheduleParticipantCreateData>): Promise<ScheduleParticipant> {
    return this.put<ScheduleParticipant>(`/participants/update/${id}/`, data);
  }

  async deleteParticipant(id: number): Promise<{ message: string }> {
    return this.delete<{ message: string }>(`/participants/delete/${id}/`);
  }

  async getReminders(scheduleId: number): Promise<ScheduleReminder[]> {
    return this.get<ScheduleReminder[]>(`/reminders/${scheduleId}/`);
  }

  async addReminder(scheduleId: number, data: ScheduleReminderCreateData): Promise<ScheduleReminder> {
    return this.post<ScheduleReminder>(`/reminders/${scheduleId}/`, data);
  }

  async updateReminder(id: number, data: Partial<ScheduleReminderCreateData>): Promise<ScheduleReminder> {
    return this.put<ScheduleReminder>(`/reminders/update/${id}/`, data);
  }

  async deleteReminder(id: number): Promise<{ message: string }> {
    return this.delete<{ message: string }>(`/reminders/delete/${id}/`);
  }
}

export const scheduleService = new ScheduleService();
