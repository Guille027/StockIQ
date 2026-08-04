import { View } from "react-native";
import { Tabs } from "expo-router";
import Svg, { Path, Rect } from "react-native-svg";
import { useColorScheme } from "nativewind";

type IconKind = "candle" | "check-trend" | "person";

/** Colored per its own tab, not a single shared brand color -- matches the
 * Claude Design system (Aprender=indigo, Práctica=amber, Perfil=teal). */
const TAB_ACCENTS: Record<IconKind, { light: string; dark: string }> = {
  candle: { light: "#6a56e0", dark: "#8b7cf6" },
  "check-trend": { light: "#b9822f", dark: "#e8c77a" },
  person: { light: "#3f7d64", dark: "#6fae94" },
};

function TabIconGlyph({ kind, color, size }: { kind: IconKind; color: string; size: number }) {
  if (kind === "candle") {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Rect x="10.2" y="4" width="3.6" height="16" rx="1" fill={color} />
        <Rect x="7" y="8" width="10" height="7" rx="1.2" fill={color} />
      </Svg>
    );
  }
  if (kind === "check-trend") {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M4 17l5-6 4 3 7-9" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M15 5h5v5" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 8.5a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6z" fill={color} />
      <Path d="M5 20c1.4-4.2 4.2-6.2 7-6.2s5.6 2 7 6.2" fill={color} />
    </Svg>
  );
}

/** Active tab: a colored rounded-square behind the icon (not a pill), icon
 * flips to dark ink so it reads on the saturated fill -- each tab keeps its
 * own accent color rather than sharing the app's single primary. */
function TabIcon({ focused, kind }: { focused: boolean; kind: IconKind }) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const accent = isDark ? TAB_ACCENTS[kind].dark : TAB_ACCENTS[kind].light;
  const inactive = isDark ? "#5c5b6c" : "#a19f95";
  const ink = isDark ? "#101019" : "#ffffff";

  return (
    <View
      className="items-center justify-center rounded-xl"
      style={{ width: 48, height: 48, backgroundColor: focused ? accent : "transparent" }}
    >
      <TabIconGlyph kind={kind} color={focused ? ink : inactive} size={22} />
    </View>
  );
}

export default function TabsLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: isDark ? "rgba(16,16,25,0.92)" : "rgba(255,255,255,0.92)",
          borderTopColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(20,20,30,0.10)",
          height: 72,
          paddingTop: 10,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ tabBarIcon: ({ focused }) => <TabIcon focused={focused} kind="candle" /> }} />
      <Tabs.Screen name="practice" options={{ tabBarIcon: ({ focused }) => <TabIcon focused={focused} kind="check-trend" /> }} />
      <Tabs.Screen name="profile" options={{ tabBarIcon: ({ focused }) => <TabIcon focused={focused} kind="person" /> }} />
    </Tabs>
  );
}
