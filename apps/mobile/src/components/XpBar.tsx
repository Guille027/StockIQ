import { useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { cn } from "@/utils/cn";

interface XpBarProps {
  /** XP accumulated inside the current rank. */
  xpIntoRank: number;
  /** XP needed for the next rank (undefined at max rank -> shows full). */
  xpForNextRank?: number;
  /** Track/fill on a dark brand surface (profile rank card) vs. a plain card. */
  variant?: "onBrand" | "onCard";
}

/**
 * XP never jumps straight to its new value: the fill animates with real
 * "effort" (900-1200ms, ease-out-exp) while a parallel counter rolls up in
 * sync, so gaining XP always reads as accumulation, not a state flip.
 */
export function XpBar({ xpIntoRank, xpForNextRank, variant = "onBrand" }: XpBarProps) {
  const pct = useSharedValue(0);
  const target = xpForNextRank ? Math.min(100, (xpIntoRank / xpForNextRank) * 100) : 100;
  const [displayed, setDisplayed] = useState(xpIntoRank);
  const prevRef = useRef(xpIntoRank);

  useEffect(() => {
    pct.value = withTiming(target, { duration: 1100, easing: Easing.out(Easing.exp) });

    const from = prevRef.current;
    const to = xpIntoRank;
    prevRef.current = xpIntoRank;
    if (from === to) return;

    const start = Date.now();
    const duration = 1100;
    const tick = () => {
      const p = Math.min(1, (Date.now() - start) / duration);
      setDisplayed(Math.round(from + (to - from) * p));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [xpIntoRank, target]);

  const style = useAnimatedStyle(() => ({ width: `${pct.value}%` }));

  const track = variant === "onBrand" ? "bg-white/25" : "bg-surface dark:bg-surfaceDark";
  const fill = variant === "onBrand" ? "bg-white" : "bg-primary dark:bg-primaryDark";
  const captionColor = variant === "onBrand" ? "text-white/85" : "text-muted dark:text-mutedDark";

  return (
    <View>
      <View className={cn("h-2.5 rounded-full overflow-hidden", track)}>
        <Animated.View className={cn("h-full rounded-full", fill)} style={style} />
      </View>
      <View className="flex-row justify-between mt-2">
        <Text className={cn("font-mono text-[11.5px]", captionColor)}>
          {displayed}
          {xpForNextRank ? ` / ${xpForNextRank}` : ""}
        </Text>
        <Text className={cn("font-mono text-[11.5px]", captionColor)}>
          {xpForNextRank ? `${xpForNextRank - xpIntoRank} para el siguiente rango` : "Rango máximo"}
        </Text>
      </View>
    </View>
  );
}
