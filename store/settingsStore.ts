import { create } from "zustand";

export type RepeatUnit =
  | "minutes"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly";

interface SettingsState {
  theme: "light" | "dark";
  tone: string;
  defaultInterval: number;
  defaultUnit: RepeatUnit;

  setTheme: (theme: "light" | "dark") => void;
  setTone: (tone: string) => void;
  setDefaultInterval: (interval: number) => void;
  setDefaultUnit: (unit: RepeatUnit) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  theme: "light",
  tone: "Default",
  defaultInterval: 1,
  defaultUnit: "daily",

  setTheme: (theme) => set({ theme }),
  setTone: (tone) => set({ tone }),
  setDefaultInterval: (defaultInterval) => set({ defaultInterval }),
  setDefaultUnit: (defaultUnit) => set({ defaultUnit }),
}));
