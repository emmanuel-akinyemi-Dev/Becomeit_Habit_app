import {
  buildDailyChartData,
  buildMonthlyChartData,
  buildWeeklyChartData,
  getHourlyCompletion,
  MetricView,
} from "@/helpers/metricsHelper";
import { useThemePrimary } from "@/hooks/useThemePrimary";
import { ScrollView, useWindowDimensions } from "react-native";
import { Text, YStack } from "tamagui";
import HabitChart from "./HabitChart";
import HabitChartRadial from "./HabitChartRadial";

const VIEWS: MetricView[] = ["today", "daily", "weekly", "monthly"];

interface Props {
  completionDates: string[];
}

export default function HabitMetricPager({ completionDates = [] }: Props) {
  const { width } = useWindowDimensions();
  const primary = useThemePrimary();

  return (
    <ScrollView
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      snapToInterval={width}
      decelerationRate="fast"
      contentContainerStyle={{
        width: width * VIEWS.length,
        height: "100%",
      }}
    >
      {VIEWS.map((view) => (
        <YStack key={view} width={width} paddingHorizontal="$4">
          <Text
            fontSize="$4"
            fontWeight="600"
            textAlign="center"
            justifyContent="center"
            color={primary}
            left={-16}
          >
            {view.toUpperCase() + " " + "METRICS"}
          </Text>

          {view === "today" && (
            <YStack left={-16} alignItems="center" justifyContent="center">
              <HabitChartRadial
                data={getHourlyCompletion(completionDates || [])}

              />
            </YStack>
          )}

          {view === "daily" && (
            <YStack left={-16} alignItems="center" justifyContent="center">
              <HabitChart data={buildDailyChartData(completionDates || [])} />
            </YStack>
          )}

          {view === "weekly" && (
            <YStack left={-16} right={20} alignItems="center" justifyContent="center">
              <HabitChart data={buildWeeklyChartData(completionDates || [])} />
            </YStack>
          )}

          {view === "monthly" && (
            <YStack left={-16} alignItems="center" justifyContent="center">
              <HabitChart data={buildMonthlyChartData(completionDates || [])} />
            </YStack>
          )}
        </YStack>
      ))}
    </ScrollView>
  );
}
