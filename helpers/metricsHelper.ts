// ---------------- TYPES ----------------

export type MetricRange = "daily" | "weekly" | "monthly";
export type MetricView = "today" | MetricRange;

export interface HourlyData {
  hour: number; // 0–23
  completed: boolean;
}

export interface ChartBar {
  label: string;
  value: number;
}

// ---------------- DATE HELPERS ----------------

function startOfDay(d = new Date()) {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  return date;
}

function endOfDay(d = new Date()) {
  const date = new Date(d);
  date.setHours(23, 59, 59, 999);
  return date;
}

function startOfWeek(d = new Date()) {
  const date = new Date(d);
  const day = (date.getDay() + 6) % 7; // Monday = 0
  date.setDate(date.getDate() - day);
  date.setHours(0, 0, 0, 0);
  return date;
}

function endOfWeek(d = new Date()) {
  const date = startOfWeek(d);
  date.setDate(date.getDate() + 6);
  date.setHours(23, 59, 59, 999);
  return date;
}

function startOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

// ---------------- TODAY (HOURLY) ----------------

export function getHourlyCompletion(
  completionDates: string[] = [],
): HourlyData[] {
  const todayStart = startOfDay();
  const todayEnd = endOfDay();

  const hours = Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    completed: false,
  }));

  completionDates.forEach((iso) => {
    const d = new Date(iso);
    if (d >= todayStart && d <= todayEnd) {
      hours[d.getHours()].completed = true;
    }
  });

  return hours;
}

// ---------------- DAILY (MON–SUN) ----------------

export function buildDailyChartData(
  completionDates: string[] = [],
): ChartBar[] {
  const start = startOfWeek();
  const end = endOfWeek();

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const counts = Array(7).fill(0);

  completionDates.forEach((iso) => {
    const d = new Date(iso);
    if (d >= start && d <= end) {
      const index = (d.getDay() + 6) % 7;
      counts[index]++;
    }
  });

  return days.map((label, i) => ({
    label,
    value: counts[i],
  }));
}

// ---------------- WEEKLY (WEEKS IN MONTH) ----------------

export function buildWeeklyChartData(
  completionDates: string[],
): ChartBar[] {
  const start = startOfMonth();
  const end = endOfMonth();

  const firstWeekStart = startOfWeek(start);
  const weekCounts: number[] = [];

  completionDates.forEach((iso) => {
    const d = new Date(iso);
    if (d < start || d > end) return;

    const diffDays =
      Math.floor(
        (startOfDay(d).getTime() -
          startOfDay(firstWeekStart).getTime()) /
          (1000 * 60 * 60 * 24),
      );

    const weekIndex = Math.max(0, Math.floor(diffDays / 7));
    weekCounts[weekIndex] = (weekCounts[weekIndex] ?? 0) + 1;
  });

  // force 4–5 weeks only
  const weeksInMonth = Math.min(
    5,
    Math.max(4, Math.ceil((end.getDate() + start.getDay()) / 7)),
  );

  return Array.from({ length: weeksInMonth }, (_, i) => ({
    label: `${i + 1}`,
    value: weekCounts[i] ?? 0,
  }));
}


// ---------------- MONTHLY (JAN–DEC) ----------------

export function buildMonthlyChartData(
  completionDates: string[] = [],
): ChartBar[] {
  const year = new Date().getFullYear();

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const counts = Array(12).fill(0);

  completionDates.forEach((iso) => {
    const d = new Date(iso);
    if (d.getFullYear() === year) {
      counts[d.getMonth()]++;
    }
  });

  return months.map((label, i) => ({
    label,
    value: counts[i],
  }));
}

// ---------------- UTILS ----------------

export function isCompletedToday(timestamp: string) {
  const d = new Date(timestamp);
  const today = new Date();
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );
}
