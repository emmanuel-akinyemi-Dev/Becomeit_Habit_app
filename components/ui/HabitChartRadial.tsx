import React from "react";
import { View } from "tamagui";
import Svg, { Circle, Line } from "react-native-svg";
import { HourlyData } from "@/helpers/metricsHelper";
import colors from "@/constants/colors";

interface Props {
  data: HourlyData[];
  size?: number; // diameter
}

export default function HabitChartRadial({ data, size = 200 }: Props) {
  const center = size / 2;
  const radius = size / 2 - 20;
  const strokeWidth = 10;

  return (
    <View width={size} height={size} alignItems="center" justifyContent="center">
      <Svg width={size} height={size}>
        {data.map((d, i) => {
          const angle = (i / 24) * 2 * Math.PI - Math.PI / 2; // start at top
          const x1 = center + radius * Math.cos(angle);
          const y1 = center + radius * Math.sin(angle);
          const x2 = center + (radius - strokeWidth) * Math.cos(angle);
          const y2 = center + (radius - strokeWidth) * Math.sin(angle);

          return (
            <Line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={d.completed ? colors.primary : colors.border}
              strokeWidth={4}
              strokeLinecap="round"
            />
          );
        })}
        <Circle
          cx={center}
          cy={center}
          r={radius - strokeWidth - 2}
          stroke={colors.border}
          strokeWidth={2}
          fill="none"
        />
      </Svg>
    </View>
  );
}
