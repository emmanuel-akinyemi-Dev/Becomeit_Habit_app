import { View } from "react-native";

type PaginationDotsProps = {
  total?: number;
  activeIndex?: number;
  size?: number;
  spacing?: number;
  activeColor?: string;
  inactiveColor?: string;
};

export function PaginationDots({
  total = 2,
  activeIndex = 0,
  size = 8,
  spacing = 6,
  activeColor = "#000",
  inactiveColor = "#ccc",
}: PaginationDotsProps) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      {Array.from({ length: total }).map((_, index) => {
        const isActive = index + 1 === activeIndex;

        return (
          <View
            key={index}
            style={{
              width: size,
              height: size,
              borderRadius: size / 2,
              marginHorizontal: spacing / 2,
              backgroundColor: isActive ? activeColor : inactiveColor,
            }}
          />
        );
      })}
    </View>
  );
}
