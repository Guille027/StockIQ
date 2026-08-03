import { useEffect, useMemo } from "react";
import { View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming, Easing } from "react-native-reanimated";

const COLORS = ["#5B5BD6", "#178F72", "#E0930A"];
const PARTICLE_COUNT = 16;

interface Particle {
  color: string;
  dx: number;
  dy: number;
  rotate: number;
  delay: number;
}

/**
 * Short celebration burst for a perfect lesson / first completion -- pure
 * Reanimated (no Lottie: that needs a native module Expo Go can't load).
 * `trigger` is a changing key (e.g. a counter) that replays the burst.
 */
export function Confetti({ trigger }: { trigger: number | boolean }) {
  const particles = useMemo<Particle[]>(
    () =>
      Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        color: COLORS[i % COLORS.length],
        dx: (Math.random() - 0.5) * 220,
        dy: -(70 + Math.random() * 110),
        rotate: Math.random() * 360,
        delay: i * 14,
      })),
    [],
  );

  return (
    <View pointerEvents="none" style={{ position: "absolute", left: "50%", top: 0, width: 1, height: 1 }}>
      {particles.map((p, i) => (
        <ConfettoDot key={i} particle={p} trigger={trigger} />
      ))}
    </View>
  );
}

function ConfettoDot({ particle, trigger }: { particle: Particle; trigger: number | boolean }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;
    progress.value = withDelay(particle.delay, withTiming(1, { duration: 750, easing: Easing.out(Easing.quad) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  const style = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
    transform: [
      { translateX: progress.value * particle.dx },
      { translateY: progress.value * particle.dy },
      { rotate: `${progress.value * particle.rotate}deg` },
    ],
  }));

  return (
    <Animated.View
      style={[
        { position: "absolute", width: 7, height: 7, borderRadius: 2, backgroundColor: particle.color },
        style,
      ]}
    />
  );
}
