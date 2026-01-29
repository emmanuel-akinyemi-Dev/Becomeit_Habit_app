import colors from "@/constants/colors";
import { useThemePrimary } from "@/hooks/useThemePrimary";
import React from "react";
import { View, Text } from "tamagui";

interface ChartBar {
  label: string;
  value: number;
}

interface Props {
  data: ChartBar[];
  height?: number;
}

export default function HabitChart({ data = [], height = 100 }: Props) {
  const primary = useThemePrimary();
  const max = Math.max(...data.map((d) => d.value), 1);

  const BAR_WIDTH = 10; // slightly wider
  const SLOT_WIDTH = 28; // more room for label

  return (
    <View
      flexDirection="row"
      alignItems="flex-end"  
      paddingVertical={8}
    >
      {data.map((item, index) => {
        const barHeight = (item.value / max) * height;

        return (
          <View
            key={`${item.label}-${index}`}
            width={SLOT_WIDTH}
            alignItems="center"
          >
            {/* Bar */}
            <View
              width={BAR_WIDTH}
              height={barHeight}
              borderRadius={6}
              backgroundColor={item.value > 0 ? primary : colors.border}
            />

            {/* Label below the bar */}
            <Text
              fontSize={12}
              color={colors.text}
              textAlign="center"
              marginTop={4}
              numberOfLines={1}
            >
              {item.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
