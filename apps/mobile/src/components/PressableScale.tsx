import { Pressable, type PressableProps } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Physical press feedback for anything "clickable" (lesson cards, chips):
 * scales down instantly on touch, springs back on release -- feedback
 * arrives before navigation does, never waits for it.
 */
export function PressableScale({ style, ...props }: PressableProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      style={[animatedStyle, style as object]}
      onPressIn={(e) => {
        scale.value = withTiming(0.97, { duration: 80 });
        props.onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withSpring(1, { damping: 14, stiffness: 220 });
        props.onPressOut?.(e);
      }}
      {...props}
    />
  );
}
