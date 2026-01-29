import { UnitSelector } from "@/components/ui/UnitSelector";
import colors from "@/constants/colors";
import { HABIT_TEMPLATES } from "@/constants/habittemplate";
import { useThemePrimary } from "@/hooks/useThemePrimary";
import { HabitSchedule, HabitType, RepeatUnit } from "@/models/habit";
import { useHabitStore } from "@/store/habitStore";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { XStack } from "tamagui";

// Simple emoji set
const EMOJIS = ["😀", "💧", "📚", "🚶‍♂️", "❤️", "🏋️‍♀️", "📝", "☕", "🎯", "🛌"];

export default function AddHabitScreen() {
  const { addHabit } = useHabitStore();

  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState("");
  const [showEmojiModal, setShowEmojiModal] = useState(false);
  const [habitType, setHabitType] = useState<HabitType>("REPEATING");
  const [mode, setMode] = useState<"startNow" | "scheduleStart">("startNow");
  const [frequency, setFrequency] = useState<RepeatUnit>("minutes");
  const primary = useThemePrimary();
  const allIntervalOptions = [1, 5, 10, 30, "Manual"] as const;
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
    const startTime = `${baseTime.getHours().toString().padStart(2, "0")}:${baseTime.getMinutes().toString().padStart(2, "0")}`;

    const schedule: HabitSchedule = { interval, unit: frequency, startTime };
    await addHabit({ title, habitType, schedule,icon });
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

        {/* ---------- Quick Templates Grid ---------- */}
        <Text style={{ fontWeight: "600", marginVertical: 8, color: primary }}>
          Quick Templates
        </Text>
        <FlatList
          data={HABIT_TEMPLATES}
          keyExtractor={(item) => item.id}
          numColumns={3} // grid layout
          columnWrapperStyle={{
            justifyContent: "space-between",
            marginBottom: 12,
          }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => {
                setTitle(item.title);
                setFrequency(item.unit);
                setIntervalChoice(item.interval as any);
                setHabitType(item.habitType);
              }}
              style={{
                flex: 1,
                marginHorizontal: 4,
                padding: 12,
                borderRadius: 12,
                backgroundColor: colors.white,
                alignItems: "center",
                shadowColor: primary,
                shadowOpacity: 0.1,
                shadowRadius: 4,
              }}
            >
              <Ionicons name={item.icon as any} size={20} color={primary} />
              <Text style={{ fontSize: 12, marginTop: 4, textAlign: "center" }}>
                {item.title}
              </Text>
            </Pressable>
          )}
        />

        {/* ---------- Habit Title + Emoji Picker ---------- */}
        <XStack
          style={{
            borderColor: colors.gray,
            backgroundColor: colors.lightGrayBg,
            borderWidth: 0.5, 
            fontSize: 16,
            borderRadius: 12,
            justifyContent:"space-between",
          }}
        >
          <TextInput
            placeholder="Habit title"
            placeholderTextColor={colors.placeholderText}
            value={icon ? `${icon} ${title}` : title}
            onChangeText={(t) => setTitle(t.replace(icon, "").trim())}
            style={{
              width:"86%",
              fontSize: 16,
              padding: 14, 
              borderColor: "transparent",

              color: colors.text,
            }}
          />
          <Pressable
            onPress={() => setShowEmojiModal(true)}
            style={{
              borderRadius: 20,
              backgroundColor: colors.lightGrayBg,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 25, right:10 }}>{"😀"}</Text>
          </Pressable>
        </XStack>

        {/* ---------- Emoji Modal ---------- */}
        <Modal visible={showEmojiModal} transparent animationType="fade">
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#00000066",
            }}
          >
            <View
              style={{
                backgroundColor: colors.white,
                padding: 20,
                borderRadius: 16,
                width: 250,
              }}
            >
              <Text
                style={{
                  fontWeight: "600",
                  marginBottom: 12,
                  textAlign: "center",
                }}
              >
                Select Emoji
              </Text>
              <FlatList
                data={EMOJIS}
                numColumns={5}
                keyExtractor={(item, idx) => idx.toString()}
                columnWrapperStyle={{
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => {
                      setIcon(item);
                      setShowEmojiModal(false);
                    }}
                    style={{
                      width: 40,
                      height: 40,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ fontSize: 24 }}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
              <Pressable
                onPress={() => setShowEmojiModal(false)}
                style={{ marginTop: 10, padding: 10, alignItems: "center" }}
              >
                <Text style={{ color: primary, fontWeight: "600" }}>
                  Cancel
                </Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        {/* ---------- Mode Toggle ---------- */}
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

        {/* ---------- Time Picker ---------- */}
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

        {/* ---------- Frequency + Interval ---------- */}
        <Text
          style={{ fontWeight: "600", color: colors.black, marginBottom: 10 }}
        >
          Frequency
        </Text>
        <UnitSelector value={frequency} onChange={setFrequency} />

        <Text style={{ marginTop: 20, fontWeight: "600", color: colors.black }}>
          Interval
        </Text>
        <XStack gap={10} flexWrap="wrap" marginTop={10}>
          {allIntervalOptions.map(
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

        {/* ---------- Save Button ---------- */}
        <Animated.View style={animatedStyle}>
          <Pressable
            onPressIn={() => (scale.value = withSpring(0.96))}
            disabled={title.length < 1}
            onPressOut={() => (scale.value = withSpring(1))}
            onPress={handleSave}
            style={{
              marginTop: 30,
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
