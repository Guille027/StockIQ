import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "nativewind";
import { Card } from "@/components/Card";
import { PressableScale } from "@/components/PressableScale";
import { cn } from "@/utils/cn";

const THEME_OPTIONS = [
  { key: "light", label: "Claro" },
  { key: "dark", label: "Oscuro" },
  { key: "system", label: "Sistema" },
] as const;

const UPCOMING = [
  { icon: "📊", title: "Backtesting", description: "Prueba estrategias personalizadas contra datos históricos." },
  { icon: "🔔", title: "Alertas", description: "Avisos por score, caídas de precio o resultados." },
  { icon: "📅", title: "Calendario", description: "Resultados, dividendos, splits y eventos." },
];

export default function SettingsScreen() {
  const { colorScheme, setColorScheme } = useColorScheme();

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-backgroundDark" edges={[]}>
      <ScrollView className="px-4" contentContainerStyle={{ paddingBottom: 32, paddingTop: 16 }}>
        <Text className="font-sans-bold text-ink dark:text-inkDark mb-2">Apariencia</Text>
        <Card className="flex-row gap-2 mb-4">
          {THEME_OPTIONS.map((opt) => (
            <PressableScale key={opt.key} className="flex-1" onPress={() => setColorScheme(opt.key)}>
              <View className={cn("py-2 rounded-lg items-center", colorScheme === opt.key ? "bg-primary dark:bg-primaryDark" : "bg-surface dark:bg-surfaceDark")}>
                <Text className={colorScheme === opt.key ? "font-sans-semibold text-white text-xs" : "text-ink dark:text-inkDark text-xs"}>{opt.label}</Text>
              </View>
            </PressableScale>
          ))}
        </Card>

        <Text className="font-sans-bold text-ink dark:text-inkDark mb-2">Próximamente</Text>
        <View className="gap-2 mb-6">
          {UPCOMING.map((item) => (
            <Card key={item.title} className="flex-row items-center gap-3">
              <Text className="text-xl">{item.icon}</Text>
              <View className="flex-1">
                <Text className="font-sans-bold text-ink dark:text-inkDark">{item.title}</Text>
                <Text className="text-muted dark:text-mutedDark text-xs mt-0.5">{item.description}</Text>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
