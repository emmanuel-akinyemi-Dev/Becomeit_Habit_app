// store/habitStore.ts
import { create } from "zustand";
import { Habit } from "../models/habit";
import { getHabits, saveHabits } from "@/storage/habitStorage";

// ------------------- types -------------------
interface HabitState {
  habits: Habit[];
  loading: boolean;

  loadHabits: () => Promise<void>;
  addHabit: (habitData: Omit<Habit, "id" | "createdAt" | "completedDates">) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleHabitToday: (id: string) => Promise<void>;
}

// ------------------- store -------------------
export const useHabitStore = create<HabitState>((set, get) => ({
  habits: [],
  loading: true,

  // Load habits from AsyncStorage
  loadHabits: async () => {
    const data = await getHabits();
    set({ habits: data, loading: false });
  },

  // Add a new habit
  addHabit: async (habitData) => {
    const currentHabits = get().habits;

    const newHabit: Habit = {
      id: Date.now().toString(36) + Math.random().toString(36).substring(2, 9),
      title: habitData.title,
      schedule: habitData.schedule,
      createdAt: Date.now(),
      completedDates: [],
    };

    const updatedHabits = [...currentHabits, newHabit];
    await saveHabits(updatedHabits);
    set({ habits: updatedHabits });
  },

  // Delete a habit by id
  deleteHabit: async (id) => {
    const currentHabits = get().habits;
    const updatedHabits = currentHabits.filter((h) => h.id !== id);
    await saveHabits(updatedHabits);
    set({ habits: updatedHabits });
  },

  // Toggle completion for today
  toggleHabitToday: async (id) => {
    const currentHabits = get().habits;
    const today = new Date().toISOString().split("T")[0];

    const updatedHabits = currentHabits.map((habit) => {
      if (habit.id !== id) return habit;

      const completed = habit.completedDates.includes(today);
      return {
        ...habit,
        completedDates: completed
          ? habit.completedDates.filter((d) => d !== today)
          : [...habit.completedDates, today],
      };
    });

    await saveHabits(updatedHabits);
    set({ habits: updatedHabits });
  },
}));
