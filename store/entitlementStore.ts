import { create } from "zustand";
import { persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface EntitlementState {
  adFree: boolean;
  setAdFree: (value: boolean) => void;
}

export const useEntitlementStore = create<EntitlementState>()(
  persist(
    (set) => ({
      adFree: false,
      setAdFree: (adFree) => set({ adFree }),
    }),
    {
      name: "entitlements",
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
