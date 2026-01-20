import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { useEffect } from "react";
import { useColorScheme } from 'react-native';
import { TamaguiProvider } from 'tamagui';
import  config  from '../tamagui.config';
import NotificationProvider from '../providers/notificationProvider'; // <---
// app/_layout.tsx
import { useNotificationPermissions } from "@/notifications/scheduler";
import { useNotificationSoundBridge } from "@/notifications/useNotificationSoundBridge";
import { registerHabitNotificationListener } from "@/notifications/scheduler";


  
export default function RootLayout() {
  const colorScheme = useColorScheme();
    useNotificationPermissions();
  useNotificationSoundBridge();
  useEffect(() => {
    registerHabitNotificationListener();
  }, []);

  return (
    <TamaguiProvider config={config} defaultTheme={colorScheme!} >
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
