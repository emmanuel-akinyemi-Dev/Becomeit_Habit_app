import { Habit } from "@/models/habit";
import { useHabitStore } from "@/store/habitStore";
import { useSettingsStore } from "@/store/settingsStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { useEffect } from "react";
import { Platform } from "react-native";

const NOTIFICATION_KEY_PREFIX = "habit_notification_";

// ---------------- CANCEL ----------------
export async function cancelHabitNotification(habitId: string) {
  const storedId = await AsyncStorage.getItem(
    NOTIFICATION_KEY_PREFIX + habitId,
  );

  if (storedId) {
    await Notifications.cancelScheduledNotificationAsync(storedId);
    await AsyncStorage.removeItem(NOTIFICATION_KEY_PREFIX + habitId);
  }
}

// ---------------- TRIGGER BUILDER ----------------
function buildTrigger(habit: Habit) {
  const { unit, interval, startTime } = habit.schedule;
  const now = new Date();
  const [hour, minute] = startTime.split(":").map(Number);

  // Start from last completion if exists
  let next = habit.lastCompletedAt
    ? new Date(habit.lastCompletedAt)
    : new Date();

  next.setHours(hour, minute, 0, 0);

  // Compute interval in ms
  let intervalMs: number;
  switch (unit) {
    case "minutes":
      intervalMs = interval * 60 * 1000;
      break;
    case "hourly":
      intervalMs = interval * 60 * 60 * 1000;
      break;
    case "daily":
      intervalMs = interval * 24 * 60 * 60 * 1000;
      break;
    case "weekly":
      intervalMs = interval * 7 * 24 * 60 * 60 * 1000;
      break;
    case "monthly":
      intervalMs = interval * 30 * 24 * 60 * 60 * 1000;
      break;
    case "yearly":
      intervalMs = interval * 365 * 24 * 60 * 60 * 1000;
      break;
    default:
      console.warn("[Scheduler] Unknown unit:", unit);
      intervalMs = 24 * 60 * 60 * 1000;
  }

  // Increment until next is in the future
  while (next.getTime() <= now.getTime()) {
    next = new Date(next.getTime() + intervalMs);
  }

  // Android: use timeInterval
  if (Platform.OS === "android") {
    const seconds = Math.ceil((next.getTime() - now.getTime()) / 1000);
    return { type: "timeInterval", seconds, repeats: false };
  }

  // iOS: calendar trigger
  const trigger: any = {
    type: "calendar",
    hour: next.getHours(),
    minute: next.getMinutes(),
    repeats: false,
  };

  if (unit === "weekly") {
    trigger.weekday = next.getDay() + 1; // Sunday = 1
  } else if (unit === "monthly") {
    trigger.day = next.getDate();
  } else if (unit === "yearly") {
    trigger.day = next.getDate();
    trigger.month = next.getMonth() + 1;
  }

  return trigger;
}

// ---------------- SCHEDULE ----------------
export async function scheduleHabitNotification(habit: Habit) {
  const { notificationsEnabled } = useSettingsStore.getState();
  if (!notificationsEnabled) return;

  await cancelHabitNotification(habit.id);

  const trigger = buildTrigger(habit);

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: "TrunkIN",
      body: habit.title,
      data: { habitId: habit.id },
      sound: "default",
    },
    trigger, // safe, never undefined
  });

  await AsyncStorage.setItem(
    NOTIFICATION_KEY_PREFIX + habit.id,
    notificationId,
  );

  console.log("[Scheduler] Scheduled:", habit.title);
  return notificationId;
}

// ---------------- LISTENERS ----------------
export function useHabitNotificationListener() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  return () => {
    const receivedSub = Notifications.addNotificationReceivedListener(
      (notification) => {
        const habitId = notification.request.content.data?.habitId;
        if (!habitId) return;
        useHabitStore.getState().markHabitNotified(habitId as string);
      },
    );

    const responseSub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const habitId = response.notification.request.content.data?.habitId;
        if (!habitId) return;
        useHabitStore.getState().markHabitNotified(habitId as string);
      },
    );

    return () => {
      receivedSub.remove();
      responseSub.remove();
    };
  };
}

export function registerHabitNotificationListener() {
  Notifications.addNotificationReceivedListener((notification) => {
    const habitId = notification.request.content.data?.habitId;
    if (!habitId) return;

    console.log("[Notify Fired]", habitId);
    useHabitStore.getState().markHabitNotified(habitId as any);
  });
}

export function useNotificationPermissions() {
  useEffect(() => {
    (async () => {
      const { status } = await Notifications.getPermissionsAsync();

      if (status !== "granted") {
        await Notifications.requestPermissionsAsync({
          ios: { allowAlert: true, allowSound: true, allowBadge: false },
        });
      }

      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });
    })();
  }, []);
}
