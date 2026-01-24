import { useThemePrimary } from "@/hooks/useThemePrimary";
import { Stack } from "expo-router";

export default function SetingsLayout() {

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="upgrade" options={{ headerShown: false }} />
    </Stack>
  )}