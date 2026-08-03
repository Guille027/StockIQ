import { Text, View } from "react-native";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { cn } from "@/utils/cn";

type IconName = keyof typeof Ionicons.glyphMap;

/**
 * The active tab doesn't just change color: it gains a soft pill behind the
 * icon and a 3px brand bar above it, so it reads in peripheral vision
 * without having to read the label.
 */
function TabIcon({ focused, name, label }: { focused: boolean; name: IconName; label: string }) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const activeColor = isDark ? "#8B89EE" : "#5B5BD6";
  const inactiveColor = isDark ? "#999CB0" : "#6D7086";

  return (
    <View className="items-center justify-center" style={{ width: 56, paddingTop: 10 }}>
      {focused ? <View className="absolute top-0 w-6 h-[3px] rounded-full bg-primary dark:bg-primaryDark" /> : null}
      <View
        className={cn(
          "items-center justify-center rounded-xl",
          focused && "bg-primarySoft dark:bg-primarySoftDark",
        )}
        style={{ width: 44, height: 30 }}
      >
        <Ionicons name={name} size={20} color={focused ? activeColor : inactiveColor} />
      </View>
      <Text
        className="font-mono mt-1"
        style={{ fontSize: 9.5, letterSpacing: 0.3, color: focused ? activeColor : inactiveColor, fontWeight: focused ? "600" : "500" }}
      >
        {label}
      </Text>
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
          backgroundColor: isDark ? "#1C202A" : "#FFFFFF",
          borderTopColor: isDark ? "#2B3040" : "#E7E0CE",
          height: 68,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ tabBarIcon: ({ focused }) => <TabIcon focused={focused} name="school" label="APRENDER" /> }} />
      <Tabs.Screen name="practice" options={{ tabBarIcon: ({ focused }) => <TabIcon focused={focused} name="trending-up" label="PRÁCTICA" /> }} />
      <Tabs.Screen name="explore" options={{ tabBarIcon: ({ focused }) => <TabIcon focused={focused} name="compass" label="EXPLORAR" /> }} />
      <Tabs.Screen name="journal" options={{ tabBarIcon: ({ focused }) => <TabIcon focused={focused} name="book" label="DIARIO" /> }} />
      <Tabs.Screen name="profile" options={{ tabBarIcon: ({ focused }) => <TabIcon focused={focused} name="person-circle" label="PERFIL" /> }} />
    </Tabs>
  );
}
