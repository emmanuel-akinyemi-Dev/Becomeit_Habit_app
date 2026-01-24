import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useThemePrimary } from "@/hooks/useThemePrimary";
import colors from "@/constants/colors";

export default function TabsLayout() {
  const primary = useThemePrimary();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: primary,       
        tabBarInactiveTintColor: colors.gray,  
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="add"
        options={{
          title: "Add",
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="add-circle" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      /> 
    </Tabs>
  );
}
