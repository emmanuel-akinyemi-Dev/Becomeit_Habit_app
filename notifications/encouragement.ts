// // notifications/encouragement.ts
// import * as Notifications from "expo-notifications";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// // import { getRandomEncouragement } from "@/helpers/habitHelpers";

// const LAST_APP_OPEN_KEY = "@last_app_open";

// export async function trackAppOpen() {
//   await AsyncStorage.setItem(LAST_APP_OPEN_KEY, Date.now().toString());
//   // Cancel any scheduled encouragements
//   const scheduled = await Notifications.getAllScheduledNotificationsAsync();
//   for (const n of scheduled) {
//     if (n.content.data?.type === "encouragement") {
//       await Notifications.cancelScheduledNotificationAsync(n.identifier);
//     }
//   }
// }

// export async function scheduleInactivityNotifications() {
//   const lastOpenRaw = await AsyncStorage.getItem(LAST_APP_OPEN_KEY);
//   const lastOpen = lastOpenRaw ? Number(lastOpenRaw) : Date.now();
//   const now = Date.now();
//   const diffDays = (now - lastOpen) / (1000 * 60 * 60 * 24);

//   // Schedule for 2 days
//   if (diffDays < 2) {
//     await Notifications.scheduleNotificationAsync({
//       content: {
//         title: "We miss you!",
//         body: getRandomEncouragement(),
//         sound: "default",
//         data: { type: "encouragement" },
//       },
//       trigger: {
//         type: "timeInterval",   // <-- required
//         seconds: 2 * 24 * 3600,
//         repeats: false,
//       },
//     });
//   }

//   // Schedule for 5 days
//   if (diffDays < 5) {
//     await Notifications.scheduleNotificationAsync({
//       content: {
//         title: "Come back!",
//         body: getRandomEncouragement(),
//         sound: "default",
//         data: { type: "encouragement" },
//       },
//       trigger: {
//         type: "timeInterval",   // <-- required
//         seconds: 5 * 24 * 3600,
//         repeats: false,
//       } ,
//     });
//   }
// }

