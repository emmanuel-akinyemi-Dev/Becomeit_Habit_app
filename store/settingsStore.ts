// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { create } from "zustand";
// import { persist, PersistStorage, StorageValue } from "zustand/middleware";

// export type RepeatUnit =
//   | "minutes"
//   | "hourly"
//   | "daily"
//   | "weekly"
//   | "monthly"
//   | "yearly";

// export type Tone = "system" | "bell" | "chime" | "beep";

// export interface SilentHours {
//   enabled: boolean;
//   start: string; // "HH:mm"
//   end: string;   // "HH:mm"
// }

// interface SettingsState {
//   theme: "light" | "dark";
//   notificationsEnabled: boolean;
//   tone: Tone;
//   defaultInterval: number;
//   defaultUnit: RepeatUnit;
//   silentHours?: SilentHours;

//   setTheme: (theme: "light" | "dark") => void;
//   toggleNotifications: () => void;
//   setTone: (tone: Tone) => void;
//   setDefaultInterval: (interval: number) => void;
//   setDefaultUnit: (unit: RepeatUnit) => void;
//   setSilentHours: (silentHours?: SilentHours) => void;
// }

// // ---------------- AsyncStorage Adapter ----------------
// const asyncStorageAdapter: PersistStorage<SettingsState> = {
//   getItem: async (name: string): Promise<StorageValue<SettingsState> | null> => {
//     const value = await AsyncStorage.getItem(name);
//     return value ? JSON.parse(value) : null;
//   },
//   setItem: async (name: string, value: StorageValue<SettingsState>): Promise<void> => {
//     await AsyncStorage.setItem(name, JSON.stringify(value));
//   },
//   removeItem: async (name: string): Promise<void> => {
//     await AsyncStorage.removeItem(name);
//   },
// };

// // ---------------- Settings Store ----------------
// export const useSettingsStore = create<SettingsState>()(
//   persist(
//     (set) => ({
//       theme: "light",
//       notificationsEnabled: true,
//       tone: "system",
//       defaultInterval: 1,
//       defaultUnit: "daily",
//       silentHours: { enabled: false, start: "22:00", end: "07:00" },

//       setTheme: (theme) => set({ theme }),
//       toggleNotifications: () =>
//         set((state) => ({ notificationsEnabled: !state.notificationsEnabled })),
//       setTone: (tone) => set({ tone }),
//       setDefaultInterval: (defaultInterval) => set({ defaultInterval }),
//       setDefaultUnit: (defaultUnit) => set({ defaultUnit }),
//       setSilentHours: (silentHours) => set({ silentHours }),
//     }),
//     {
//       name: "settings-storage",
//       storage: asyncStorageAdapter,
//     },
//   ),
// );


// store/settingsStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Tone = "system" | "bell" | "chime" | "beep";

export interface SilentHours {
  enabled: boolean;
  start: string; // "22:00"
  end: string;   // "07:00"
}

export interface SettingsState {
  notificationsEnabled: boolean;
  tone: Tone;
  silentHours?: SilentHours;

  setTone: (tone: Tone) => void;
  toggleNotifications: () => void;
  setSilentHours: (value: SilentHours) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      notificationsEnabled: true,
      tone: "system",

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
