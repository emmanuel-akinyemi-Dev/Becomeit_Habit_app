import { requestPermissions } from "@/services/notificationService";
import { useHabitStore } from "@/store/habitStore";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { useColorScheme } from "react-native";
import { TamaguiProvider } from "tamagui";
import NotificationProvider from "../providers/notificationProvider"; // <---
import config from "../tamagui.config";

export default function RootLayout() {
  const regenerate = useHabitStore((s) => s.regenerate);
  const colorScheme = useColorScheme();
  useEffect(() => {
    requestPermissions();
    regenerate();
  }, []);

  return (
    <TamaguiProvider config={config} defaultTheme={colorScheme!}>
      <NotificationProvider>
        <ThemeProvider value={DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
        </ThemeProvider>
      </NotificationProvider>
    </TamaguiProvider>
  );
}
