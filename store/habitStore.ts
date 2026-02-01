import { create } from "zustand";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  getHabits,
  saveHabits,
  deleteHabit as deleteHabitStorage,
  toggleHabitToday,
  markHabitCompleted as markHabitCompletedStorage,
  markHabitNotified as markHabitNotifiedStorage,
  getHabitStats,
  saveHabitStats,
  loadHabitStats,
  HabitStats,
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
    >
  ) => Promise<Habit>;

  deleteHabit: (id: string) => Promise<void>;
  updateHabit: (id: string, updates: Partial<Habit>) => void;

  toggleHabitToday: (id: string) => Promise<void>;
  markHabitCompleted: (id: string) => Promise<void>;
  markHabitNotified: (id: string) => Promise<void>;
  markHabitDue: (id: string) => Promise<void>;

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

  markHabitNotified: async (id) => {
    const updatedHabits = await markHabitNotifiedStorage(id);
    set({
      habits: updatedHabits.map((h) =>
        h.id === id ? { ...h, due: true } : h,
      ),
    });

    //  reload stats from storage ONLY
    const stats = await getHabitStats();
    set({ stats });
  },

  // ---------------- COMPLETED ----------------

  markHabitCompleted: async (id) => {
    const updatedHabits = await markHabitCompletedStorage(id);
    set({ habits: updatedHabits });

    // disable only this habit
    get().updateHabit(id, { due: false });

    //  reload stats from storage ONLY
    const stats = await getHabitStats();
    set({ stats });
  },

  markHabitDue: async (id) => {
    const updated = get().habits.map((h) =>
      h.id === id ? { ...h, due: true } : h,
    );
    set({ habits: updated });
    await saveHabits(updated);
  },

  // ---------------- CLEAR ----------------

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
