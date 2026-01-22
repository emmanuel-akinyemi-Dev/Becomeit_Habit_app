import { UnitSelector } from "@/components/ui/UnitSelector";
import colors from "@/constants/colors";
import { HABIT_TEMPLATES } from "@/constants/habittemplate";
import { useThemePrimary } from "@/hooks/useThemePrimary";
import { HabitSchedule, HabitType, RepeatUnit } from "@/models/habit";
import { useHabitStore } from "@/store/habitStore";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import { useState } from "react";
import { Platform, Pressable, Text, TextInput, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { XStack } from "tamagui";

export default function AddHabitScreen() {
  const { addHabit } = useHabitStore();

  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState("");
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

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

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

  const ICONS = [
    "checkmark-circle",
    "water-outline",
    "book-outline",
    "walk-outline",
    "heart-outline",
    "fitness-outline",
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1, padding: 20 }}>
        <Text style={{ fontSize: 28, fontWeight: "bold", color: primary }}>
          Add Habit
        </Text>

        {/* Templates */}
        <Text style={{ fontWeight: "600", marginBottom: 8, color: primary }}>
          Quick templates
        </Text>

        <XStack gap={10} marginBottom={20}>
          {HABIT_TEMPLATES.map((tpl: any) => (
            <Pressable
              key={tpl.id}
              onPress={() => {
                setTitle(tpl.title);
                setFrequency(tpl.unit);
                setIntervalChoice(tpl.interval);
                setHabitType(tpl.habitType);
              }}
              style={{
                padding: 12,
                borderRadius: 12,
                backgroundColor: colors.white,
                alignItems: "center",
                shadowColor: primary,
                shadowOpacity: 0.1,
                shadowRadius: 4,
              }}
            >
              <Ionicons name={tpl.icon as any} size={20} color={primary} />
              <Text style={{ fontSize: 12, marginTop: 4 }}>{tpl.title}</Text>
            </Pressable>
          ))}
        </XStack>

        <TextInput
          placeholder="Habit title"
          placeholderTextColor={colors.placeholderText}
          value={title}
          onChangeText={setTitle}
          style={{
            marginTop: 10,
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
        <Text style={{ fontWeight: "600", marginBottom: 8, color: primary }}>
          Icon
        </Text>

        <XStack gap={12} marginBottom={20}>
          {ICONS.map((ic) => (
            <Pressable
              key={ic}
              onPress={() => setIcon(ic)}
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: icon === ic ? primary : colors.border,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons
                name={ic as any}
                size={22}
                color={icon === ic ? colors.white : colors.gray}
              />
            </Pressable>
          ))}
        </XStack>

        {/* Frequency */}
        <Text
          style={{ fontWeight: "600", color: colors.black, marginBottom: 10 }}
        >
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

        <Animated.View style={animatedStyle}>
          <Pressable
            onPressIn={() => (scale.value = withSpring(0.96))}
            disabled={title.length < 1}
            onPressOut={() => (scale.value = withSpring(1))}
            onPress={handleSave}
            style={{
              marginTop:30,
              paddingVertical: 16,
              borderRadius: 14,
              backgroundColor: primary,
              alignItems: "center",
            }}
          >
            <Text
              style={{ color: colors.white, fontWeight: "700", fontSize: 16 }}
            >
              Save Habit
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
