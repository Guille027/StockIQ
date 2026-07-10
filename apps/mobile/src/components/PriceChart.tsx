import { Text, View } from "react-native";
import { LineChart } from "react-native-wagmi-charts";
import { useColorScheme } from "nativewind";
import type { PriceBar } from "@/api/types";

export function PriceChart({ bars }: { bars: PriceBar[] }) {
  const { colorScheme } = useColorScheme();
  if (bars.length < 2) {
    return (
      <View className="h-48 items-center justify-center">
        <Text className="text-muted dark:text-mutedDark">Sin datos de precio suficientes.</Text>
      </View>
    );
  }

  const data = bars.map((b) => ({ timestamp: new Date(b.t).getTime(), value: b.close }));
  const isUp = bars[bars.length - 1]!.close >= bars[0]!.close;
  const color = isUp ? (colorScheme === "dark" ? "#34D399" : "#16A34A") : colorScheme === "dark" ? "#F87171" : "#DC2626";

  return (
    <View>
      <LineChart.Provider data={data}>
        <View className="flex-row items-baseline gap-2 mb-2">
          <LineChart.PriceText
            style={{ fontSize: 28, fontWeight: "700", color: colorScheme === "dark" ? "#F1F5F9" : "#0F172A" }}
          />
          <LineChart.DatetimeText style={{ fontSize: 12, color: colorScheme === "dark" ? "#8B93A7" : "#6B7280" }} />
        </View>
        <LineChart height={200}>
          <LineChart.Path color={color} width={2} />
          <LineChart.CursorCrosshair color={color} />
        </LineChart>
      </LineChart.Provider>
    </View>
  );
}
