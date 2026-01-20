Absolutely. Below is a **detailed, developer-friendly README** that documents the system *as it currently works*, aligned with your interval-based logic and without inventing features you didn’t build.

You can copy this directly into `README.md`.

---

# 🧠 Habit Tracker (Interval-Based)

A React Native habit-tracking app built around **interval-based completion**, not daily checkmarks.
Habits reset based on their configured schedule (minutes, hours, days, weeks, etc.), and users can only complete a habit **once per interval**.

This design encourages **true behavioral consistency** rather than superficial daily streaks.

---

## ✨ Core Concepts

### 1. Interval-Based Habits (Not Daily)

Habits are **not tied to calendar days**.

Instead, each habit defines:

* a **repeat unit** (minutes, hourly, daily, weekly, monthly, yearly)
* an **interval** (every X units)
* a **start time**

A habit can only be completed **once per interval window**.

---

### 2. Button Behavior (Very Important)

The “✓” button:

* ✅ Records **one successful completion for the current interval**
* 🔒 Disables immediately after press
* ⏳ Re-enables only when the **next interval begins**
* ❌ Does NOT reset at midnight unless the habit is daily

This avoids fake progress and enforces real consistency.

---

## 📦 Data Models

### Habit

```ts
export interface Habit {
  id: string;
  title: string;
  habitType?: "ONE_TIME" | "REPEATING" | "SCHEDULED";
  schedule: {
    unit: RepeatUnit;
    interval: number;
    startTime: string; // "HH:mm"
  };
  createdAt: number;
  completedDates: string[]; // ISO timestamps
  streak?: number;
  tone?: string;
  icon?: string;
  category?: "Health" | "Productivity" | "Learning" | "Mindfulness" | "Social" | "Other";
}
```

### Key Design Decision

`completedDates` stores **full ISO timestamps**, not dates:

```ts
"2026-01-17T11:53:36.402Z"
```

This is required to:

* detect interval boundaries
* disable buttons correctly
* calculate accurate success rates

---

## 🔁 Habit Lifecycle

### 1. Creation

When a habit is created:

* `completedDates` starts empty
* schedule defines the interval logic
* notifications are scheduled from `startTime`

---

### 2. Completion (Button Press)

When the user presses the habit button:

1. The app checks if the habit is **currently active**
2. If active:

   * current timestamp is added to `completedDates`
   * notifications are rescheduled
3. The button becomes disabled until the next interval

This is handled by:

```ts
toggleHabitInterval(habitId)
```

---

### 3. Interval Locking Logic

A habit is considered **locked** if the user already completed it within the current interval window.

This is calculated using:

* last completion timestamp
* habit interval + unit
* current time

If `now < nextActivation`, the button stays disabled.

---

## ⏱ Scheduling & Timing

### getNextActivation(habit)

Calculates when the habit becomes active again based on:

* last completion time
* interval
* repeat unit

Used for:

* button enabling/disabling
* countdown display
* notification rescheduling

---

### Countdown Display

The UI shows a live countdown such as:

* `Next: 3h 20m`
* `Next: 2 days`
* `Now`

Updated every second via `setInterval`.

---

## 📊 Metrics Explained

### 1. Completed

Total number of interval successes across all habits:

```ts
completedDates.length
```

---

### 2. Streak (Current Logic)

* Represents the **highest streak among all habits**
* Incremented only when interval completions are valid
* Dates must be unique per interval window

> ⚠️ Streak logic is interval-aware, not daily.

---

### 3. Success Rate (Current Logic)

Currently calculated as:

```
habits with ≥1 completion / total habits
```

This will later evolve into:

```
completedIntervals / expectedIntervals
```

…but is intentionally kept simple for now to avoid false precision.

---

## 🔔 Notifications

* Notifications are scheduled based on the habit’s interval
* When a habit is completed:

  * its existing notification is canceled
  * a new one is scheduled for the next interval
* Ensures no duplicate or stale reminders

---

## 🗂 Storage

* All habits are persisted using `AsyncStorage`
* Stored under a single key
* State is restored on app launch

---

## 🧪 Debugging & Logging

Key logs you may see:

```txt
Habit: Make salad
Now: 2026-01-17T11:53:36.402Z
Next Activation: 2026-01-18T11:53:36.402Z
Completed Dates: ["2026-01-17T11:53:36.402Z"]
Button Active? false
```

These logs help confirm:

* correct interval detection
* correct locking behavior
* correct scheduling

---

## 🚫 Known Non-Goals (By Design)

This app intentionally does NOT:

* auto-complete habits
* reset habits daily unless configured
* inflate streaks via multiple taps
* assume habits are daily

---

## 🧭 Mental Model (TL;DR)

> A habit is a **contract with time**, not with dates.

If the user:

* completes the habit → success is recorded
* tries again too early → button is disabled
* waits until next interval → button reactivates

Simple. Honest. Hard to cheat.

---

## 🛠 Future Improvements

* True interval-based success rate
* Visual interval timeline
* Missed-interval detection
* Per-habit streaks
* Analytics view

---
