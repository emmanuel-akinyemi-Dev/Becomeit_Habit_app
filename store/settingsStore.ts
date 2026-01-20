import { ThemeColorKey } from "@/constants/themeColors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Tone = "system" | "bell" | "chime" | "beep";

export interface SilentHours {
  enabled: boolean;
  start: string; // "22:00"
  end: string; // "07:00"
}

interface SettingsState {
  notificationsEnabled: boolean;
  tone: Tone;
  silentHours?: SilentHours;

  themeColor: ThemeColorKey;
  setThemeColor: (color: ThemeColorKey) => void;

  toggleNotifications: () => void;
  setTone: (tone: Tone) => void;
  setSilentHours: (hours: SilentHours) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      notificationsEnabled: true,
      tone: "system",
      themeColor: "Royal",
      setThemeColor: (color) => set({ themeColor: color }),
      setTone: (tone) => set({ tone }),
      toggleNotifications: () =>
        set((s) => ({ notificationsEnabled: !s.notificationsEnabled })),

      setSilentHours: (silentHours) => set({ silentHours }),
    }),
    {
      name: "settings-storage",
      storage: {
        getItem: async (key) => {
          const value = await AsyncStorage.getItem(key);
          return value ? JSON.parse(value) : null;
        },
        setItem: async (key, value) =>
          AsyncStorage.setItem(key, JSON.stringify(value)),
        removeItem: (key) => AsyncStorage.removeItem(key),
      },
    },
  ),
);
