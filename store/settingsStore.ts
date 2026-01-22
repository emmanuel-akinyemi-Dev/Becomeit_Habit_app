import { ThemeColorKey } from "@/constants/themeColors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type Tone = "system" | "bell" | "chime" | "beep";


export interface SilentHours {
  enabled: boolean;
  start: string; // "22:00"
  end: string; // "07:00"
}

interface SettingsState {
  notificationsEnabled: boolean;
  hourlyAffirmationsEnabled: boolean;
  affirmationInterval: number;

  tone: Tone;
  silentHours?: SilentHours;

  themeColor: ThemeColorKey;

  /* actions */
  toggleNotifications: () => void;
  toggleHourlyAffirmations: () => void;

  setAffirmationInterval: (interval: number) => void;
  setTone: (tone: Tone) => void;
  setSilentHours: (hours: SilentHours) => void;
  setThemeColor: (color: ThemeColorKey) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      /* defaults */
      notificationsEnabled: true,
      hourlyAffirmationsEnabled: true,
      affirmationInterval: 1,

      tone: "system",
      silentHours: undefined,

      themeColor: "Royal",

      /* actions */
      toggleNotifications: () =>
        set((s) => ({
          notificationsEnabled: !s.notificationsEnabled,
        })),

      toggleHourlyAffirmations: () =>
        set((s) => ({
          hourlyAffirmationsEnabled: !s.hourlyAffirmationsEnabled,
        })),

      setAffirmationInterval: (interval) =>
        set({ affirmationInterval: interval }),

      setTone: (tone) => set({ tone }),

      setSilentHours: (hours) => set({ silentHours: hours }),

      setThemeColor: (color) => set({ themeColor: color }),
    }),
    {
      name: "settings-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
