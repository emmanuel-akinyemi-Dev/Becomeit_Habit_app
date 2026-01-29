import React from "react";
import { useWindowDimensions } from "react-native";
import { View } from "tamagui";
import HabitMetricPager from "./HabitmetricPager";

interface Props {
  completionDates: string[];
}

export default function MetricsCarousel({ completionDates }: Props) {
  const { width } = useWindowDimensions();

  return (
    <View width={width} height={"100%"}>
      <HabitMetricPager completionDates={completionDates ?? []} />
    </View> 
  );
}
