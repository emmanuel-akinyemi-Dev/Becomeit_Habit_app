import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
  return (
    <SafeAreaView       style={{
        flex: 1,
        padding: 20,
        justifyContent: "center",
      }}>
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>Settings</Text>

      <Text style={{ marginTop: 10 }}>
        Notifications, theme, data — coming next.
      </Text>
    </SafeAreaView>
  );
}
