import AsyncStorage from "@react-native-async-storage/async-storage";
import { Habit } from "../models/habit";

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

const HABIT_KEY = "@becomeit_habits";
const HABIT_STATS_KEY = "@becomeit_habit_stats";

// ---------- helpers ----------

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

// ---------- core ----------

export interface HabitStats {
  totalCompletions: number;
  totalOpportunities: number;
  completionDates: string[]; // ISO dates
}

export async function getHabits(): Promise<Habit[]> {
  const raw = await AsyncStorage.getItem(HABIT_KEY);
  if (!raw) return [];
  return JSON.parse(raw);
}

export async function saveHabits(habits: Habit[]) {
  await AsyncStorage.setItem(HABIT_KEY, JSON.stringify(habits));
}

// ---------- actions ----------

// ---------- actions ----------
export async function addHabit(
  habit: Omit<Habit, "id" | "createdAt" | "completedDates">
) {
  const habits = await getHabits();
 
  const newHabit: Habit = {
    id: generateId(),
    title: habit.title,
    schedule: habit.schedule,
    createdAt: Date.now(),
    completedDates: [],
  };

  const updated = [...habits, newHabit];
  await saveHabits(updated);

  return updated; // return full updated array for immediate state update
}


export async function deleteHabit(id: string) {
  const habits = await getHabits();
  const updated = habits.filter((h) => h.id !== id);
  await saveHabits(updated);

  return updated; // return full updated array
}

function defaultStats(): HabitStats {
  return {
    totalCompletions: 0,
    totalOpportunities: 0,
    completionDates: [],
  };
}

export async function toggleHabitToday(id: string) {
  const habits = await getHabits();
  const today = todayISO();

  const updated = habits.map((habit) => {
    if (habit.id !== id) return habit;

    const completed = habit.completedDates.includes(today);

    return {
      ...habit,
      completedDates: completed
        ? habit.completedDates.filter((d: any) => d !== today)
        : [...habit.completedDates, today],
    };
  });

  await saveHabits(updated);
  return updated;  
}


export async function clearHabits() {
  await AsyncStorage.removeItem(HABIT_KEY);
}

export async function getHabitStats(): Promise<HabitStats> {
  const raw = await AsyncStorage.getItem(HABIT_STATS_KEY);
  if (!raw) return defaultStats();

  try {
    const parsed = JSON.parse(raw);
    return {
      totalCompletions: parsed.totalCompletions ?? 0,
      totalOpportunities: parsed.totalOpportunities ?? 0,
      completionDates: Array.isArray(parsed.completionDates)
        ? parsed.completionDates
        : [],
    };
  } catch {
    return defaultStats();
  }
}

export async function saveHabitStats(stats: HabitStats) {
  await AsyncStorage.setItem(HABIT_STATS_KEY, JSON.stringify(stats));
}
