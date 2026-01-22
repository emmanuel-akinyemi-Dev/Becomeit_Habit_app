import colors from "@/constants/colors";
import { ThemeColorKey, themeColors } from "@/constants/themeColors";
import { useThemePrimary } from "@/hooks/useThemePrimary";
import { scheduleAffirmations } from "@/notifications/afirmationSchedular";
import { SilentHours, Tone, useSettingsStore } from "@/store/settingsStore";
import { Audio } from "expo-av";
import * as Notifications from "expo-notifications";
import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { XStack } from "tamagui";
import { openFeatureSuggestion } from "@/helpers/openFeatureSuggetion";


const TONES: { key: Tone; label: string; sound?: any }[] = [
  { key: "system", label: "System Default" },
  { key: "bell", label: "Bell", sound: require("@/assets/sounds/bell.wav") },
  { key: "chime", label: "Chime", sound: require("@/assets/sounds/chime.wav") },
  { key: "beep", label: "Beep", sound: require("@/assets/sounds/beep.wav") },
];

export default function SettingsScreen() {
  const primary = useThemePrimary();

  const {
    notificationsEnabled,
    hourlyAffirmationsEnabled,
    toggleHourlyAffirmations,
    setAffirmationInterval,
    affirmationInterval,
    toggleNotifications,
    tone,
    setTone,
    silentHours,
    setSilentHours,
    themeColor,
    setThemeColor,
  } = useSettingsStore();

  const [localTone, setLocalTone] = useState<Tone>(tone);
  const [localNotifications, setLocalNotifications] =
    useState(notificationsEnabled);
  const [localSilent, setLocalSilent] = useState<SilentHours | undefined>(
    silentHours,
  );

  const soundRef = useRef<Audio.Sound | null>(null);

  /* ------------------ SOUND PREVIEW ------------------ */
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
      console.log("[Sound Preview Error]", e);
    }
  };

  const selectTone = async (t: Tone, sound?: any) => {
    setLocalTone(t);
    setTone(t);
    await playSound(sound);
  };

  /* ------------------ SILENT HOURS ------------------ */
  const toggleSilent = (enabled: boolean) => {
    const updated: SilentHours = {
      enabled,
      start: localSilent?.start ?? "22:00",
      end: localSilent?.end ?? "07:00",
    };
    setLocalSilent(updated);
    setSilentHours(updated);
  };

  const updateSilentTime = (start: string, end: string) => {
    const updated: SilentHours = { enabled: true, start, end };
    setLocalSilent(updated);
    setSilentHours(updated);
  };

  /* ------------------ AFFIRMATIONS EFFECT ------------------ */
  useEffect(() => {
    if (hourlyAffirmationsEnabled) {
      scheduleAffirmations(affirmationInterval, silentHours);
    } else {
      Notifications.cancelAllScheduledNotificationsAsync();
    }
  }, [hourlyAffirmationsEnabled, affirmationInterval, silentHours]);

  /* ------------------ CLEANUP ------------------ */
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
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
        <Section title="Notifications" primary={primary}>
          <Row label="Enable notifications">
            <Switch
              value={localNotifications}
              onValueChange={(val) => {
                setLocalNotifications(val);
                toggleNotifications();
              }}
              trackColor={{ false: colors.gray, true: primary }}
              thumbColor={colors.white}
            />
          </Row>
        </Section>

        {/* Hourly Affirmations */}
        <Section title="Hourly Affirmations" primary={primary}>
          <Row label="Enable affirmations">
            <Switch
              value={hourlyAffirmationsEnabled}
              onValueChange={toggleHourlyAffirmations}
              trackColor={{ false: colors.gray, true: primary }}
              thumbColor={colors.white}
            />
          </Row>

          {hourlyAffirmationsEnabled && (
            <XStack gap={10} marginTop={12}>
              {[1, 2, 3].map((h) => (
                <Pressable
                  key={h}
                  onPress={() => setAffirmationInterval}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 16,
                    borderRadius: 20,
                    backgroundColor:
                      affirmationInterval === h ? primary : colors.border,
                  }}
                >
                  <Text
                    style={{
                      color:
                        affirmationInterval === h ? colors.white : colors.text,
                      fontWeight: "600",
                    }}
                  >
                    Every {h}h
                  </Text>
                </Pressable>
              ))}
            </XStack>
          )}
        </Section>

        {/* Theme Color */}
        <Section title="Theme Color" primary={primary}>
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
                    borderColor: active ? primary : colors.border,
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
        </Section>

        {/* Alarm Tone */}
        <Section title="Alarm / Alert Tone" primary={primary}>
          {TONES.map((t) => (
            <Pressable
              key={t.key}
              onPress={() => selectTone(t.key, t.sound)}
              style={{
                padding: 14,
                borderRadius: 12,
                backgroundColor:
                  localTone === t.key ? primary : colors.lightGrayBg,
                marginBottom: 10,
              }}
            >
              <Text
                style={{
                  color: localTone === t.key ? colors.white : colors.text,
                  fontWeight: "600",
                }}
              >
                {t.label}
              </Text>
            </Pressable>
          ))}
        </Section>

        {/* Silent Hours */}
        <Section title="Silent Hours (optional)" primary={primary}>
          <Row label="Enable Silent Hours">
            <Switch
              value={localSilent?.enabled ?? false}
              onValueChange={toggleSilent}
              trackColor={{ false: colors.gray, true: primary }}
              thumbColor={colors.white}
            />
          </Row>

          {localSilent?.enabled && (
            <View style={{ marginTop: 12 }}>
              <TimeButton
                label="Start"
                value={localSilent.start}
                onPress={() => updateSilentTime("22:00", localSilent.end)}
              />
              <TimeButton
                label="End"
                value={localSilent.end}
                onPress={() => updateSilentTime(localSilent.start, "07:00")}
              />
            </View>
          )}
        </Section>

        {/* Suggest a Feature */}
        <View style={{ marginBottom: 32 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: primary,
              marginBottom: 12,
            }}
          >
            Feedback
          </Text>

          <Pressable
            onPress={openFeatureSuggestion}
            style={{
              paddingVertical: 14,
              paddingHorizontal: 16,
              borderRadius: 14,
              backgroundColor: colors.border,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: "600" }}>
              Suggest a Feature
            </Text>

            <Text style={{ fontSize: 18 }}>✉️</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ------------------ SMALL UI HELPERS ------------------ */

function Section({
  title,
  primary,
  children,
}: {
  title: string;
  primary: string;
  children: React.ReactNode;
}) {
  return (
    <View style={{ marginBottom: 32 }}>
      <Text
        style={{
          fontSize: 16,
          fontWeight: "600",
          color: primary,
          marginBottom: 12,
        }}
      >
        {title}
      </Text>
      {children}
    </View>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Text>{label}</Text>
      {children}
    </View>
  );
}

function TimeButton({
  label,
  value,
  onPress,
}: {
  label: string;
  value: string;
  onPress: () => void;
}) {
  return (
    <>
      <Text>{label}</Text>
      <Pressable
        onPress={onPress}
        style={{
          padding: 10,
          backgroundColor: colors.lightGrayBg,
          marginVertical: 6,
          borderRadius: 10,
        }}
      >
        <Text>{value}</Text>
      </Pressable>
    </>
  );
}
