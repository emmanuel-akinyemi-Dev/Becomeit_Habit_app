import colors from "@/constants/colors";
import { formatCountdown, getNextActivation } from "@/helpers/habitHelpers";
import { useThemePrimary } from "@/hooks/useThemePrimary";
import { Habit } from "@/models/habit";
import { useHabitStore } from "@/store/habitStore";
import React, { useEffect, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { XStack, YStack } from "tamagui";

interface HabitItemProps {
  habit?: Habit;
}

export default function HabitItem({ habit }: HabitItemProps) {
  const primary = useThemePrimary();

  const markHabitCompleted = useHabitStore((state) => state.markHabitCompleted);
  const deleteHabit = useHabitStore((state) => state.deleteHabit);

  // 🔒 Safety guard
  if (!habit || !Array.isArray(habit.completedDates)) {
    return null;
  }

  const [nextText, setNextText] = useState("");

  const isDue = habit.pendingCompletions > 0


  useEffect(() => {
    const tick = () => {
      const now = new Date();

      const reference = habit.lastCompletedAt
        ? new Date(habit.lastCompletedAt)
        : habit.lastNotifiedAt
          ? new Date(habit.lastNotifiedAt)
          : null;

      if (!reference) {
        setNextText("");
        return;
      }

      const next = getNextActivation(habit, reference);
      setNextText(isDue ? "" : formatCountdown(next, now));
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [habit, isDue]);

  const scheduleLabel = `Every ${habit.schedule.interval} ${habit.schedule.unit} @ ${habit.schedule.startTime}`;

  const confirmMastered = () => {
    Alert.alert(
      "Mastered Habit",
      `Are you sure you want to mark "${habit.title}" as mastered? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes",
          style: "destructive",
          onPress: async () => {
            await useHabitStore.getState().deleteHabit(habit.id);
          },
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
        shadowRadius: 5,
        elevation: 7,
      }}
    >
      <YStack gap={10}>
        {/* Title */}
        <YStack>
          <Text style={{ fontSize: 18, fontWeight: "700", color: "#111" }}>
            {habit.icon ? `${habit.icon} ` : ""}
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

        {/* Actions */}
        <XStack justifyContent="space-between">
          {/* Mastered */}
          <Pressable
            onPress={confirmMastered}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 12,
              backgroundColor: "#ff4d4d",
            }}
          >
            <Text
              style={{ color: colors.white, fontWeight: "700", fontSize: 12 }}
            >
              Mastered
            </Text>
          </Pressable>

          {/* Complete */}
          <Pressable
            disabled={!isDue}
            onPress={() => markHabitCompleted(habit.id)}
            style={{
              height: 36,
              width: 56,
              borderRadius: 18,
              backgroundColor: isDue ? primary : colors.gray,
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
