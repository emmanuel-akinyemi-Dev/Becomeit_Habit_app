import { UnitSelector } from "@/components/ui/UnitSelector";
import { HabitSchedule, HabitType, RepeatUnit } from "@/models/habit";
import { scheduleHabitNotification } from "@/notifications/scheduler";
import { useHabitStore } from "@/store/habitStore";
import { useSettingsStore } from "@/store/settingsStore";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import { useState } from "react";
import { Platform, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { XStack } from "tamagui";

export default function AddHabitScreen() { 

  const { addHabit } = useHabitStore();

  const [title, setTitle] = useState("");
  const [habitType, setHabitType] = useState<HabitType>("REPEATING");

  const [mode, setMode] = useState<"startNow" | "scheduleStart">("startNow");
  const [frequency, setFrequency] = useState<RepeatUnit>("minutes");

  // interval options
  const allIntervalOptions = [1, 2, 5, 10, 30, "Manual"] as const;
  const [intervalChoice, setIntervalChoice] =
    useState<(typeof allIntervalOptions)[number]>(1);
  const [intervalManual, setIntervalManual] = useState(1);

  const [time, setTime] = useState(new Date());
  const [tempTime, setTempTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const frequencyOptions: { label: string; value: RepeatUnit }[] = [
    { label: "Minutes", value: "minutes" },
    { label: "Hourly", value: "hourly" },
    { label: "Daily", value: "daily" },
  ];

  // filter interval options based on frequency
  const intervalOptions = frequency === "minutes" ? [1, 2] : allIntervalOptions;

  const handleSave = async () => {
    const interval =
      intervalChoice === "Manual" ? intervalManual : (intervalChoice as number);

    let schedule: HabitSchedule;

    if (mode === "startNow") {
      const now = new Date();
      const startTime = `${now.getHours()}:${now.getMinutes()}`;
      schedule = { interval, unit: frequency, startTime };
    } else {
      const startTime = `${time.getHours()}:${time.getMinutes()}`;
      schedule = { interval, unit: frequency, startTime };
    }

    const habitData = { title, habitType, schedule };
    const newHabit = await addHabit(habitData);
    await scheduleHabitNotification(newHabit);

    router.back();
  };

  const onChangePicker = (_event: any, selectedDate?: Date) => {
    setShowPicker(Platform.OS === "ios"); // keep open on iOS, close on Android
    if (selectedDate) {
      setTempTime(selectedDate);
      setTime(selectedDate);
    }
  };

  const openPicker = () => {
    setTempTime(time);
    setShowPicker(true);
  };

  const cancelPicker = () => {
    setTime(tempTime); // revert to previous time
    setShowPicker(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={{ flex: 1, padding: 20 }}>
        <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 20 }}>
          Add Habit
        </Text>

        <TextInput
          placeholder="Habit title"
          value={title}
          onChangeText={setTitle}
          style={{
            marginBottom: 20,
            fontSize: 16,
            padding: 12,
            borderRadius: 8,
            backgroundColor: "#f0f0f0",
            color: "#000",
          }}
        />

        {/* Mode toggle */}
        <XStack style={{ marginBottom: 20, gap: 10 }}>
          <Pressable
            onPress={() => setMode("startNow")}
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 8,
              backgroundColor: mode === "startNow" ? "#000" : "#ccc",
            }}
          >
            <Text style={{ color: "#fff", textAlign: "center" }}>
              Start Now
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setMode("scheduleStart")}
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 8,
              backgroundColor: mode === "scheduleStart" ? "#000" : "#ccc",
            }}
          >
            <Text style={{ color: "#fff", textAlign: "center" }}>
              Schedule Start
            </Text>
          </Pressable>
        </XStack>

        {/* Scheduled Start Time */}
        {mode === "scheduleStart" && (
          <View style={{ marginBottom: 20 }}>
            <Text style={{ marginBottom: 8, fontWeight: "600", color: "#000" }}>
              Select Start Time
            </Text>

            {/* Display selected time */}
            <TextInput
              value={`${time.getHours().toString().padStart(2, "0")}:${time
                .getMinutes()
                .toString()
                .padStart(2, "0")}`}
              editable={false}
              style={{
                marginBottom: 12,
                padding: 12,
                borderRadius: 8,
                backgroundColor: "#f0f0f0",
                color: "#000",
              }}
            />

            <Pressable
              onPress={openPicker}
              style={{
                padding: 12,
                borderRadius: 8,
                backgroundColor: "#000",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Text style={{ color: "#fff" }}>Pick Time</Text>
            </Pressable>

            {showPicker && (
              <DateTimePicker
                value={time}
                mode="time"
                is24Hour={true}
                display="spinner"
                onChange={onChangePicker}
              />
            )}

            {/* Cancel button */}
            {showPicker && (
              <Pressable
                onPress={cancelPicker}
                style={{
                  padding: 12,
                  borderRadius: 8,
                  backgroundColor: "#ccc",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#000" }}>Cancel</Text>
              </Pressable>
            )}
          </View>
        )}

        {/* Frequency Selector */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ marginBottom: 8, fontWeight: "600", color: "#000" }}>
            Frequency
          </Text>
          <UnitSelector value={frequency} onChange={setFrequency} />
        </View>

        {/* Interval Selector */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ marginBottom: 8, fontWeight: "600", color: "#000" }}>
            Interval
          </Text>
          <XStack style={{ gap: 10, flexWrap: "wrap" }}>
            {(frequency === "minutes" ? [1, 2] : allIntervalOptions).map(
              (opt: any) => (
                <Pressable
                  key={opt.toString()}
                  onPress={() => setIntervalChoice(opt)}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: 8,
                    backgroundColor: intervalChoice === opt ? "#000" : "#ccc",
                    opacity:
                      frequency === "minutes" && opt !== 1 && opt !== 2
                        ? 0.5
                        : 1,
                  }}
                  disabled={frequency === "minutes" && opt !== 1 && opt !== 2}
                >
                  <Text style={{ color: "#fff" }}>{opt}</Text>
                </Pressable>
              ),
            )}
          </XStack>

          {intervalChoice === "Manual" && frequency !== "minutes" && (
            <TextInput
              keyboardType="number-pad"
              value={intervalManual.toString()}
              onChangeText={(t) => setIntervalManual(Number(t))}
              style={{
                marginTop: 12,
                padding: 12,
                borderRadius: 8,
                backgroundColor: "#f0f0f0",
                color: "#000",
              }}
            />
          )}
        </View>

        <Pressable
          onPress={handleSave}
          style={{
            paddingVertical: 14,
            borderRadius: 8,
            backgroundColor: "#000",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Save Habit</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
