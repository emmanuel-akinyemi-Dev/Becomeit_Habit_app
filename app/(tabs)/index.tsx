import HabitItem from "@/components/ui/HabitItem"; 
import { useHabitStore } from "@/store/habitStore";
import React, { useEffect, useMemo } from "react";
import { Alert, FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { XStack, YStack } from "tamagui"; 

export default function HomeScreen() {
 

  const {
    habits,
    loading,
    loadHabits,
    toggleHabitInterval, 
    deleteHabit
  } = useHabitStore();

 

  useEffect(() => {
    loadHabits();
  }, []);

  // ---------------- Metrics ----------------
  const metrics = useMemo(() => {
    if (!habits || habits.length === 0) {
      return { streak: 0, totalCompleted: 0, successRate: 0 };
    }

    const streaks = habits.map((h) => h.streak ?? 0);
    const totalCompleted = habits.reduce(
      (sum, h) => sum + (Array.isArray(h.completedDates) ? h.completedDates.length : 0),
      0
    );

    // Success rate = clicks vs expected intervals (approx.)
    const successRate = Math.round(
      (habits.filter((h) => Array.isArray(h.completedDates) && h.completedDates.length > 0).length /
        habits.length) *
        100
    );

    return {
      streak: Math.max(0, ...streaks),
      totalCompleted,
      successRate,
    };
  }, [habits]);

  // ---------------- Delete confirmation ----------------
  const handleDeleteConfirm = (id: string) => {
    Alert.alert(
      "Mastered Habit",
      "Are you sure you want to mark this habit as mastered? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Yes", style: "destructive", onPress: () => deleteHabit(id) },
      ]
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "#000" }}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, width: "100%", padding: 20, backgroundColor: "#fff" }}>
      <Text
        style={{
          fontSize: 24,
          fontWeight: "bold",
          color: "#000",
          alignSelf: "center",
        }}
      >
        My Habits
      </Text>

      <XStack gap={12} marginVertical={16} justifyContent="center" width="100%">
        <YStack
          width="30%"
          padding={10}
          backgroundColor="#000"
          borderRadius={12}
          alignItems="center"
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Streak</Text>
          <Text style={{ color: "#fff", fontSize: 20, fontWeight: "bold" }}>
            {metrics.streak}
          </Text>
        </YStack>

        <YStack
          padding={10}
          backgroundColor="#000"
          borderRadius={12}
          alignItems="center"
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Completed</Text>
          <Text style={{ color: "#fff", fontSize: 20, fontWeight: "bold" }}>
            {metrics.totalCompleted}
          </Text>
        </YStack>

        <YStack
          padding={10}
          backgroundColor="#000"
          borderRadius={12}
          alignItems="center"
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Success Rate</Text>
          <Text style={{ color: "#fff", fontSize: 20, fontWeight: "bold" }}>
            {metrics.successRate}%
          </Text>
        </YStack>
      </XStack>

      <FlatList
        data={habits || []}
        keyExtractor={(item) => item.id}
        extraData={habits}
        renderItem={({ item }) =>
          item ? (
            <HabitItem
              habit={item}
              toggleHabitInterval={toggleHabitInterval} // <-- updated prop
              handleDelete={handleDeleteConfirm}
            />
          ) : null
        }
      />
    </SafeAreaView>
  );
}
