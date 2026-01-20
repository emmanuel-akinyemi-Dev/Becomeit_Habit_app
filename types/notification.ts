export type FixedCalendarTrigger = {
  type: "calendar";
  repeats: boolean;
  year?: number;    // optional for one-off notifications
  month?: number;   // 0-indexed (0 = January)
  day?: number;     // 1–31
  weekday?: number; // 1 = Sunday, 7 = Saturday
  hour?: number;    // 0–23
  minute?: number;  // 0–59
};

export type FixedIntervalTrigger = {
  type: "timeInterval";
  seconds: number;  // always positive
  repeats: boolean; // true if recurring
};

export type FixedNotificationTrigger =
  | FixedCalendarTrigger
  | FixedIntervalTrigger;
