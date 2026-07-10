import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";

export default function TabsLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: isDark ? "#5B8DEF" : "#2563EB",
        tabBarInactiveTintColor: isDark ? "#8B93A7" : "#6B7280",
        tabBarStyle: {
          backgroundColor: isDark ? "#0B1120" : "#FFFFFF",
          borderTopColor: isDark ? "#1F2A3F" : "#E5E7EB",
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Inicio", tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} /> }} />
      <Tabs.Screen name="scanner" options={{ title: "Scanner", tabBarIcon: ({ color, size }) => <Ionicons name="search" color={color} size={size} /> }} />
      <Tabs.Screen name="watchlist" options={{ title: "Cartera", tabBarIcon: ({ color, size }) => <Ionicons name="briefcase" color={color} size={size} /> }} />
      <Tabs.Screen name="chat" options={{ title: "Chat IA", tabBarIcon: ({ color, size }) => <Ionicons name="chatbubble-ellipses" color={color} size={size} /> }} />
      <Tabs.Screen name="settings" options={{ title: "Ajustes", tabBarIcon: ({ color, size }) => <Ionicons name="settings" color={color} size={size} /> }} />
    </Tabs>
  );
}
