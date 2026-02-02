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

function computeAccuracy(totalCompletions: number, totalOpportunities: number) {
  if (!totalOpportunities) return 0;
  return Math.min(
    100,
    Math.round((totalCompletions / totalOpportunities) * 100),
  );
}

/**
 * Guard: a habit can only be completed once per notification
 */
function canCompleteHabit(
  habit: Habit & {
    lastNotifiedAt?: number;
    lastCompletedAt?: number;
  },
) {
  if (!habit.lastNotifiedAt) return false;
  if (!habit.lastCompletedAt) return true;
  return habit.lastCompletedAt < habit.lastNotifiedAt;
}

// ---------- stats ----------

export interface HabitStats {
  totalCompletions: number;
  totalOpportunities: number;
  completionDates: string[];
  accuracy: number;
}

function defaultStats(): HabitStats {
  return {
    totalCompletions: 0,
    totalOpportunities: 0,
    completionDates: [],
    accuracy: 0,
  };
}

// ---------- core ----------

export async function getHabits(): Promise<Habit[]> {
  const raw = await AsyncStorage.getItem(HABIT_KEY);
  if (!raw) return [];
  return JSON.parse(raw);
}

export async function saveHabits(habits: Habit[]) {
  await AsyncStorage.setItem(HABIT_KEY, JSON.stringify(habits));
}

// ---------- stats persistence ----------

export async function getHabitStats(): Promise<HabitStats> {
  const raw = await AsyncStorage.getItem(HABIT_STATS_KEY);
  if (!raw) return defaultStats();

  try {
    const parsed = JSON.parse(raw);

    const totalCompletions = parsed.totalCompletions ?? 0;
    const totalOpportunities = parsed.totalOpportunities ?? 0;

    return {
      totalCompletions,
      totalOpportunities,
      completionDates: Array.isArray(parsed.completionDates)
        ? parsed.completionDates
        : [],
      accuracy: computeAccuracy(totalCompletions, totalOpportunities),
    };
  } catch {
    return defaultStats();
  }
}

/**
 * Alias so store can call either name safely
 */
export const loadHabitStats = getHabitStats;

export async function saveHabitStats(stats: HabitStats) {
  const normalized: HabitStats = {
    ...stats,
    accuracy: computeAccuracy(stats.totalCompletions, stats.totalOpportunities),
  };

  await AsyncStorage.setItem(HABIT_STATS_KEY, JSON.stringify(normalized));
}

// ---------- actions ----------

export async function addHabit(
  habit: Omit<Habit, "id" | "createdAt" | "completedDates">,
) {
  const habits = await getHabits();

  const newHabit: Habit = {
    id: generateId(),
    title: habit.title,
    isMastered: false,
    schedule: habit.schedule,
    notificationCount: 0,
    completedCount: 0,
    createdAt: Date.now(),
    pendingCompletions:0,
    completedDates: [],
    lastNotificationId:undefined
  };

  const updated = [...habits, newHabit];
  await saveHabits(updated);
  return updated;
}

export async function deleteHabit(id: string) {
  const habits = await getHabits();
  const updated = habits.filter((h) => h.id !== id);
  await saveHabits(updated);
  return updated;
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
        ? habit.completedDates.filter((d) => d !== today)
        : [...habit.completedDates, today],
    };
  });

  await saveHabits(updated);
  return updated;
}

export async function clearHabits() {
  await AsyncStorage.removeItem(HABIT_KEY);
}


// ---------- completion ----------

export async function markHabitCompleted(id: string) {
  const habits = await getHabits();
  const index = habits.findIndex(h => h.id === id);
  if (index === -1) return habits;

  const habit = habits[index];

  // 🚫 No pending opportunities
  if ((habit.pendingCompletions ?? 0) <= 0) {
    return habits;
  }

  const now = new Date().toISOString();

  habits[index] = {
    ...habit,
    completedCount: (habit.completedCount ?? 0) + 1,
    completedDates: [...habit.completedDates, now],
    pendingCompletions: habit.pendingCompletions - 1,
    lastCompletedAt: Date.now(),
  };

  await saveHabits(habits);

  // ✅ EACH completion matches ONE notification
  const stats = await getHabitStats();
  await saveHabitStats({
    ...stats,
    totalCompletions: stats.totalCompletions + 1,
    completionDates: [...stats.completionDates, now],
  });

  return habits;
}
