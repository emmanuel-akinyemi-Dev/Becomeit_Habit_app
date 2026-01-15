import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { View, Text, Pressable, TextInput, ScrollView, Alert } from "react-native";
import { Button, YStack } from "tamagui";
import { useSettingsStore } from "@/store/settingsStore";
import { clearHabits } from "@/storage/habitStorage";
import { Audio } from "expo-av";

const availableTones = ["Default", "Chime", "Bell", "Beep"]; // replace with actual files

export default function SettingsScreen() {
  const { theme, tone, defaultInterval, defaultUnit, setTheme, setTone, setDefaultInterval, setDefaultUnit } =
    useSettingsStore();

  const [previewSound, setPreviewSound] = useState<Audio.Sound | null>(null);

  const handleClearHabits = () => {
    Alert.alert(
      "Confirm",
      "Are you sure you want to delete all habits?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes",
          style: "destructive",
          onPress: async () => {
            await clearHabits();
            Alert.alert("All habits cleared");
          },
        },
      ]
    );
  };

  const playTone = async (toneName: string) => {
    try {
      if (previewSound) {
        await previewSound.stopAsync();
        await previewSound.unloadAsync();
      }

      const sound = new Audio.Sound();
      const uriMap: Record<string, any> = {
        Default: require("../../assets/tones/default.mp3"),
        Chime: require("../../assets/tones/chime.mp3"),
        Bell: require("../../assets/tones/bell.mp3"),
        Beep: require("../../assets/tones/beep.mp3"),
      };

      await sound.loadAsync(uriMap[toneName]);
      await sound.playAsync();
      setPreviewSound(sound);
    } catch (e) {
      console.log("Error playing tone", e);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <YStack style={{ flex: 1, gap: 16 }}>

          <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>Settings</Text>

          {/* Theme toggle */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ marginBottom: 8 }}>Theme</Text>
            <Pressable
              style={{ padding: 8, backgroundColor: "#eee", borderRadius: 8 }}
              onPress={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              <Text>{theme === "light" ? "Switch to Dark" : "Switch to Light"}</Text>
            </Pressable>
          </View>

          {/* Default Interval */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ marginBottom: 8 }}>Default Habit Interval</Text>
            <TextInput
              value={defaultInterval.toString()}
              keyboardType="numeric"
              onChangeText={(val) => {
                const num = Number(val);
                if (!isNaN(num) && num > 0) setDefaultInterval(num);
              }}
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 8,
                padding: 8,
              }}
            />
          </View>

          {/* Default Unit */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ marginBottom: 8 }}>Default Unit</Text>
            {["minutes", "hourly", "daily", "weekly", "monthly", "yearly"].map((u) => (
              <Pressable
                key={u}
                onPress={() => setDefaultUnit(u as any)}
                style={{ padding: 8, backgroundColor: defaultUnit === u ? "#ddd" : "#eee", marginBottom: 4, borderRadius: 8 }}
              >
                <Text>{u}</Text>
              </Pressable>
            ))}
          </View>

          {/* Tone Selector */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ marginBottom: 8 }}>Notification Tone</Text>
            {availableTones.map((t) => (
              <Pressable
                key={t}
                onPress={() => {
                  setTone(t);
                  playTone(t);
                }}
                style={{ padding: 8, backgroundColor: tone === t ? "#ddd" : "#eee", marginBottom: 4, borderRadius: 8 }}
              >
                <Text>{t}</Text>
              </Pressable>
            ))}
          </View>

          {/* Clear Habits */}
          <Button onPress={handleClearHabits} style={{ padding: 16, borderRadius: 8, backgroundColor: "#111" }}>
            <Text style={{ color: "#fff", fontWeight: "bold", textAlign: "center" }}>Clear All Habits</Text>
          </Button>

        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}
