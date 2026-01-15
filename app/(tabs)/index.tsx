// app/index.tsx
import { useEffect } from "react";
import { FlatList, Pressable, Text, View, Alert } from "react-native";
import { useHabitStore } from "@/store/habitStore";

export default function HomeScreen() {
  const { habits, loading, loadHabits, toggleHabitToday, deleteHabit } = useHabitStore();

  useEffect(() => {
    loadHabits();
  }, []);

  const handleDelete = (id: string) => {
    Alert.alert(
      "Delete Habit",
      "Are you sure you want to delete this habit?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteHabit(id) },
      ]
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <Text style={{ textAlign: "center" }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 28, fontWeight: "bold" }}>BecomeIt</Text>

      <FlatList
        data={habits}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ marginTop: 10 }}
        ListEmptyComponent={
          <Text style={{ marginTop: 40, textAlign: "center" }}>No habits yet. Add one.</Text>
        }
        renderItem={({ item }) => {
          const today = new Date().toISOString().split("T")[0];
          const doneToday = item.completedDates.includes(today);
          const label = `Every ${item.schedule.interval} ${item.schedule.unit} @ ${item.schedule.startTime}`;

          return (
            <View
              style={{
                padding: 16,
                borderRadius: 12,
                backgroundColor: "#f1f1f1",
                marginBottom: 12,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: "600" }}>{item.title}</Text>
                  <Text style={{ marginTop: 4, fontSize: 12, opacity: 0.6 }}>{label}</Text>
                </View>

                <Pressable
                  onPress={() => toggleHabitToday(item.id)}
                  style={{
                    height: 28,
                    width: 28,
                    borderRadius: 14,
                    borderWidth: 2,
                    borderColor: "#111",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: doneToday ? "#4caf50" : "transparent",
                    marginRight: 12,
                  }}
                >
                  <Text style={{ fontWeight: "bold", color: doneToday ? "#fff" : "#111" }}>
                    ✓
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => handleDelete(item.id)}
                  style={{
                    backgroundColor: "#ff4d4d",
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 8,
                  }}
                >
                  <Text style={{ color: "#fff", fontWeight: "bold" }}>Delete</Text>
                </Pressable>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}
