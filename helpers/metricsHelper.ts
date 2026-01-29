export type MetricRange = "daily" | "weekly" | "monthly" | "yearly";

export interface MetricsCount {
  [key: string]: number; // key = date string / month / year
}

/**
 * Aggregates completion dates into counts for a given range
 */
export function aggregateCompletions(
  completionDates: string[],
  range: MetricRange,
): MetricsCount {
  const counts: MetricsCount = {};

  completionDates.forEach((iso) => {
    const d = new Date(iso);
    let key: string;

    switch (range) {
      case "daily":
        key = d.toISOString().split("T")[0]; // YYYY-MM-DD
        break;
      case "monthly":
        key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; // YYYY-MM
        break;
      case "yearly":
        key = `${d.getFullYear()}`; // YYYY
        break;
      default:
        key = d.toISOString().split("T")[0];
    }

    counts[key] = (counts[key] || 0) + 1;
  });

  return counts;
}

export function getLastNDays(n: number) {
  const days: string[] = [];

  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]); // YYYY-MM-DD
  }

  return days;
}

export function buildDailyChartData(completionDates: string[]) {
  const counts = aggregateCompletions(completionDates, "daily");
  const days = getLastNDays(15);

  return days.map((day) => ({
    label: day,
    value: counts[day] ?? 0,
  }));
}

export interface HourlyData {
  hour: number; // 0 - 23
  completed: boolean;
}

export function getHourlyCompletion(completionDates: string[]): HourlyData[] {
  const todayStr = new Date().toISOString().split("T")[0];

  const hours: HourlyData[] = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    completed: false,
  }));

  completionDates.forEach((iso) => {
    if (!iso.startsWith(todayStr)) return;
    const hour = new Date(iso).getHours();
    hours[hour].completed = true;
  });

  return hours;
}
