import { Text, View } from "react-native";
import { useColorScheme } from "nativewind";
import { scoreColor } from "@/theme/score-color";

interface ScoreBadgeProps {
  value: number;
  size?: "sm" | "md" | "lg";
  label?: string;
}

const SIZES = {
  sm: { box: 36, font: 13 },
  md: { box: 48, font: 16 },
  lg: { box: 72, font: 24 },
};

export function ScoreBadge({ value, size = "md", label }: ScoreBadgeProps) {
  const { colorScheme } = useColorScheme();
  const color = colorScheme === "dark" ? scoreColor(value).dark : scoreColor(value).light;
  const dims = SIZES[size];

  return (
    <View className="items-center">
      <View
        style={{ width: dims.box, height: dims.box, borderRadius: dims.box / 2, backgroundColor: `${color}22`, borderColor: color, borderWidth: 1.5 }}
        className="items-center justify-center"
      >
        <Text style={{ color, fontSize: dims.font, fontWeight: "700" }}>{Math.round(value)}</Text>
      </View>
      {label ? <Text className="text-muted dark:text-mutedDark text-xs mt-1">{label}</Text> : null}
    </View>
  );
}
