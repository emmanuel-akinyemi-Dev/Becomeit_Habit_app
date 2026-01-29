import { buildDailyChartData, MetricRange, getHourlyCompletion } from "@/helpers/metricsHelper";
import { useThemePrimary } from "@/hooks/useThemePrimary";
import { useHabitStore } from "@/store/habitStore";
import { ScrollView, useWindowDimensions } from "react-native";
import { Text, YStack } from "tamagui";
import HabitChart from "./HabitChart";
import HabitChartRadial from "./HabitChartRadial";

const RANGES: MetricRange[] = ["daily", "weekly", "monthly", "yearly"];

interface Props {
  completionDates: string[];
}

export default function HabitMetricPager({ completionDates }: Props) {
  const { width } = useWindowDimensions();
 
  const { stats } = useHabitStore();
  const primary = useThemePrimary();

  return (
    <ScrollView
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      snapToInterval={width}
      snapToAlignment="start"
      decelerationRate="fast"
    >
      {RANGES.map((range) => (
        <YStack key={range} width={width} backgroundColor="blue">
          {/* INTERNAL padding only */}
          <YStack padding="$4" gap="$3">
            <Text fontSize="$6" fontWeight="700" color={primary}>
              {range.toUpperCase()}
            </Text>

            {range === "daily" && (
              <HabitChartRadial data={getHourlyCompletion(completionDates)} />
            )}

            {range !== "daily" && (
              <HabitChart data={buildDailyChartData(completionDates)} />
            )}
          </YStack>
        </YStack>
      ))}
    </ScrollView>
  );
}
