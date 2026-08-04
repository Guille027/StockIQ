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
  const color = isUp ? (colorScheme === "dark" ? "#6fae94" : "#3f7d64") : colorScheme === "dark" ? "#c9846a" : "#a85a3f";

  return (
    <View>
      <LineChart.Provider data={data}>
        <View className="flex-row items-baseline gap-2 mb-2">
          <LineChart.PriceText
            style={{ fontFamily: "JetBrainsMono_600SemiBold", fontSize: 28, color: colorScheme === "dark" ? "#f2f1f6" : "#1a1a22" }}
          />
          <LineChart.DatetimeText style={{ fontFamily: "JetBrainsMono_500Medium", fontSize: 12, color: colorScheme === "dark" ? "#8a8998" : "#6b6a72" }} />
        </View>
        <LineChart height={200}>
          <LineChart.Path color={color} width={2} />
          <LineChart.CursorCrosshair color={color} />
        </LineChart>
      </LineChart.Provider>
    </View>
  );
}
