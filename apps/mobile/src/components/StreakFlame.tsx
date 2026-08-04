import { useEffect } from "react";
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import { useColorScheme } from "nativewind";

/**
 * The streak flame lives always-on: a slow breathing loop (2.2s, ease-in-out)
 * so the counter feels alive even when nothing else is happening. It never
 * goes fully static -- stillness would read as "the streak stopped mattering".
 */
export function StreakFlame({ size = 20, color: colorOverride }: { size?: number; color?: string }) {
  const { colorScheme } = useColorScheme();
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 1100 }),
        withTiming(1, { duration: 1100 }),
      ),
      -1,
      true,
    );
  }, []);

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }, { rotate: "-1deg" }] }));
  const color = colorOverride ?? (colorScheme === "dark" ? "#E8C77A" : "#B9822F");

  return (
    <Animated.View style={style}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 2C10 6 6 8 6 13a6 6 0 1012 0c0-2-1-3-2-4 .3 2-1 3-2 2 1-3-1-5-2-9z"
          fill={color}
        />
      </Svg>
    </Animated.View>
  );
}
