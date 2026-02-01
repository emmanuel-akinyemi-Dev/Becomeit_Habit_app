import HabitItem from "@/components/ui/HabitItem";
import MetricsCarousel from "@/components/ui/MetricsCarousel";
import { PaginationDots } from "@/components/ui/pagenationDots";
import { AFFIRMATIONS } from "@/constants/afirmations";
import colors from "@/constants/colors";
import { getWeeklyCompletion } from "@/helpers/streakHelpers";
import { useThemePrimary } from "@/hooks/useThemePrimary";
import { useHabitStore } from "@/store/habitStore";
import React, { useEffect, useMemo } from "react";
import { FlatList, Pressable, ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, XStack, YStack } from "tamagui";

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function HomeScreen() {
  const {
    habits,
    stats,
    loading,
    loadHabits,
    loadStats,
    markHabitCompleted,
    deleteHabit,
    clearAllHabits,
  } = useHabitStore();

  const primary = useThemePrimary();

  useEffect(() => {
    // load habits and stats on mount
    (async () => {
      await loadHabits();
      await loadStats();
    })();
  }, []);

  useEffect(() => {
    // recompute stats whenever habits change
    (async () => {
      await loadStats();
    })();
  }, [habits]);

  const weekProgress = useMemo(
    () => getWeeklyCompletion(stats?.completionDates || []),
    [stats?.completionDates],
  );

  const metrics = useMemo(() => {
    // only active (not mastered) habits count toward accuracy
    const activeHabits = habits.filter((h) => !h.isMastered);

    const totalOpportunities = activeHabits.reduce(
      (sum, h) => sum + (h.notificationCount ?? 0),
      0,
    );

    const totalCompleted = activeHabits.reduce(
      (sum, h) => sum + (h.completedCount ?? h.completedDates.length),
      0,
    );

    const accuracy =
      totalOpportunities === 0
        ? 0
        : Math.min(
            100,
            Math.round((totalCompleted / totalOpportunities) * 100),
          );

    return {
      totalCompleted,
      accuracy,
    };
  }, [habits, stats]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: colors.text }}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
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

      {/* Weekly progress */}
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

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Metrics */}
        <View style={{ height: 150, marginBottom: 10 }}>
          <MetricsCarousel completionDates={stats.completionDates} />
          <View style={{ alignItems: "center", padding: 10 }}>
            <PaginationDots activeIndex={1} activeColor={primary} />
          </View>
        </View>

        {/* Stats cards */}
        <XStack gap={12} marginBottom={16} marginTop={20}>
          <YStack
            flex={1}
            padding={14}
            borderRadius={16}
            backgroundColor={primary}
            alignItems="center"
          >
            <Text style={{ color: colors.white }}>Completed</Text>
            <Text
              style={{ color: colors.white, fontSize: 20, fontWeight: "700" }}
            >
              {metrics.totalCompleted}
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
              style={{ color: colors.white, fontSize: 20, fontWeight: "700" }}
            >
              {metrics.accuracy}%
            </Text>
          </YStack>
        </XStack>

        {/* Affirmation */}
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

        {/* Habit list */}
        {habits.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: 50 }}>
            <Text style={{ color: colors.gray, fontSize: 16 }}>
              No reminder yet, go to add tab to create one
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

        <Pressable
          onPress={async () => await clearAllHabits()}
          style={{ padding: 12, backgroundColor: "red", borderRadius: 8, marginTop: 20 }}
        >
          <Text style={{ color: "white" }}>Clear All Habits</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
