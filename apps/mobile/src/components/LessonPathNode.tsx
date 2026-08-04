import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path, Rect } from "react-native-svg";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useColorScheme } from "nativewind";

export type LessonNodeStatus = "done" | "current" | "available" | "locked";
export type LessonNodeAlign = "flex-start" | "center" | "flex-end";

export interface LevelAccent {
  light: string;
  mid: string;
  dark: string;
  shadow: string;
}

/** Three accents cycling by level number -- teal, indigo, gold. Deliberately
 * theme-independent (a colorful token/badge, not a themed surface). */
export const LEVEL_ACCENTS: LevelAccent[] = [
  { light: "#a9e0c8", mid: "#6fae94", dark: "#2f6b54", shadow: "#0e2e24" },
  { light: "#cabdff", mid: "#8b7cf6", dark: "#6a56d6", shadow: "#241c5c" },
  { light: "#f3d9a0", mid: "#d9a441", dark: "#a97a26", shadow: "#3c2a08" },
];

/** A completed lesson always reads as "done" in the same green, regardless
 * of which level (and therefore which accent) it belongs to -- level color
 * is an identity token for *available* work, not a status color. */
const DONE_ACCENT: LevelAccent = { light: "#a9e0c8", mid: "#5fb98c", dark: "#2f6b54", shadow: "#0e2e24" };

const LOCKED = {
  dark: { ring: "#15161f", bg: "#1e2030", icon: "#4d4c5c" },
  light: { ring: "#e2ded3", bg: "#eeebe2", icon: "#b3b0a3" },
};

/**
 * One node in the Aprender path. Status reads in size, glow and icon, not
 * just color: done = small checked medallion, current = the biggest node
 * with a pulsing ring and an "EMPEZAR" flag (the single "start here" cue,
 * never more than one at a time), available = a flat, smaller version of
 * the same medallion (lessons within an unlocked level are freely
 * orderable, so more than one can be "ready" simultaneously), locked = flat
 * and muted.
 */
export function LessonPathNode({
  status,
  accent,
  title,
  sub,
  align,
  onPress,
  index = 0,
}: {
  status: LessonNodeStatus;
  accent: LevelAccent;
  title: string;
  sub: string;
  align: LessonNodeAlign;
  onPress: () => void;
  /** Position within the path -- staggers the mount-in animation. */
  index?: number;
}) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const locked = isDark ? LOCKED.dark : LOCKED.light;
  const titleColor = status === "locked" ? locked.icon : isDark ? "#f2f1f6" : "#1a1a22";

  return (
    <Animated.View
      entering={FadeInDown.delay(Math.min(index, 8) * 60)
        .duration(420)
        .springify()
        .damping(16)}
      style={{ alignItems: align === "flex-start" ? "flex-start" : align === "flex-end" ? "flex-end" : "center" }}
      className="mb-6"
    >
      {status === "current" ? (
        <View className="bg-primary dark:bg-primaryDark rounded-full px-2.5 py-1 mb-1.5">
          <Text className="font-mono-bold text-white text-[10px] tracking-wide">EMPEZAR</Text>
        </View>
      ) : null}

      <NodeGlyph status={status} accent={accent} locked={locked} onPress={onPress} />

      <View className="items-center mt-2" style={{ maxWidth: 150 }}>
        <Text className="font-sans-semibold text-[13.5px] text-center" style={{ color: titleColor }}>
          {title}
        </Text>
        <Text className="font-mono text-muted dark:text-mutedDark text-[11px] mt-0.5 text-center">{sub}</Text>
      </View>
    </Animated.View>
  );
}

function NodeGlyph({
  status,
  accent,
  locked,
  onPress,
}: {
  status: LessonNodeStatus;
  accent: LevelAccent;
  locked: { ring: string; bg: string; icon: string };
  onPress: () => void;
}) {
  const pulse = useSharedValue(1);
  useEffect(() => {
    if (status !== "current") return;
    pulse.value = withRepeat(withSequence(withTiming(1.08, { duration: 900 }), withTiming(1, { duration: 900 })), -1, true);
  }, [status]);
  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  // Done medallions pop in with a little overshoot -- a small win each time.
  const pop = useSharedValue(status === "done" ? 0 : 1);
  useEffect(() => {
    if (status === "done") pop.value = withSpring(1, { damping: 8, stiffness: 180 });
  }, [status]);
  const popStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));

  const press = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({ transform: [{ scale: press.value }] }));

  if (status === "locked") {
    return (
      <View style={{ width: 52, height: 60 }}>
        <View style={{ position: "absolute", left: 2, top: 8, width: 48, height: 48, borderRadius: 999, backgroundColor: locked.ring }} />
        <View
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 52,
            height: 52,
            borderRadius: 999,
            backgroundColor: locked.bg,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Svg width={17} height={17} viewBox="0 0 24 24" fill="none">
            <Rect x="5" y="10" width="14" height="10" rx="2" stroke={locked.icon} strokeWidth={1.8} />
            <Path d="M8 10V7a4 4 0 018 0v3" stroke={locked.icon} strokeWidth={1.8} />
          </Svg>
        </View>
      </View>
    );
  }

  const big = status === "current";
  const size = big ? 72 : 64;
  const ringSize = big ? 64 : 56;
  const ringOffset = big ? 14 : 12;
  const resolved = status === "done" ? DONE_ACCENT : accent;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        press.value = withTiming(0.94, { duration: 80 });
      }}
      onPressOut={() => {
        press.value = withSpring(1, { damping: 12, stiffness: 220 });
      }}
    >
      <Animated.View style={[{ width: size, height: size + 10 }, pressStyle, big ? pulseStyle : undefined, status === "done" ? popStyle : undefined]}>
        <View
          style={{
            position: "absolute",
            left: (size - ringSize) / 2,
            top: ringOffset,
            width: ringSize,
            height: ringSize,
            borderRadius: 999,
            backgroundColor: resolved.shadow,
          }}
        />
        <LinearGradient
          colors={status === "available" ? [resolved.mid, resolved.mid] : [resolved.light, resolved.mid, resolved.dark]}
          start={{ x: 0.32, y: 0.26 }}
          end={{ x: 0.85, y: 0.9 }}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: size,
            height: size,
            borderRadius: 999,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {status === "done" ? (
            <Svg width={big ? 26 : 24} height={big ? 26 : 24} viewBox="0 0 24 24" fill="none">
              <Path d="M4 12l5 5L20 6" stroke={resolved.shadow} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          ) : (
            <Svg width={big ? 26 : 22} height={big ? 26 : 22} viewBox="0 0 24 24">
              <Path d="M8 5l11 7-11 7z" fill={status === "current" ? "#101019" : resolved.shadow} />
            </Svg>
          )}
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}
