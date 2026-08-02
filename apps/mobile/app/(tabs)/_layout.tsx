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
        tabBarActiveTintColor: isDark ? "#818CF8" : "#6366F1",
        tabBarInactiveTintColor: isDark ? "#98A0AA" : "#77716A",
        tabBarStyle: {
          backgroundColor: isDark ? "#101418" : "#FFFFFF",
          borderTopColor: isDark ? "#2A313A" : "#E7E5E0",
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Aprender", tabBarIcon: ({ color, size }) => <Ionicons name="school" color={color} size={size} /> }} />
      <Tabs.Screen name="practice" options={{ title: "Práctica", tabBarIcon: ({ color, size }) => <Ionicons name="trending-up" color={color} size={size} /> }} />
      <Tabs.Screen name="explore" options={{ title: "Explorar", tabBarIcon: ({ color, size }) => <Ionicons name="compass" color={color} size={size} /> }} />
      <Tabs.Screen name="journal" options={{ title: "Diario", tabBarIcon: ({ color, size }) => <Ionicons name="book" color={color} size={size} /> }} />
      <Tabs.Screen name="profile" options={{ title: "Perfil", tabBarIcon: ({ color, size }) => <Ionicons name="person-circle" color={color} size={size} /> }} />
    </Tabs>
  );
}
