import "../global.css";
import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { useColorScheme as useNativewindColorScheme } from "nativewind";
import { useColorScheme as useSystemColorScheme } from "react-native";
import { queryClient } from "@/api/queryClient";
import { useAuthStore } from "@/auth/store";

export default function RootLayout() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const { setColorScheme } = useNativewindColorScheme();
  const systemScheme = useSystemColorScheme();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setColorScheme(systemScheme === "dark" ? "dark" : "light");
    setReady(true);
  }, [systemScheme]);

  if (!hydrated || !ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="auto" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="company/[ticker]"
              options={{ headerShown: true, headerTitle: "", headerBackTitle: "Atrás" }}
            />
          </Stack>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
