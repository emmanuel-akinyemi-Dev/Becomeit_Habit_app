// app/add.tsx
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { useState } from "react";
import { Alert, Platform, Pressable, Text, TextInput, View } from "react-native";
import { useHabitStore } from "@/store/habitStore";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AddHabitScreen() {
  const { addHabit } = useHabitStore();

  const [title, setTitle] = useState("");
  const [interval, setInterval] = useState("1");
  const [unit, setUnit] = useState<"minutes" | "hourly" | "daily" | "weekly" | "monthly" | "yearly">("daily");
  const [startTime, setStartTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);

  const onChangeTime = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === "ios");
    if (selectedTime) setStartTime(selectedTime);
  };

  const handleAdd = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a habit title");
      return;
    }

    const hours = startTime.getHours().toString().padStart(2, "0");
    const minutes = startTime.getMinutes().toString().padStart(2, "0");
    const startTimeString = `${hours}:${minutes}`;

    const habitData = {
      title: title.trim(),
      schedule: {
        interval: Number(interval),
        unit,
        startTime: startTimeString,
      },
    };

    await addHabit(habitData);
    setTitle("");
    setInterval("1");
    setUnit("daily");
    setStartTime(new Date());
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, padding: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>Add Habit</Text>

        <Text>Title</Text>
        <TextInput value={title} onChangeText={setTitle} placeholder="e.g. Drink water" style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 8, marginBottom: 16 }} />

        <Text>Interval</Text>
        <TextInput value={interval} onChangeText={setInterval} keyboardType="numeric" style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 8, marginBottom: 16 }} />

        <Text>Unit</Text>
        <View style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 8, marginBottom: 16 }}>
          <Picker selectedValue={unit} onValueChange={(val) => setUnit(val)}>
            <Picker.Item label="Minutes" value="minutes" />
            <Picker.Item label="Hourly" value="hourly" />
            <Picker.Item label="Daily" value="daily" />
            <Picker.Item label="Weekly" value="weekly" />
            <Picker.Item label="Monthly" value="monthly" />
            <Picker.Item label="Yearly" value="yearly" />
          </Picker>
        </View>

        <Text>Start Time</Text>
        <Pressable onPress={() => setShowTimePicker(true)} style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12, marginBottom: 24 }}>
          <Text>{startTime.getHours().toString().padStart(2, "0")}:{startTime.getMinutes().toString().padStart(2, "0")}</Text>
        </Pressable>
        {showTimePicker && <DateTimePicker value={startTime} mode="time" is24Hour display="default" onChange={onChangeTime} />}

        <Pressable onPress={handleAdd} style={{ backgroundColor: "#111", padding: 16, borderRadius: 12, alignItems: "center" }}>
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Add Habit</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
