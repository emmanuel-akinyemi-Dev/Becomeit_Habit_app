export type FixedCalendarTrigger = {
  type: "calendar";
  repeats: boolean;
  year?: number;
  month?: number;
  day?: number;
  weekday?: number;
  hour?: number;
  minute?: number;
};

export type FixedIntervalTrigger = {
  type: "timeInterval";
  seconds: number;
  repeats: boolean;
};

export type FixedNotificationTrigger =
  | FixedCalendarTrigger
  | FixedIntervalTrigger;
