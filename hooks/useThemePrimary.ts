import { themeColors } from "@/constants/themeColors";
import { useSettingsStore } from "@/store/settingsStore";

export function useThemePrimary() {
  const themeColor = useSettingsStore((s) => s.themeColor);
  return themeColors[themeColor];
}