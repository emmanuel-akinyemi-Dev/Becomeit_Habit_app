import { cancelHabitNotification, scheduleHabitNotification } from "@/notifications/scheduler";
import { getHabits, saveHabits } from "@/storage/habitStorage";
import { create } from "zustand";
import { Habit, HabitType, HabitSchedule } from "../models/habit";

interface HabitState {
  habits: Habit[];
  loading: boolean;
  loadHabits: () => Promise<void>;
  addHabit: (habitData: Omit<Habit, "id" | "createdAt" | "completedDates" | "streak">) => Promise<Habit>;
  deleteHabit: (id: string) => Promise<void>;
  toggleHabitToday: (id: string) => Promise<void>;
  toggleHabitInterval: (id: string) => Promise<void>;
  toggleDone: (id: string) => Promise<void>;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  markHabitNotified: (id: string) => void;
}

export const useHabitStore = create<HabitState>((set, get) => ({
  habits: [],
  loading: true,

  loadHabits: async () => {
    const data = await getHabits();
    const normalized: Habit[] = (data ?? []).map((h) => ({
      ...h,
      completedDates: Array.isArray(h.completedDates) ? h.completedDates : [],
      streak: typeof h.streak === "number" ? h.streak : 0,
    }));
    set({ habits: normalized, loading: false });
  },

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
      habit.id === id ? { ...habit, ...updates } : habit
    );
    set({ habits: updatedHabits });
    saveHabits(updatedHabits);
  },

  markHabitNotified: (id) => {
    const now = new Date().toISOString();
    get().updateHabit(id, { lastNotifiedAt: now });
    console.log("[Notify] Habit activated:", id, now);
  },

  deleteHabit: async (id) => {
    await cancelHabitNotification(id);
    const updatedHabits = get().habits.filter((h) => h.id !== id);
    set({ habits: updatedHabits });
    await saveHabits(updatedHabits);
  },

  toggleHabitToday: async (id) => {
    const today = new Date().toISOString().split("T")[0];
    const updatedHabits = get().habits.map((habit) => {
      if (habit.id !== id) return habit;
      if (habit.completedDates.includes(today)) return habit;

      const streak = habit.lastStreakDate === today ? habit.streak : (habit.streak ?? 0) + 1;

      const updatedHabit: Habit = {
        ...habit,
        completedDates: [...habit.completedDates, today],
        streak,
        lastStreakDate: today,
      };

      cancelHabitNotification(habit.id).then(() => scheduleHabitNotification(updatedHabit));
      return updatedHabit;
    });

    set({ habits: updatedHabits });
    await saveHabits(updatedHabits);
  },

  toggleHabitInterval: async (id) => {
    const now = new Date();
    const updatedHabits = get().habits.map((habit) => {
      if (habit.id !== id) return habit;
      if (!habit.lastNotifiedAt) return habit;

      const notifiedAt = new Date(habit.lastNotifiedAt);
      const lastCompleted = habit.lastCompletedAt ? new Date(habit.lastCompletedAt) : null;
      if (lastCompleted && lastCompleted >= notifiedAt) return habit;

      const today = now.toDateString();
      const lastStreakDay = habit.lastCompletedAt ? new Date(habit.lastCompletedAt).toDateString() : null;
      const incrementStreak = today !== lastStreakDay;

      const updatedHabit: Habit = {
        ...habit,
        completedDates: [...habit.completedDates, now.toISOString()],
        lastCompletedAt: now.toISOString(),
        streak: incrementStreak ? (habit.streak ?? 0) + 1 : habit.streak,
      };

      cancelHabitNotification(habit.id).then(() => scheduleHabitNotification(updatedHabit));
      return updatedHabit;
    });

    set({ habits: updatedHabits });
    await saveHabits(updatedHabits);
  },

  toggleDone: async (id) => {
    await get().toggleHabitToday(id);
  },
}));
