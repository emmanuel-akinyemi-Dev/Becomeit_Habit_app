import { formatCountdown, getNextActivation } from "@/helpers/habitHelpers";
import { Habit } from "@/models/habit";
import React, { useEffect, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { XStack, YStack } from "tamagui";

interface HabitItemProps {
  habit: Habit;
  toggleHabitInterval: (id: string) => void;
  handleDelete: (id: string) => void;
}

export default function HabitItem({ habit, toggleHabitInterval, handleDelete }: HabitItemProps) {
  if (!habit || !Array.isArray(habit.completedDates)) return null;

  const [nextText, setNextText] = useState("");
  const [buttonActive, setButtonActive] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const lastCompleted = habit.lastCompletedAt ? new Date(habit.lastCompletedAt) : null;
      const lastNotified = habit.lastNotifiedAt ? new Date(habit.lastNotifiedAt) : null;

      const isDue = lastNotified !== null && (!lastCompleted || lastCompleted < lastNotified);
      setButtonActive(isDue);

      const nextActivation = lastCompleted
        ? getNextActivation(habit, lastCompleted)
        : lastNotified
        ? getNextActivation(habit, lastNotified)
        : new Date(0);

      setNextText(isDue ? "" : formatCountdown(nextActivation, now));
    };

    const interval = setInterval(updateTimer, 1000);
    updateTimer();
    return () => clearInterval(interval);
  }, [habit]);

  console.log(
  habit.title,
  "notified:",
  habit.lastNotifiedAt,
  "completed:",
  habit.lastCompletedAt
);

  const scheduleLabel = `Every ${habit.schedule.interval} ${habit.schedule.unit} @ ${habit.schedule.startTime}`;

  const confirmDelete = () => {
    Alert.alert(
      "Mastered Habit",
      `Are you sure you want to mark "${habit.title}" as mastered? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Yes", style: "destructive", onPress: () => handleDelete(habit.id) },
      ]
    );
  };

  return (
    <View style={{ padding: 16, borderRadius: 16, backgroundColor: "#fff", marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, borderWidth: 0.1, shadowRadius: 4, elevation: 2 }}>
      <YStack padding={5} gap={10} justifyContent="center" alignItems="center">
        <YStack width="100%">
          <Text style={{ fontSize: 18, fontWeight: "700", color: "#111" }}>{habit.title}</Text>
          <XStack justifyContent="space-between">
            <Text style={{ fontSize: 12, color: "#666", marginTop: 4 }}>{scheduleLabel}</Text>
            {nextText !== "" && <Text style={{ fontSize: 12, color: "#999", marginTop: 2 }}>Next: {nextText}</Text>}
          </XStack>
        </YStack>

        <XStack width="100%" justifyContent="space-between">
          <Pressable
            onPress={confirmDelete}
            style={{ paddingVertical: 8, paddingHorizontal: 16, borderRadius: 12, backgroundColor: "#ff4d4d", alignItems: "center", justifyContent: "center" }}
          >
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 12 }}>Mastered</Text>
          </Pressable>

          <Pressable
            disabled={!buttonActive}
            onPress={() => toggleHabitInterval(habit.id)}
            style={{
              height: 36,
              width: 56,
              borderRadius: 18,
              backgroundColor: buttonActive ? "#4caf50" : "#ccc",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "bold" }}>✓</Text>
          </Pressable>
        </XStack>
      </YStack>
    </View>
  );
}
