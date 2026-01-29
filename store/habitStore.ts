import { cancelHabitNotification, scheduleHabitNotification } from "@/notifications/scheduler";
import { getHabits, HabitStats, getHabitStats, saveHabits, saveHabitStats } from "@/storage/habitStorage";
import { create } from "zustand";
import { Habit, HabitSchedule, HabitType } from "../models/habit";
import { isCompletedToday } from "@/helpers/metricsHelper";

interface HabitState {
  habits: Habit[];
  stats: HabitStats;
  loading: boolean;
  loadHabits: () => Promise<void>;
  loadStats: () => Promise<void>;
  addHabit: (habitData: Omit<Habit, "id" | "createdAt" | "completedDates" | "streak">) => Promise<Habit>;
  deleteHabit: (id: string) => Promise<void>;
  toggleHabitToday: (id: string) => Promise<void>;
  toggleHabitInterval: (id: string) => Promise<void>;
  toggleDone: (id: string) => Promise<void>;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  markHabitNotified: (id: string) => Promise<void>;
}




export const useHabitStore = create<HabitState>((set, get) => ({
  habits: [],
  stats: {
    totalCompletions: 0,
    totalOpportunities: 0,
    completionDates: [],
  },
  loading: true,


  
  // ---------------- Load ----------------
  loadHabits: async () => {
    const data = await getHabits();
    const normalized: Habit[] = (data ?? []).map((h) => ({
      ...h,
      completedDates: Array.isArray(h.completedDates) ? h.completedDates : [],
      streak: typeof h.streak === "number" ? h.streak : 0,
    }));
    set({ habits: normalized, loading: false });
  },

  loadStats: async () => {
    const stats = await getHabitStats();
    set({ stats });
  },

  // ---------------- Add / Update ----------------
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
      tone: habitData.tone,
      lastNotifiedAt: undefined,
      lastCompletedAt: undefined,
      lastStreakDate: undefined,
      nextActivationAt: undefined,
    };

    const updatedHabits = [...get().habits, newHabit];
    set({ habits: updatedHabits });
    await saveHabits(updatedHabits);
    await scheduleHabitNotification(newHabit);

    return newHabit;
  },

  updateHabit: (id, updates) => {
    const updatedHabits = get().habits.map((habit) =>
      habit.id === id ? { ...habit, ...updates } : habit,
    );
    set({ habits: updatedHabits });
    saveHabits(updatedHabits);
  },

  // ---------------- Notifications ----------------
  markHabitNotified: async (id) => {
    const now = new Date().toISOString();
    get().updateHabit(id, { lastNotifiedAt: now });

    const stats = get().stats;
    const updatedStats: HabitStats = {
      ...stats,
      totalOpportunities: stats.totalOpportunities + 1,
    };

    set({ stats: updatedStats });
    await saveHabitStats(updatedStats);

    console.log("[Notify] Habit activated:", id, now);
  },

  // ---------------- Delete ----------------
  deleteHabit: async (id) => {
    await cancelHabitNotification(id);
    const updatedHabits = get().habits.filter((h) => h.id !== id);
    set({ habits: updatedHabits });
    await saveHabits(updatedHabits);
  },

  // ---------------- Toggle Today ----------------
  toggleHabitToday: async (id) => {
  const now = new Date();
  let completedToday = false;

  const updatedHabits = get().habits.map(habit => {
    if (habit.id !== id) return habit;

    // Check if already completed today
    const alreadyDoneToday = habit.completedDates.some(isCompletedToday);
    if (alreadyDoneToday) return habit;

    completedToday = true;

    const todayStr = now.toISOString().split("T")[0]; // for streak check
    const streak = habit.lastStreakDate === todayStr ? habit.streak : (habit.streak ?? 0) + 1;

    const updatedHabit: Habit = {
      ...habit,
      completedDates: [...habit.completedDates, now.toISOString()],
      streak,
      lastStreakDate: todayStr,
    };

    cancelHabitNotification(habit.id).then(() =>
      scheduleHabitNotification(updatedHabit)
    );

    return updatedHabit;
  });

  set({ habits: updatedHabits });
  await saveHabits(updatedHabits);

  if (completedToday) {
    const stats = get().stats;
    const updatedStats: HabitStats = {
      ...stats,
      totalCompletions: stats.totalCompletions + 1,
      completionDates: [...stats.completionDates, now.toISOString()],
    };
    set({ stats: updatedStats });
    await saveHabitStats(updatedStats);
  }
},

  // ---------------- Toggle Interval ----------------
  toggleHabitInterval: async (id) => {
  const now = new Date();
  let completedNow = false;

  const updatedHabits = get().habits.map(habit => {
    if (habit.id !== id) return habit;
    if (!habit.lastNotifiedAt) return habit;

    const notifiedAt = new Date(habit.lastNotifiedAt);
    const lastCompleted = habit.lastCompletedAt ? new Date(habit.lastCompletedAt) : null;
    if (lastCompleted && lastCompleted >= notifiedAt) return habit;

    completedNow = true;

    const lastStreakDay = habit.lastCompletedAt
      ? new Date(habit.lastCompletedAt).toDateString()
      : null;
    const incrementStreak = now.toDateString() !== lastStreakDay;

    const updatedHabit: Habit = {
      ...habit,
      completedDates: [...habit.completedDates, now.toISOString()],
      lastCompletedAt: now.toISOString(),
      streak: incrementStreak ? (habit.streak ?? 0) + 1 : habit.streak,
    };

    cancelHabitNotification(habit.id).then(() =>
      scheduleHabitNotification(updatedHabit)
    );

    return updatedHabit;
  });

  set({ habits: updatedHabits });
  await saveHabits(updatedHabits);

  if (completedNow) {
    const stats = get().stats;
    const updatedStats: HabitStats = {
      ...stats,
      totalCompletions: stats.totalCompletions + 1,
      completionDates: [...stats.completionDates, now.toISOString()],
    };
    set({ stats: updatedStats });
    await saveHabitStats(updatedStats);
  }
},

  // ---------------- Toggle Done ----------------
  toggleDone: async (id) => {
    await get().toggleHabitToday(id);
  },
}));
