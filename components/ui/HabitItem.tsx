import { Habit, HabitOccurrence } from "@/types/habit";
import { Pressable, Text, View } from "react-native";

type Props = {
  habit: Habit;
  occurrence?: HabitOccurrence;
  now: number;
  onComplete: (occurrenceId: string) => void;
};

export function HabitItem({
  habit,
  occurrence,
  now,
  onComplete,
}: Props) {
  const isWithinWindow =
    !!occurrence &&
    now >= occurrence.windowStart &&
    now <= occurrence.windowEnd;

  const isCompleted = !!occurrence?.completedAt;

  const canComplete = isWithinWindow && !isCompleted;

  return (
    <View
      style={{
        padding: 14,
        borderRadius: 12,
        backgroundColor: "#fff",
        marginBottom: 10,
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: "600" }}>
        {habit.icon ? `${habit.icon} ` : ""}
        {habit.title}
      </Text>

      <Pressable
        disabled={!canComplete}
        onPress={() => {
          if (!occurrence) return;
          onComplete(occurrence.id);
        }}
        style={{
          marginTop: 10,
          paddingVertical: 10,
          borderRadius: 8,
          backgroundColor: canComplete ? "#4CAF50" : "#ccc",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "600" }}>
          {isCompleted
            ? "Completed"
            : canComplete
            ? "Mark as Done"
            : "Not Available"}
        </Text>
      </Pressable>
    </View>
  );
}