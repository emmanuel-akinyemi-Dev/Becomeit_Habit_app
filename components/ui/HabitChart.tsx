import { XStack, YStack, Text } from "tamagui";
import colors from "@/constants/colors";

interface ChartItem {
  label: string;
  value: number;
}

export default function HabitChart({ data }: { data: ChartItem[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <XStack alignItems="flex-end" gap="$2" height={140}>
      {data.map((item, index) => {
        const height = (item.value / max) * 120;

        return (
          <YStack key={index} alignItems="center" width={18}>
            <YStack
              height={height}
              width={12}
              borderRadius="$4"
              backgroundColor="$primary"
            />
            <Text fontSize="$1" marginTop="$1">
              {item.label.slice(8)}
            </Text>
          </YStack>
        );
      })}
    </XStack>
  );
}
