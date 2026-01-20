// notifications/useNotificationSoundBridge.ts
import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import { Audio } from "expo-av";
import { useSettingsStore } from "@/store/settingsStore";

const SOUND_MAP = {
  bell: require("@/assets/sounds/bell.wav"),
  chime: require("@/assets/sounds/chime.wav"),
  beep: require("@/assets/sounds/beep.wav"),
};

export function useNotificationSoundBridge() {
  useEffect(() => {
    let sound: Audio.Sound | null = null;

    const sub = Notifications.addNotificationReceivedListener(
      async () => {
        const { tone } = useSettingsStore.getState();

        console.log("[Notification] received | tone:", tone);

        if (tone === "system") return;

        const soundFile = SOUND_MAP[tone];
        if (!soundFile) return;

        try {
          if (sound) {
            await sound.unloadAsync();
            sound = null;
          }

          const result = await Audio.Sound.createAsync(soundFile);
          sound = result.sound;
          await sound.playAsync();
        } catch (e) {
          console.log("🔊 Sound play error", e);
        }
      },
    );

    return () => {
      sub.remove();
      sound?.unloadAsync();
    };
  }, []);
}
