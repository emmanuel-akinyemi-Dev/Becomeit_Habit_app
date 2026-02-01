import { AFFIRMATIONS } from "@/constants/afirmations";
import { SilentHours } from "@/store/settingsStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const AFFIRMATION_KEY = "@hourly_affirmation_last";

// ---------------- Helpers ----------------
const isWithinSilentHours = (silent?: SilentHours) => {
  if (!silent?.enabled) return false;

  const now = new Date();
  const [sh, sm] = silent.start.split(":").map(Number);
  const [eh, em] = silent.end.split(":").map(Number);

  const start = new Date();
  start.setHours(sh, sm, 0, 0);

  const end = new Date();
  end.setHours(eh, em, 0, 0);

  // overnight range
  if (end < start) return now >= start || now <= end;

  return now >= start && now <= end;
};

// Calculate next notification time (next hour)
const getNextHour = () => {
  const now = new Date();
  const next = new Date(now);
  next.setHours(now.getHours() + 1, 0, 0, 0);
  return next;
};

// ---------------- Schedule ----------------
export async function scheduleAffirmations(
  intervalHours: number = 1,
  silentHours?: SilentHours,
) {
  if (isWithinSilentHours(silentHours)) {
    console.log("[Affirmations] Skipped due to silent hours");
    return;
  }

  const next = getNextHour();
  const affirmationIndex = next.getHours() % AFFIRMATIONS.length;
  const affirmationText = AFFIRMATIONS[affirmationIndex];

  const notificationContent: Notifications.NotificationContentInput = {
    title: "✨ Read Aloud Affirmation",
    body: affirmationText,
    sound: true,
    data: { hour: next.getHours() },
  };

  let trigger: Notifications.NotificationTriggerInput;

  if (Platform.OS === "android") {
    const seconds = Math.ceil((next.getTime() - new Date().getTime()) / 1000);
    trigger = {
      type: "timeInterval",   
      seconds,
      repeats: true,
    } as any;
  } else {
    trigger = {
      type: "calendar",
      hour: next.getHours(),
      minute: 0,
      repeats: true,
    } as any;
  }

  try {
    const existingId = await AsyncStorage.getItem(AFFIRMATION_KEY);
    if (existingId) {
      await Notifications.cancelScheduledNotificationAsync(existingId);
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: notificationContent,
      trigger,
    });

    await AsyncStorage.setItem(AFFIRMATION_KEY, notificationId);
    console.log(
      `[Affirmations] Scheduled next affirmation for hour ${next.getHours()}: "${affirmationText}"`,
    );
  } catch (e) {
    console.error("[Affirmations] Failed to schedule", e);
  }
}

// ---------------- Cancel All ----------------
export async function cancelAffirmations() {
  const existingId = await AsyncStorage.getItem(AFFIRMATION_KEY);
  if (existingId) {
    await Notifications.cancelScheduledNotificationAsync(existingId);
    await AsyncStorage.removeItem(AFFIRMATION_KEY);
    console.log("[Affirmations] Canceled scheduled notifications");
  }
}
