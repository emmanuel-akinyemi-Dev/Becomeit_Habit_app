import * as Notifications from "expo-notifications";
import { useHabitStore } from "@/store/habitStore";

export function registerHabitNotificationListener() {
  // FOREGROUND RECEIVE
  const receiveSub = Notifications.addNotificationReceivedListener(
    (notification) => {
      const habitId = notification.request.content.data?.habitId;
      const notifId = notification.request.identifier;

      if (!habitId || !notifId) return;

      const store = useHabitStore.getState();
      const habit = store.habits.find(h => h.id === habitId);

      if (!habit || habit.isMastered) return;
      if (habit.lastNotificationId === notifId) return;

      store.markHabitNotified(habitId, notifId);
    }
  );

  // USER INTERACTION (tap / tray / lockscreen)
  const responseSub =
    Notifications.addNotificationResponseReceivedListener((response) => {
      const habitId =
        response.notification.request.content.data?.habitId;
      const notifId =
        response.notification.request.identifier;

      if (!habitId || !notifId) return;

      const store = useHabitStore.getState();
      const habit = store.habits.find(h => h.id === habitId);

      if (!habit || habit.isMastered) return;
      if (habit.lastNotificationId === notifId) return;

      store.markHabitNotified(habitId, notifId);
    });

  return {
    remove() {
      receiveSub.remove();
      responseSub.remove();
    },
  };
}
