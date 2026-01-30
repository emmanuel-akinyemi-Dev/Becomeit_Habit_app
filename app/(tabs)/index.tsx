import HabitItem from "@/components/ui/HabitItem";
import MetricsCarousel from "@/components/ui/MetricsCarousel";
import { PaginationDots } from "@/components/ui/pagenationDots";
import { AFFIRMATIONS } from "@/constants/afirmations";
import colors from "@/constants/colors";
import { getWeeklyCompletion } from "@/helpers/streakHelpers";
import { useThemePrimary } from "@/hooks/useThemePrimary";
import { useHabitStore } from "@/store/habitStore";
import React, { useEffect, useMemo } from "react";
import { Alert, FlatList, ScrollView, Text } from "react-native";
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
    toggleHabitInterval,
    deleteHabit,
  } = useHabitStore();

  const primary = useThemePrimary();

  useEffect(() => {
    loadHabits();
    loadStats();
  }, []);

  const weekProgress = useMemo(
    () => getWeeklyCompletion(stats?.completionDates || []),
    [stats?.completionDates],
  );

  const metrics = useMemo(() => {
    if (!stats) return { totalCompleted: 0, successRate: 0 };

    const totalCompleted = stats.totalCompletions;
    const totalOpportunities = stats.totalOpportunities || 1;
    const successRate = Math.round((totalCompleted / totalOpportunities) * 100);

    return { totalCompleted, successRate };
  }, [stats]);

  const handleDeleteConfirm = (id: string) => {
    Alert.alert(
      "Mastered Habit",
      "Are you sure you want to mark this habit as mastered? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Yes", style: "destructive", onPress: () => deleteHabit(id) },
      ],
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: colors.text }}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* ---------- Title ---------- */}
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

      {/* ---------- Weekdays (sticky) ---------- */}
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

      {/* ---------- Scrollable Content ---------- */}
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ---------- Metrics Carousel ---------- */}
        <View style={{ height: 150, marginBottom: 10 }}>
          <MetricsCarousel completionDates={stats?.completionDates} />
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              alignSelf: "center", 
              padding:10
            }}
          >
            <PaginationDots activeIndex={1} activeColor={primary  } />
          </View>
        </View>

        {/* ---------- Metrics Cards ---------- */}
        <XStack gap={12} marginBottom={16} marginTop={20}>
          <YStack
            flex={1}
            padding={14}
            borderRadius={16}
            backgroundColor={primary}
            alignItems="center"
          >
            <Text style={{ color: colors.white, fontWeight: "600" }}>
              Completed
            </Text>
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
            <Text style={{ color: colors.white, fontWeight: "600" }}>
              Success Rate
            </Text>
            <Text
              style={{ color: colors.white, fontSize: 20, fontWeight: "700" }}
            >
              {metrics.successRate}%
            </Text>
          </YStack>
        </XStack>

        {/* ---------- Affirmation ---------- */}
        <View
          style={{
            padding: 16,
            borderRadius: 16,
            backgroundColor: colors.white,
            marginBottom: 16,
            shadowColor: primary,
            shadowOpacity: 0.08,
            shadowRadius: 6,
          }}
        >
          <Text style={{ color: primary, fontWeight: "600", marginBottom: 6 }}>
            Affirmation
          </Text>
          <Text style={{ color: colors.text, fontSize: 14 }}>
            {AFFIRMATIONS[new Date().getHours() % AFFIRMATIONS.length]}
          </Text>
        </View>

        {/* ---------- Habit List ---------- */}
        {!habits || habits.length === 0 ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              paddingVertical: 50,
            }}
          >
            <Text
              style={{ color: colors.gray, fontSize: 16, fontWeight: "600" }}
            >
              No reminder yet, go to add tab to create one
            </Text>
          </View>
        ) : (
          <FlatList
            data={habits}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) =>
              item ? (
                <HabitItem
                  habit={item}
                  toggleHabitInterval={toggleHabitInterval}
                  handleDelete={handleDeleteConfirm}
                />
              ) : null
            }
            scrollEnabled={false} // disable FlatList scroll, use outer ScrollView
            showsVerticalScrollIndicator={false}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
