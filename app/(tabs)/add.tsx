import colors from "@/constants/colors";
import { useThemePrimary } from "@/hooks/useThemePrimary";
import { useHabitStore } from "@/store/habitStore";
import { Habit } from "@/types/habit";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/* ---------- SIMPLE EMOJI SET ---------- */
const EMOJIS = ["😀", "💧", "📚", "🚶‍♂️", "❤️", "🏋️‍♀️", "📝", "☕", "🎯", "🛌"];

export default function AddHabitScreen() {
  const primary = useThemePrimary();
  const { addHabit } = useHabitStore();

  const [title, setTitle] = useState("");
  const [emoji, setEmoji] = useState("");
  const [showEmojiModal, setShowEmojiModal] = useState(false);

  const [time, setTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  /* ---------- SAVE ---------- */
  const handleSave = async () => {
    const habit: Habit = {
      id: crypto.randomUUID(),
      title: emoji ? `${emoji} ${title}` : title,
      hour: time.getHours(),
      minute: time.getMinutes(),
      createdAt: Date.now(),
    };

    await addHabit(habit);
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1, padding: 20 }}>
        {/* ---------- HEADER ---------- */}
        <Text
          style={{
            fontSize: 28,
            fontWeight: "700",
            color: primary,
            marginBottom: 20,
          }}
        >
          Add Habit
        </Text>

        {/* ---------- TITLE + EMOJI ---------- */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.lightGrayBg,
            borderRadius: 12,
            marginBottom: 20,
          }}
        >
          <TextInput
            placeholder="Habit title"
            placeholderTextColor={colors.placeholderText}
            value={title}
            onChangeText={setTitle}
            style={{
              flex: 1,
              padding: 14,
              fontSize: 16,
              color: colors.text,
            }}
          />
          <Pressable
            onPress={() => setShowEmojiModal(true)}
            style={{ paddingHorizontal: 14 }}
          >
            <Text style={{ fontSize: 26 }}>{emoji || "😀"}</Text>
          </Pressable>
        </View>

        {/* ---------- EMOJI MODAL ---------- */}
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
                width: 260,
              }}
            >
              <Text
                style={{
                  fontWeight: "600",
                  textAlign: "center",
                  marginBottom: 12,
                }}
              >
                Choose an emoji
              </Text>
              <FlatList
                data={EMOJIS}
                numColumns={5}
                keyExtractor={(item) => item}
                columnWrapperStyle={{
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => {
                      setEmoji(item);
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
                  </Pressable>
                )}
              />
              <Pressable
                onPress={() => setShowEmojiModal(false)}
                style={{ padding: 10, alignItems: "center" }}
              >
                <Text style={{ color: primary, fontWeight: "600" }}>
                  Cancel
                </Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        {/* ---------- TIME PICKER ---------- */}
        <Text style={{ fontWeight: "600", color: colors.text }}>
          Reminder time
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
            marginBottom: 30,
          }}
        >
          <Text style={{ color: colors.text }}>
            {String(time.getHours()).padStart(2, "0")}:
            {String(time.getMinutes()).padStart(2, "0")}
          </Text>
        </Pressable>

        {showPicker && (
          <DateTimePicker
            value={time}
            mode="time"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(_, date) => {
              setShowPicker(false);
              if (date) setTime(date);
            }}
          />
        )}

        {/* ---------- SAVE ---------- */}
        <Pressable
          disabled={!title}
          onPress={handleSave}
          style={{
            marginTop: "auto",
            paddingVertical: 16,
            borderRadius: 14,
            backgroundColor: title ? primary : colors.border,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: colors.white,
              fontWeight: "700",
              fontSize: 16,
            }}
          >
            Save Habit
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}