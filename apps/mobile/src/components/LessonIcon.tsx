import { View } from "react-native";
import Svg, { Path, Rect } from "react-native-svg";
import { useColorScheme } from "nativewind";
import { cn } from "@/utils/cn";

type LessonIconStatus = "completed" | "available" | "locked";

/**
 * Status reads in the silhouette, not just the color: a check for done, a
 * little candle-bar rhythm for available (the app's recurring motif), a
 * lock for what's still out of reach.
 */
export function LessonIcon({ status, size = 40 }: { status: LessonIconStatus; size?: number }) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const indigo = isDark ? "#8B89EE" : "#5B5BD6";
  const teal = isDark ? "#4FCBAD" : "#178F72";
  const muted = isDark ? "#999CB0" : "#6D7086";

  const bg =
    status === "completed" ? "bg-positiveSoft dark:bg-positiveSoftDark" : status === "available" ? "bg-primarySoft dark:bg-primarySoftDark" : "bg-surface dark:bg-surfaceDark";

  return (
    <View
      className={cn("items-center justify-center rounded-xl", bg, status === "locked" && "opacity-70")}
      style={{ width: size, height: size }}
    >
      {status === "completed" ? (
        <Svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none">
          <Path d="M4 12l5 5L20 6" stroke={teal} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      ) : status === "available" ? (
        <Svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none">
          <Rect x="5" y="12" width="3" height="7" rx="1" fill={indigo} />
          <Rect x="10.5" y="7" width="3" height="12" rx="1" fill={indigo} />
          <Rect x="16" y="10" width="3" height="9" rx="1" fill={indigo} />
        </Svg>
      ) : (
        <Svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none">
          <Rect x="5" y="10" width="14" height="10" rx="2" stroke={muted} strokeWidth={1.6} />
          <Path d="M8 10V7a4 4 0 018 0v3" stroke={muted} strokeWidth={1.6} />
        </Svg>
      )}
    </View>
  );
}
