import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { create } from "zustand";

import {
  deleteHabit as deleteHabitStorage,
  getHabits,
  getHabitStats,
  HabitStats,
  loadHabitStats,
  saveHabits,
  saveHabitStats,
  toggleHabitToday,
} from "@/storage/habitStorage";

import {
  cancelHabitNotification,
  scheduleHabitNotification,
} from "@/notifications/scheduler";

import { Habit, HabitSchedule, HabitType } from "@/models/habit";

const HABIT_KEY = "@becomeit_habits";
const HABIT_STATS_KEY = "@becomeit_habit_stats";
const KEY_PREFIX = "habit_notification_";

interface HabitState {
  habits: Habit[];
  stats: HabitStats;
  loading: boolean;

  loadHabits: () => Promise<void>;
  loadStats: () => Promise<void>;

  addHabit: (
    habitData: Omit<
      Habit,
      | "id"
      | "createdAt"
      | "completedDates"
      | "streak"
      | "lastNotifiedAt"
      | "lastCompletedAt"
      | "lastStreakDate"
      | "nextActivationAt"
      | "isMastered"
    >,
  ) => Promise<Habit>;

  deleteHabit: (id: string) => Promise<void>;
  updateHabit: (id: string, updates: Partial<Habit>) => void;

  toggleHabitToday: (id: string) => Promise<void>;
  markHabitCompleted: (id: string) => Promise<void>;
  markHabitNotified: (id:any, notifId:any) => Promise<void>;
  // markHabitDue: (id: string) => Promise<void>;

  clearAllHabits: () => Promise<void>;
}

export const useHabitStore = create<HabitState>((set, get) => ({
  habits: [],
  stats: {
    totalCompletions: 0,
    totalOpportunities: 0,
    completionDates: [],
    accuracy: 0,
  },
  loading: true,

  // ---------------- LOAD ----------------

  loadHabits: async () => {
    const habits = await getHabits();
    set({ habits, loading: false });
  },

  loadStats: async () => {
    const stats = await loadHabitStats();
    set({ stats });
  },

  // ---------------- ADD ----------------

  addHabit: async (habitData) => {
    const newHabit: Habit = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2),
      title: habitData.title,
      habitType: habitData.habitType as HabitType,
      schedule: habitData.schedule as HabitSchedule,
      createdAt: Date.now(),
      completedDates: [],
      streak: 0,
      icon: habitData.icon,
      category: habitData.category,
      completedCount: 0,
      notificationCount: 0,
      tone: habitData.tone,
      isMastered: false,
      pendingCompletions: 0,
      lastNotificationId:undefined
    };

    const updated = [...get().habits, newHabit];
    set({ habits: updated });
    await saveHabits(updated);
    await scheduleHabitNotification(newHabit);

    return newHabit;
  },

  // ---------------- UPDATE ----------------

  updateHabit: (id, updates) => {
    const updated = get().habits.map((h) =>
      h.id === id ? { ...h, ...updates } : h,
    );

    set({ habits: updated });
    saveHabits(updated);

    // mastered = remove habit + cancel notification ONLY
    if (updates.isMastered === true) {
      cancelHabitNotification(id);
      const filtered = updated.filter((h) => h.id !== id);
      set({ habits: filtered });
      saveHabits(filtered);
    }
  },

  // ---------------- DELETE ----------------

  deleteHabit: async (id) => {
    const updated = await deleteHabitStorage(id);
    set({ habits: updated });
    await cancelHabitNotification(id);
  },

  // ---------------- TOGGLE (UI only) ----------------

  toggleHabitToday: async (id) => {
    const updated = await toggleHabitToday(id);
    set({ habits: updated });
  },

  // ---------------- NOTIFIED ----------------

markHabitNotified: async (id, notifId) => {
  const now = Date.now();

  set((state) => {
    const habits = state.habits.map((h) => {
      if (h.id !== id) return h;

      return {
        ...h,
        notificationCount: (h.notificationCount ?? 0) + 1,
        pendingCompletions: (h.pendingCompletions ?? 0) + 1,
        lastNotifiedAt: now,
        lastNotificationId: notifId,
      };
    });

    saveHabits(habits);
    return { habits };
  });

  // stats = ONE opportunity per notification
  const stats = await getHabitStats();
  await saveHabitStats({
    ...stats,
    totalOpportunities: stats.totalOpportunities + 1,
  });

  set({ stats: await getHabitStats() });
},


  // ---------------- COMPLETED ----------------
markHabitCompleted: async (id) => {
  set((state) => {
    const habits = state.habits.map((h) => {
      if (h.id !== id) return h;
      if ((h.pendingCompletions ?? 0) <= 0) return h;

      return {
        ...h,
        completedCount: (h.completedCount ?? 0) + 1,
        completedDates: [...h.completedDates, new Date().toISOString()],
        pendingCompletions: h.pendingCompletions - 1,
        lastCompletedAt: Date.now(),
      };
    });

    saveHabits(habits);
    return { habits };
  });

  const stats = await getHabitStats();
  await saveHabitStats({
    ...stats,
    totalCompletions: stats.totalCompletions + 1,
    completionDates: [...stats.completionDates, new Date().toISOString()],
  });

  set({ stats: await getHabitStats() });
},



  clearAllHabits: async () => {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const n of scheduled) {
      await Notifications.cancelScheduledNotificationAsync(n.identifier);
    }

    await AsyncStorage.removeItem(HABIT_KEY);
    await AsyncStorage.removeItem(HABIT_STATS_KEY);

    const keys = await AsyncStorage.getAllKeys();
    const notifKeys = keys.filter((k) => k.startsWith(KEY_PREFIX));
    await AsyncStorage.multiRemove(notifKeys);

    set({
      habits: [],
      stats: {
        totalCompletions: 0,
        totalOpportunities: 0,
        completionDates: [],
        accuracy: 0,
      },
    });
  },
}));
