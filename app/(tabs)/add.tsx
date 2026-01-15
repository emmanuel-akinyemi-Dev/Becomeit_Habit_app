import React, { useState } from "react";
import { Platform, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import { addHabit } from "@/storage/habitStorage";
import { HabitSchedule, RepeatUnit } from "../../models/habit";

const units: RepeatUnit[] = [
  "minutes",
  "hourly",
  "daily",
  "weekly",
  "monthly",
  "yearly",
];

export default function AddHabitScreen() {
  const [title, setTitle] = useState("");
  const [interval, setInterval] = useState("1");
  const [unit, setUnit] = useState<RepeatUnit>("daily");
  const [time, setTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) return;

    // convert Date to "HH:mm"
    const hours = time.getHours().toString().padStart(2, "0");
    const minutes = time.getMinutes().toString().padStart(2, "0");
    const startTime = `${hours}:${minutes}`;

    const schedule: HabitSchedule = {
      interval: Number(interval),
      unit,
      startTime,
    };

    await addHabit({
      title: title.trim(),
      schedule,
    });

    // reset fields
    setTitle("");
    setInterval("1");
    setUnit("daily");
    setTime(new Date());
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>
        Add Habit
      </Text>

      <Text>Title</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="e.g. Drink water"
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 8,
          padding: 10,
          marginBottom: 16,
        }}
      />

      <Text>Interval</Text>
      <TextInput
        value={interval}
        onChangeText={setInterval}
        keyboardType="numeric"
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 8,
          padding: 10,
          marginBottom: 16,
        }}
      />

      <Text>Unit</Text>
      <View
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 8,
          marginBottom: 16,
        }}
      >
        {units.map((u) => (
          <Pressable key={u} onPress={() => setUnit(u)} style={{ padding: 12 }}>
            <Text style={{ color: unit === u ? "blue" : "black" }}>{u}</Text>
          </Pressable>
        ))}
      </View>

      <Text>Start Time</Text>
      <Pressable
        onPress={() => setShowPicker(true)}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 8,
          padding: 12,
          marginBottom: 24,
        }}
      >
        <Text>
          {time.getHours().toString().padStart(2, "0")}:
          {time.getMinutes().toString().padStart(2, "0")}
        </Text>
      </Pressable>

      {showPicker && (
        <DateTimePicker
          value={time}
          mode="time"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(_, selected) => {
            setShowPicker(false);
            if (selected) setTime(selected);
          }}
        />
      )}

      <Pressable
        onPress={handleSave}
        style={{
          backgroundColor: "#111",
          padding: 16,
          borderRadius: 12,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "bold" }}>Add Habit</Text>
      </Pressable>
    </SafeAreaView>
  );
}
