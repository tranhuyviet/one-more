import { create } from 'zustand';
import { ExerciseLog, DailyStats } from '@/types';
import { getTodayLogs, getLogs, addLog, deleteLog, aggregateDailyStats, getDateString } from '@/firebase/logs';

interface LogState {
  todayLogs: ExerciseLog[];
  rangedLogs: ExerciseLog[];
  loading: boolean;
  loadTodayLogs: (userId: string) => Promise<void>;
  loadLogs: (userId: string, startMs: number, endMs: number) => Promise<void>;
  addLog: (userId: string, log: Omit<ExerciseLog, 'id'>) => Promise<void>;
  deleteLog: (userId: string, logId: string) => Promise<void>;
  getTodayStats: () => DailyStats[];
}

export const useLogStore = create<LogState>((set, get) => ({
  todayLogs: [],
  rangedLogs: [],
  loading: false,

  loadTodayLogs: async (userId) => {
    set({ loading: true });
    const logs = await getTodayLogs(userId);
    set({ todayLogs: logs, loading: false });
  },

  loadLogs: async (userId, startMs, endMs) => {
    set({ loading: true });
    const logs = await getLogs(userId, startMs, endMs);
    set({ rangedLogs: logs, loading: false });
  },

  addLog: async (userId, log) => {
    const id = await addLog(userId, log);
    const newLog = { id, ...log };
    set(s => ({ todayLogs: [newLog, ...s.todayLogs] }));
  },

  deleteLog: async (userId, logId) => {
    await deleteLog(userId, logId);
    set(s => ({
      todayLogs: s.todayLogs.filter(l => l.id !== logId),
      rangedLogs: s.rangedLogs.filter(l => l.id !== logId),
    }));
  },

  getTodayStats: () => {
    const today = getDateString(new Date());
    return aggregateDailyStats(get().todayLogs, today);
  },
}));
