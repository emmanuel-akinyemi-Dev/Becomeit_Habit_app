import * as Notifications from "expo-notifications";
import { SilentHours } from "@/store/settingsStore";

const AFFIRMATION_ID = "hourly-affirmation";

/* helper */
const isWithinSilentHours = (silent?: SilentHours) => {
  if (!silent?.enabled) return false;

  const now = new Date();
  const [sh, sm] = silent.start.split(":").map(Number);
  const [eh, em] = silent.end.split(":").map(Number);

  const start = new Date();
  start.setHours(sh, sm, 0);

  const end = new Date();
  end.setHours(eh, em, 0);

  // overnight range (e.g. 22:00 → 07:00)
  if (end < start) {
    return now >= start || now <= end;
  }

  return now >= start && now <= end;
};

export async function scheduleAffirmations(
  intervalHours: number,
  silentHours?: SilentHours,
) {
  // cancel previous affirmations
  await Notifications.cancelScheduledNotificationAsync(AFFIRMATION_ID);

  // don’t schedule during silent hours
  if (isWithinSilentHours(silentHours)) {
    console.log("[Affirmations] Skipped due to silent hours");
    return;
  }

  await Notifications.scheduleNotificationAsync({
    identifier: AFFIRMATION_ID,
    content: {
      title: "✨ Affirmation",
      body: "You are focused, consistent, and becoming better every hour.",
      sound: true,
    },
    trigger: {
      type: "timeInterval",
      seconds: intervalHours * 3600,
      repeats: true,
    } as any,
  });

  console.log("[Affirmations] Scheduled every", intervalHours, "hours");
}
