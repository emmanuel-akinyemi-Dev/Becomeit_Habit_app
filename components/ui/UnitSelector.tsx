import { useThemePrimary } from "@/hooks/useThemePrimary";
import { RepeatUnit } from "@/models/habit";
import { Pressable, Text, View } from "react-native";

const UNITS: { label: string; value: RepeatUnit }[] = [
  { label: "Minutes", value: "minutes" },
  { label: "Hourly", value: "hourly" },
  { label: "Daily", value: "daily" },
];

export function UnitSelector({
  value,
  onChange,
}: {
  value: RepeatUnit;
  onChange: (v: RepeatUnit) => void;
}) {
  const primary = useThemePrimary();
  return (
    <View style={{ flexDirection: "row", gap: 8 }}>
      {UNITS.map((u) => {
        const active = value === u.value;

        return (
          <Pressable
            key={u.value}
            onPress={() => onChange(u.value)}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 14,
              borderRadius: 20,
              backgroundColor: active ? primary : "#e0e0e0",
            }}
          >
            <Text style={{ color: active ? "#fff" : "#000" }}>{u.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
