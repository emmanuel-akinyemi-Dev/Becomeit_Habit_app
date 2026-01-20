import colors from "@/constants/colors";
import { ThemeColorKey, themeColors } from "@/constants/themeColors";
import { useThemePrimary } from "@/hooks/useThemePrimary";
import { SilentHours, Tone, useSettingsStore } from "@/store/settingsStore";
import { Audio } from "expo-av";
import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TONES: { key: Tone; label: string; sound?: any }[] = [
  { key: "system", label: "System Default" },
  { key: "bell", label: "Bell", sound: require("@/assets/sounds/bell.wav") },
  { key: "chime", label: "Chime", sound: require("@/assets/sounds/chime.wav") },
  { key: "beep", label: "Beep", sound: require("@/assets/sounds/beep.wav") },
];

export default function SettingsScreen() {
  const {
    notificationsEnabled,
    toggleNotifications,
    tone,
    setTone,
    silentHours,
    setSilentHours,
  } = useSettingsStore();
  const primary = useThemePrimary();
  const { themeColor, setThemeColor } = useSettingsStore();

  const [localTone, setLocalTone] = useState<Tone>(tone);
  const [localNotifications, setLocalNotifications] =
    useState(notificationsEnabled);
  const [localSilent, setLocalSilent] = useState<SilentHours | undefined>(
    silentHours,
  );

  const soundRef = useRef<Audio.Sound | null>(null);

  // Play preview sound
  const playSound = async (soundFile?: any) => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      if (!soundFile) return;

      const { sound } = await Audio.Sound.createAsync(soundFile);
      soundRef.current = sound;
      await sound.playAsync();
    } catch (e) {
      console.log("[Sound] Preview error", e);
    }
  };

  const selectTone = async (tone: Tone, sound?: any) => {
    setLocalTone(tone);
    setTone(tone); // persist
    await playSound(sound);
  };

  // Toggle silent hours
  const toggleSilent = (enabled: boolean) => {
    const updated: SilentHours = { ...localSilent, enabled } as SilentHours;
    setLocalSilent(updated);
    setSilentHours(updated);
  };

  // Update silent start/end
  const updateSilentTime = (start: string, end: string) => {
    const updated: SilentHours = { enabled: true, start, end };
    setLocalSilent(updated);
    setSilentHours(updated);
  };

  useEffect(() => {
    return () => {
      if (soundRef.current) soundRef.current.unloadAsync();
    };
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            color: primary,
            marginBottom: 24,
          }}
        >
          Settings
        </Text>

        {/* Notifications */}
        <View style={{ marginBottom: 32 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: primary,
              marginBottom: 12,
            }}
          >
            Notifications
          </Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text>Enable notifications</Text>
            <Switch
              value={localNotifications}
              onValueChange={(val) => {
                setLocalNotifications(val);
                toggleNotifications();
              }}
              trackColor={{ false: colors.gray, true: primary }}
              thumbColor={localNotifications ? primary : "#f4f3f4"}
              ios_backgroundColor={colors.gray}
            />
          </View>
        </View>
        {/* Theme Color */}
        <View style={{ marginBottom: 32 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              marginBottom: 12,
              color: primary,
            }}
          >
            Theme Color
          </Text>

          <View style={{ flexDirection: "row", gap: 12, flexWrap: "wrap" }}>
            {(Object.keys(themeColors) as ThemeColorKey[]).map((key) => {
              const color = themeColors[key];
              const active = themeColor === key;

              return (
                <Pressable
                  key={key}
                  onPress={() => setThemeColor(key)}
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    backgroundColor: color,
                    borderWidth: active ? 3 : 1,
                    borderColor: active ? primary : colors.gray,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {active && (
                    <Text style={{ color: colors.white, fontWeight: "bold" }}>
                      ✓
                    </Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Alarm Tone */}
        <View style={{ marginBottom: 32 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: primary,
              marginBottom: 12,
            }}
          >
            Alarm / Alert Tone
          </Text>
          {TONES.map((t) => (
            <Pressable
              key={t.key}
              onPress={() => selectTone(t.key, t.sound)}
              style={{
                padding: 14,
                borderRadius: 10,
                backgroundColor: localTone === t.key ? primary : "#eee",
                marginBottom: 10,
              }}
            >
              <Text
                style={{
                  color: localTone === t.key ? "#fff" : "#000",
                  fontWeight: "600",
                }}
              >
                {t.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Silent Hours */}
        <View style={{ marginBottom: 32 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: primary,
              marginBottom: 12,
            }}
          >
            Silent Hours (optional)
          </Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text>Enable Silent Hours</Text>
            <Switch
              value={localSilent?.enabled ?? false}
              onValueChange={toggleSilent}
              trackColor={{ false: colors.gray, true: primary }}
              thumbColor={localSilent ? primary : "#f4f3f4"}
              ios_backgroundColor={colors.gray}
            />
          </View>

          {localSilent?.enabled && (
            <View style={{ marginTop: 12 }}>
              <Text>Start (HH:mm)</Text>
              <Pressable
                onPress={() => {
                  // Example: open time picker here
                  updateSilentTime("22:00", localSilent.end);
                }}
                style={{
                  padding: 10,
                  backgroundColor: "#eee",
                  marginVertical: 6,
                  borderRadius: 8,
                }}
              >
                <Text>{localSilent.start}</Text>
              </Pressable>

              <Text>End (HH:mm)</Text>
              <Pressable
                onPress={() => {
                  updateSilentTime(localSilent.start, "07:00");
                }}
                style={{
                  padding: 10,
                  backgroundColor: "#eee",
                  marginVertical: 6,
                  borderRadius: 8,
                }}
              >
                <Text>{localSilent.end}</Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
