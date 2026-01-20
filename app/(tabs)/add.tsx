import { UnitSelector } from "@/components/ui/UnitSelector";
import colors from "@/constants/colors";
import { useThemePrimary } from "@/hooks/useThemePrimary";
import { HabitSchedule, HabitType, RepeatUnit } from "@/models/habit";
import { useHabitStore } from "@/store/habitStore";
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
  const primary = useThemePrimary();
  const allIntervalOptions = [1, 2, 5, 10, 30, "Manual"] as const;
  const [intervalChoice, setIntervalChoice] =
    useState<(typeof allIntervalOptions)[number]>(1);
  const [intervalManual, setIntervalManual] = useState(1);

  const [time, setTime] = useState(new Date());
  const [tempTime, setTempTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const handleSave = async () => {
    const interval =
      intervalChoice === "Manual" ? intervalManual : (intervalChoice as number);

    const baseTime = mode === "startNow" ? new Date() : time;
    const startTime = `${baseTime
      .getHours()
      .toString()
      .padStart(2, "0")}:${baseTime.getMinutes().toString().padStart(2, "0")}`;

    const schedule: HabitSchedule = {
      interval,
      unit: frequency,
      startTime,
    };

    await addHabit({ title, habitType, schedule });
    router.back();
  };

  const onChangePicker = (_: any, selectedDate?: Date) => {
    setShowPicker(Platform.OS === "ios");
    if (selectedDate) {
      setTempTime(selectedDate);
      setTime(selectedDate);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1, padding: 20 }}>
        <Text style={{ fontSize: 28, fontWeight: "bold", color: primary }}>
          Add Habit
        </Text>

        <TextInput
          placeholder="Habit title"
          placeholderTextColor={colors.placeholderText}
          value={title}
          onChangeText={setTitle}
          style={{
            marginTop: 20,
            fontSize: 16,
            padding: 14,
            borderRadius: 12,
            backgroundColor: colors.lightGrayBg,
            color: colors.text,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        />

        {/* Mode Toggle */}
        <XStack marginVertical={20} gap={10}>
          {["startNow", "scheduleStart"].map((m) => (
            <Pressable
              key={m}
              onPress={() => setMode(m as any)}
              style={{
                flex: 1,
                padding: 12,
                borderRadius: 12,
                backgroundColor: mode === m ? primary : colors.lightGrayBg,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text
                style={{
                  color: mode === m ? colors.white : primary,
                  textAlign: "center",
                  fontWeight: "600",
                }}
              >
                {m === "startNow" ? "Start Now" : "Schedule Start"}
              </Text>
            </Pressable>
          ))}
        </XStack>

        {/* Time Picker */}
        {mode === "scheduleStart" && (
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontWeight: "600", color: colors.text }}>
              Start Time
            </Text>

            <Pressable
              onPress={() => setShowPicker(true)}
              style={{
                marginTop: 10,
                padding: 14,
                borderRadius: 12,
                backgroundColor: colors.lightGrayBg,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text style={{ color: colors.text }}>
                {time.getHours().toString().padStart(2, "0")}:
                {time.getMinutes().toString().padStart(2, "0")}
              </Text>
            </Pressable>

            {showPicker && (
              <DateTimePicker
                value={time}
                mode="time"
                display="spinner"
                onChange={onChangePicker}
              />
            )}
          </View>
        )}

        {/* Frequency */}
        <Text style={{ fontWeight: "600", color: colors.black, marginBottom:10 }}>
          Frequency
        </Text>
        <UnitSelector value={frequency} onChange={setFrequency} />

        {/* Interval */}
        <Text style={{ marginTop: 20, fontWeight: "600", color: colors.black }}>
          Interval
        </Text>

        <XStack gap={10} flexWrap="wrap" marginTop={10}>
          {(frequency === "minutes" ? [1, 2] : allIntervalOptions).map(
            (opt) => (
              <Pressable
                key={opt.toString()}
                onPress={() => setIntervalChoice(opt as any)}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 14,
                  borderRadius: 10,
                  backgroundColor:
                    intervalChoice === opt ? primary : colors.lightGrayBg,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text
                  style={{
                    color: intervalChoice === opt ? colors.white : primary,
                  }}
                >
                  {opt}
                </Text>
              </Pressable>
            ),
          )}
        </XStack>

        {intervalChoice === "Manual" && (
          <TextInput
            keyboardType="number-pad"
            value={intervalManual.toString()}
            onChangeText={(t) => setIntervalManual(Number(t))}
            style={{
              marginTop: 12,
              padding: 14,
              borderRadius: 12,
              backgroundColor: colors.lightGrayBg,
              borderWidth: 1,
              borderColor: colors.border,
              color: colors.text,
            }}
          />
        )}

        <Pressable
          onPress={handleSave}
          disabled={title.length < 1}
          style={{
            marginTop: 30,
            paddingVertical: 16,
            borderRadius: 14,
            backgroundColor: primary,
            alignItems: "center",
          }}
        >
          <Text style={{ color: colors.white, fontWeight: "700" }}>
            Save Habit
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
