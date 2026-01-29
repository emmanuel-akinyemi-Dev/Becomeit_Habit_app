import colors from "@/constants/colors";
import { useThemePrimary } from "@/hooks/useThemePrimary";
import React from "react";
import { Text, View } from "tamagui";

interface HourlyData {
  hour: number; // 0–23
  completed: boolean;
}

interface Props {
  data: HourlyData[];
  size?: number; // diameter of the circle
}

export default function HabitChartRadial({ data = [], size = 100 }: Props) {
  const primary = useThemePrimary();

  const radius = size / 2;
  const segmentCount = data.length || 24;
  const angleStep = (2 * Math.PI) / segmentCount;
  const barThickness = 7;

  // ✅ Count active hours
  const activeHours = data.filter((h) => h.completed).length;

  // Highlight if > 13 hours
  const activeColor = activeHours >= 13 ? primary : colors.gray;

  return (
    <View
      width={size}
      height={size + 40}
      alignItems="center"
      justifyContent="center"
    >
      <View style={{position:"absolute", marginBottom:"15"}}> 
        {/* ---------- Active Hours Counter ---------- */}
        <Text
          fontSize={36}
          fontWeight="700"
          color={activeColor} 
        >
          {activeHours}h
        </Text>
      </View>
      {/* ---------- Radial Chart ---------- */}
      <View width={size} height={size} style={{ position: "relative" }}>
        {data.map((item, i) => {
          const angle = i * angleStep - Math.PI / 2; // start top
          const x = radius + Math.cos(angle) * (radius - barThickness);
          const y = radius + Math.sin(angle) * (radius - barThickness);

          return (
            <View
              key={`hour-${i}`}
              style={{
                position: "absolute",
                left: x,
                top: y,
                width: barThickness,
                height: barThickness,
                borderRadius: barThickness / 2,
                backgroundColor: item.completed ? primary : colors.border,
                transform: [
                  { translateX: -barThickness / 2 },
                  { translateY: -barThickness * 2 },
                ],
              }}
            />
          );
        })}
      </View>
    </View>
  );
}
