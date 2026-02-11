import HabitItem from "@/components/ui/HabitItem";
import colors from "@/constants/colors";
import { AFFIRMATIONS } from "@/constants/afirmations";
import { useThemePrimary } from "@/hooks/useThemePrimary";
import { useHabitStore } from "@/store/habitStore";
import React, { useMemo } from "react";
import { FlatList, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { XStack, YStack } from "tamagui";

/* ------------------ CONSTANTS ------------------ */

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/* ------------------ HELPERS ------------------ */

function getWeekProgress(completedDates: number[]) {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + 1);
  startOfWeek.setHours(0, 0, 0, 0);

  return WEEK_DAYS.map((_, index) => {
    const dayStart = new Date(startOfWeek);
    dayStart.setDate(startOfWeek.getDate() + index);

    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    return completedDates.some(
      (d) => d >= dayStart.getTime() && d <= dayEnd.getTime(),
    );
  });
}

/* ------------------ SCREEN ------------------ */

export default function HomeScreen() {
  const primary = useThemePrimary();
  const { habits, occurrences } = useHabitStore();

  /* ---------- DERIVED STATE ---------- */

  const completedOccurrences = useMemo(
    () => occurrences.filter((o) => o.completedAt),
    [occurrences],
  );

  const completedDates = useMemo(
    () => completedOccurrences.map((o) => o.completedAt!) ?? [],
    [completedOccurrences],
  );

  const weekProgress = useMemo(
    () => getWeekProgress(completedDates),
    [completedDates],
  );

  const accuracy = useMemo(() => {
    if (occurrences.length === 0) return 0;
    return Math.round(
      (completedOccurrences.length / occurrences.length) * 100,
    );
  }, [completedOccurrences.length, occurrences.length]);

  /* ------------------ UI ------------------ */

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* ---------- HEADER ---------- */}
        <Text
          style={{
            fontSize: 24,
            fontWeight: "700",
            color: primary,
            alignSelf: "center",
            marginVertical: 12,
          }}
        >
          My Habits
        </Text>

        {/* ---------- WEEKLY PROGRESS ---------- */}
        <XStack
          justifyContent="space-between"
          padding={14}
          borderRadius={18}
          backgroundColor={colors.white}
          marginBottom={16}
        >
          {WEEK_DAYS.map((day, index) => {
            const active = weekProgress[index];
            return (
              <YStack key={day} alignItems="center" gap={6}>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: active ? primary : colors.gray,
                  }}
                >
                  {day}
                </Text>
                <View
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    backgroundColor: active ? primary : colors.border,
                  }}
                />
              </YStack>
            );
          })}
        </XStack>

        {/* ---------- STATS ---------- */}
        <XStack gap={12} marginBottom={16}>
          <YStack
            flex={1}
            padding={14}
            borderRadius={16}
            backgroundColor={primary}
            alignItems="center"
          >
            <Text style={{ color: colors.white }}>Completed</Text>
            <Text
              style={{
                color: colors.white,
                fontSize: 20,
                fontWeight: "700",
              }}
            >
              {completedOccurrences.length}
            </Text>
          </YStack>

          <YStack
            flex={1}
            padding={14}
            borderRadius={16}
            backgroundColor={primary}
            alignItems="center"
          >
            <Text style={{ color: colors.white }}>Accuracy</Text>
            <Text
              style={{
                color: colors.white,
                fontSize: 20,
                fontWeight: "700",
              }}
            >
              {accuracy}%
            </Text>
          </YStack>
        </XStack>

        {/* ---------- AFFIRMATION ---------- */}
        <View
          style={{
            padding: 16,
            borderRadius: 16,
            backgroundColor: colors.white,
            marginBottom: 16,
          }}
        >
          <Text style={{ color: primary, fontWeight: "600", marginBottom: 6 }}>
            Affirmation
          </Text>
          <Text style={{ color: colors.text }}>
            {AFFIRMATIONS[new Date().getHours() % AFFIRMATIONS.length]}
          </Text>
        </View>

        {/* ---------- HABITS ---------- */}
        {habits.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: 50 }}>
            <Text style={{ color: colors.gray, fontSize: 16 }}>
              No habits yet — add one to get started
            </Text>
          </View>
        ) : (
          <FlatList
            data={habits}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <HabitItem habit={item} />}
            scrollEnabled={false}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}