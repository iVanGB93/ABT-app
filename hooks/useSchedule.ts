import { type Dispatch, type SetStateAction, useCallback, useEffect, useState } from 'react';

import {
  scheduleService,
  type ScheduleCreateData,
  type ScheduleEvent,
  type ScheduleOccurrence,
  type ScheduleParticipant,
  type ScheduleParticipantCreateData,
  type ScheduleReminder,
  type ScheduleReminderCreateData,
} from '@/services';

interface UseSchedulesParams {
  mode?: 'all' | 'today' | 'upcoming' | 'range';
  days?: number;
  start?: string;
  end?: string;
  content_type?: number;
  object_id?: number;
}

interface UseSchedulesState {
  schedules: ScheduleEvent[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

interface UseScheduleActionsState {
  createSchedule: (data: ScheduleCreateData) => Promise<ScheduleEvent | null>;
  updateSchedule: (id: number, data: Partial<ScheduleCreateData>) => Promise<ScheduleEvent | null>;
  deleteSchedule: (id: number) => Promise<boolean>;
  getOccurrences: (id: number, params?: { start?: string; end?: string; count?: number }) => Promise<ScheduleOccurrence[]>;
}

export const useSchedules = (params?: UseSchedulesParams): UseSchedulesState => {
  const [schedules, setSchedules] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedules = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const mode = params?.mode ?? 'all';
      let data: ScheduleEvent[] = [];

      if (mode === 'today') {
        data = await scheduleService.getTodaySchedules();
      } else if (mode === 'upcoming') {
        data = await scheduleService.getUpcomingSchedules(params?.days ?? 7);
      } else if (mode === 'range') {
        if (!params?.start || !params?.end) {
          setSchedules([]);
          return;
        }
        data = await scheduleService.getRangeSchedules(params.start, params.end);
      } else {
        data = await scheduleService.getSchedules({
          content_type: params?.content_type,
          object_id: params?.object_id,
        });
      }

      setSchedules(data);
    } catch (err: any) {
      setError(err?.message ?? 'Error loading schedules');
    } finally {
      setLoading(false);
    }
  }, [params?.content_type, params?.days, params?.end, params?.mode, params?.object_id, params?.start]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  return {
    schedules,
    loading,
    error,
    refresh: fetchSchedules,
  };
};

export const useScheduleActions = (setSchedules?: Dispatch<SetStateAction<ScheduleEvent[]>>): UseScheduleActionsState => {
  const createSchedule = async (data: ScheduleCreateData): Promise<ScheduleEvent | null> => {
    try {
      const created = await scheduleService.createSchedule(data);
      if (setSchedules) {
        setSchedules((prev) => [...prev, created]);
      }
      return created;
    } catch {
      return null;
    }
  };

  const updateSchedule = async (id: number, data: Partial<ScheduleCreateData>): Promise<ScheduleEvent | null> => {
    try {
      const updated = await scheduleService.updateSchedule(id, data);
      if (setSchedules) {
        setSchedules((prev) => prev.map((schedule) => (schedule.id === id ? updated : schedule)));
      }
      return updated;
    } catch {
      return null;
    }
  };

  const deleteSchedule = async (id: number): Promise<boolean> => {
    try {
      await scheduleService.deleteSchedule(id);
      if (setSchedules) {
        setSchedules((prev) => prev.filter((schedule) => schedule.id !== id));
      }
      return true;
    } catch {
      return false;
    }
  };

  const getOccurrences = async (
    id: number,
    params?: { start?: string; end?: string; count?: number }
  ): Promise<ScheduleOccurrence[]> => {
    try {
      return await scheduleService.getOccurrences(id, params);
    } catch {
      return [];
    }
  };

  return {
    createSchedule,
    updateSchedule,
    deleteSchedule,
    getOccurrences,
  };
};

export const useScheduleParticipants = (scheduleId: number | null): {
  participants: ScheduleParticipant[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addParticipant: (data: ScheduleParticipantCreateData) => Promise<ScheduleParticipant | null>;
  updateParticipant: (id: number, data: Partial<ScheduleParticipantCreateData>) => Promise<ScheduleParticipant | null>;
  deleteParticipant: (id: number) => Promise<boolean>;
} => {
  const [participants, setParticipants] = useState<ScheduleParticipant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!scheduleId) {
      setParticipants([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await scheduleService.getParticipants(scheduleId);
      setParticipants(data);
    } catch (err: any) {
      setError(err?.message ?? 'Error loading participants');
    } finally {
      setLoading(false);
    }
  }, [scheduleId]);

  const addParticipant = async (data: ScheduleParticipantCreateData): Promise<ScheduleParticipant | null> => {
    if (!scheduleId) {
      return null;
    }

    try {
      const created = await scheduleService.addParticipant(scheduleId, data);
      setParticipants((prev) => [...prev, created]);
      return created;
    } catch {
      return null;
    }
  };

  const updateParticipant = async (
    id: number,
    data: Partial<ScheduleParticipantCreateData>
  ): Promise<ScheduleParticipant | null> => {
    try {
      const updated = await scheduleService.updateParticipant(id, data);
      setParticipants((prev) => prev.map((participant) => (participant.id === id ? updated : participant)));
      return updated;
    } catch {
      return null;
    }
  };

  const deleteParticipant = async (id: number): Promise<boolean> => {
    try {
      await scheduleService.deleteParticipant(id);
      setParticipants((prev) => prev.filter((participant) => participant.id !== id));
      return true;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    participants,
    loading,
    error,
    refresh,
    addParticipant,
    updateParticipant,
    deleteParticipant,
  };
};

export const useScheduleReminders = (scheduleId: number | null): {
  reminders: ScheduleReminder[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addReminder: (data: ScheduleReminderCreateData) => Promise<ScheduleReminder | null>;
  updateReminder: (id: number, data: Partial<ScheduleReminderCreateData>) => Promise<ScheduleReminder | null>;
  deleteReminder: (id: number) => Promise<boolean>;
} => {
  const [reminders, setReminders] = useState<ScheduleReminder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!scheduleId) {
      setReminders([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await scheduleService.getReminders(scheduleId);
      setReminders(data);
    } catch (err: any) {
      setError(err?.message ?? 'Error loading reminders');
    } finally {
      setLoading(false);
    }
  }, [scheduleId]);

  const addReminder = async (data: ScheduleReminderCreateData): Promise<ScheduleReminder | null> => {
    if (!scheduleId) {
      return null;
    }

    try {
      const created = await scheduleService.addReminder(scheduleId, data);
      setReminders((prev) => [...prev, created]);
      return created;
    } catch {
      return null;
    }
  };

  const updateReminder = async (
    id: number,
    data: Partial<ScheduleReminderCreateData>
  ): Promise<ScheduleReminder | null> => {
    try {
      const updated = await scheduleService.updateReminder(id, data);
      setReminders((prev) => prev.map((reminder) => (reminder.id === id ? updated : reminder)));
      return updated;
    } catch {
      return null;
    }
  };

  const deleteReminder = async (id: number): Promise<boolean> => {
    try {
      await scheduleService.deleteReminder(id);
      setReminders((prev) => prev.filter((reminder) => reminder.id !== id));
      return true;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    reminders,
    loading,
    error,
    refresh,
    addReminder,
    updateReminder,
    deleteReminder,
  };
};
