import { HabitType, RepeatUnit } from "@/models/habit";

export type HabitTemplate = {
  id: string;
  title: string;
  icon: string;
  unit: RepeatUnit;
  interval: number;
  habitType: HabitType;
};

export const HABIT_TEMPLATES: HabitTemplate[] = [
  {
    id: "water",
    title: "Drink Water",
    icon: "water-outline",
    unit: "hourly",
    interval: 1,
    habitType: "REPEATING",
  },
  {
    id: "read",
    title: "Read 10 mins",
    icon: "book-outline",
    unit: "daily",
    interval: 1,
    habitType: "REPEATING",
  },
  {
    id: "walk",
    title: "Evening Walk",
    icon: "walk-outline",
    unit: "daily",
    interval: 1,
    habitType: "REPEATING",
  },
    {
    id: "Nap",
    title: "Take a Nap",
    icon: "bed-outline",
    unit: "daily",
    interval: 1,
    habitType: "REPEATING",
  },
      {
    id: "Shop",
    title: "Go shoping",
    icon: "cart-outline",
    unit: "daily",
    interval: 1,
    habitType: "REPEATING",
  },
];
