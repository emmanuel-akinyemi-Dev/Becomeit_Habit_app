import { useThemePrimary } from "@/hooks/useThemePrimary";
import { Pressable, Text, View } from "react-native";

export type HabitCategory = "health" | "study" | "fitness";

const CATEGORIES: { label: string; value: HabitCategory }[] = [
  { label: "Health", value: "health" },
  { label: "Study", value: "study" },
  { label: "Fitness", value: "fitness" },
];

export function UnitSelector({
  value,
  onChange,
}: {
  value: HabitCategory;
  onChange: (v: HabitCategory) => void;
}) {
  const primary = useThemePrimary();

  return (
    <View style={{ flexDirection: "row", gap: 8 }}>
      {CATEGORIES.map((c) => {
        const active = value === c.value;

        return (
          <Pressable
            key={c.value}
            onPress={() => onChange(c.value)}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 14,
              borderRadius: 20,
              backgroundColor: active ? primary : "#e0e0e0",
            }}
          >
            <Text style={{ color: active ? "#fff" : "#000" }}>
              {c.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}