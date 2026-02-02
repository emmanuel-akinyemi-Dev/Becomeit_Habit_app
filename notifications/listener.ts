import * as Notifications from "expo-notifications";
import { useHabitStore } from "@/store/habitStore";

export function registerHabitNotificationListener() {
  return Notifications.addNotificationReceivedListener((notification) => {
    const habitId = notification.request.content.data?.habitId;
    if (!habitId) return;

    const habit = useHabitStore.getState().habits.find(h => h.id === habitId);
    if (!habit) return;             // skip if habit no longer exists
    if (habit.isMastered) return;   // extra safety

    // useHabitStore.getState().markHabitDue(String(habitId));
    useHabitStore.getState().markHabitNotified(String(habitId));
  });
}
