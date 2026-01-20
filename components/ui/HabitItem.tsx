import colors from "@/constants/colors";
import { formatCountdown, getNextActivation } from "@/helpers/habitHelpers";
import { useThemePrimary } from "@/hooks/useThemePrimary";
import { Habit } from "@/models/habit";
import React, { useEffect, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { XStack, YStack } from "tamagui";

interface HabitItemProps {
  habit?: Habit; //  MUST be optional
  toggleHabitInterval: (id: string) => void;
  handleDelete: (id: string) => void;
}

export default function HabitItem({
  habit,
  toggleHabitInterval,
  handleDelete,
}: HabitItemProps) {
  //  Absolute safety guard (do not remove)
  if (!habit || !Array.isArray(habit.completedDates)) return null;

  const [nextText, setNextText] = useState("");
  const [buttonActive, setButtonActive] = useState(false);
  const primary = useThemePrimary();
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();

      const lastCompleted = habit.lastCompletedAt
        ? new Date(habit.lastCompletedAt)
        : null;

      const lastNotified = habit.lastNotifiedAt
        ? new Date(habit.lastNotifiedAt)
        : null;

      //  Button is active ONLY when notification fired and not yet completed
      const isDue =
        lastNotified !== null &&
        (!lastCompleted || lastCompleted < lastNotified);

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
    habit.lastCompletedAt,
  );

  const scheduleLabel = `Every ${habit.schedule.interval} ${habit.schedule.unit} @ ${habit.schedule.startTime}`;

  const confirmDelete = () => {
    Alert.alert(
      "Mastered Habit",
      `Are you sure you want to mark "${habit.title}" as mastered? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes",
          style: "destructive",
          onPress: () => handleDelete(habit.id),
        },
      ],
    );
  };

  return (
    <View
      style={{
        padding: 16,
        borderRadius: 16,
        backgroundColor: colors.white,
        marginBottom: 12,
        shadowColor: primary,
        shadowOffset: { width: 1, height: 3 },
        shadowOpacity: 1,
        borderWidth: 0.1,
        shadowRadius: 5,
        elevation: 7,
      }}
    >
      <YStack padding={5} gap={10} justifyContent="center" alignItems="center">
        <YStack width="100%">
          <Text style={{ fontSize: 18, fontWeight: "700", color: "#111" }}>
            {habit.title}
          </Text>

          <XStack justifyContent="space-between">
            <Text style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
              {scheduleLabel}
            </Text>

            {nextText !== "" && (
              <Text style={{ fontSize: 12, color: colors.gray, marginTop: 2 }}>
                Next: {nextText}
              </Text>
            )}
          </XStack>
        </YStack>

        <XStack width="100%" justifyContent="space-between">
          {/* Mastered */}
          <Pressable
            onPress={confirmDelete}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 12,
              backgroundColor: "#ff4d4d",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: colors.white, fontWeight: "700", fontSize: 12 }}>
              Mastered
            </Text>
          </Pressable>

          {/* Interval completion button */}
          <Pressable
            disabled={!buttonActive}
            onPress={() => toggleHabitInterval(habit.id)}
            style={{
              height: 36,
              width: 56,
              borderRadius: 18,
              backgroundColor: buttonActive ? primary : colors.gray,  
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "bold" }}>✓</Text>
          </Pressable>
        </XStack>
      </YStack>
    </View>
  );
}
