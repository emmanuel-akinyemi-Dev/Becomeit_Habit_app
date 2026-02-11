import { generateOccurrences } from "@/services/occurenceGenerator";
import { Habit, HabitOccurrence } from "@/types/habit";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type HabitState = {
  habits: Habit[];
  occurrences: HabitOccurrence[];

  addHabit: (habit: Habit) => Promise<void>;
  completeOccurrence: (occurrenceId: string) => void;
  regenerate: () => Promise<void>;
};

export const useHabitStore = create<HabitState>()(
  persist(
    (set, get) => ({
      habits: [],
      occurrences: [],

      addHabit: async (habit) => {
        const habits = [...get().habits, habit];
        const occurrences = await generateOccurrences(
          habits,
          get().occurrences,
        );
        set({ habits, occurrences });
      },

      completeOccurrence: (occurrenceId) =>
        set((state) => ({
          occurrences: state.occurrences.map((o) =>
            o.id === occurrenceId ? { ...o, completedAt: Date.now() } : o,
          ),
        })),

      regenerate: async () => {
        const occurrences = await regenerateOccurrences(
          get().habits,
          get().occurrences,
        );
        set({ occurrences });
      },
    }),
    { name: "habit-store" },
  ),
);
