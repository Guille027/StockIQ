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
import { useAppFonts } from "@/theme/fonts";
import { applyDefaultTextFont } from "@/theme/text-defaults";

export default function RootLayout() {
  const { setColorScheme } = useNativewindColorScheme();
  const systemScheme = useSystemColorScheme();
  const [ready, setReady] = useState(false);
  const [fontsLoaded] = useAppFonts();

  useEffect(() => {
    setColorScheme(systemScheme === "dark" ? "dark" : "light");
    setReady(true);
  }, [systemScheme]);

  if (fontsLoaded) applyDefaultTextFont();
  if (!ready || !fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="auto" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen
              name="company/[ticker]"
              options={{ headerShown: true, headerTitle: "", headerBackTitle: "Atrás" }}
            />
            <Stack.Screen
              name="portfolio/[id]"
              options={{ headerShown: true, headerTitle: "", headerBackTitle: "Atrás" }}
            />
            <Stack.Screen name="lesson/[id]" />
            <Stack.Screen name="order/new" options={{ presentation: "modal" }} />
            <Stack.Screen name="journal/[id]" />
            <Stack.Screen
              name="explore"
              options={{ headerShown: true, headerTitle: "Explorar", headerBackTitle: "Atrás" }}
            />
            <Stack.Screen
              name="scanner"
              options={{ headerShown: true, headerTitle: "Screener", headerBackTitle: "Atrás" }}
            />
            <Stack.Screen
              name="settings"
              options={{ headerShown: true, headerTitle: "Ajustes", headerBackTitle: "Atrás" }}
            />
          </Stack>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
