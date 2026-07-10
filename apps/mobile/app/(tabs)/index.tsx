import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useHome } from "@/api/hooks";
import { Card } from "@/components/Card";
import { ScoreBadge } from "@/components/ScoreBadge";
import { SectionHeader } from "@/components/SectionHeader";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";

export default function HomeScreen() {
  const { data, isLoading, isError, refetch } = useHome();

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-backgroundDark" edges={["top"]}>
      {isLoading ? <LoadingState label="Cargando mercado..." /> : null}
      {isError ? <ErrorState message="No se pudo conectar con el servidor. Revisa que la API esté corriendo." onRetry={() => refetch()} /> : null}

      {data ? (
        <ScrollView className="px-4" contentContainerStyle={{ paddingBottom: 32 }}>
          <View className="flex-row items-center justify-between mt-2">
            <Text className="text-2xl font-bold text-ink dark:text-inkDark">StockIQ</Text>
            <View className="flex-row items-center gap-1.5">
              <View className={`w-2 h-2 rounded-full ${data.marketStatus.isOpen ? "bg-positive" : "bg-muted"}`} />
              <Text className="text-muted dark:text-mutedDark text-xs">{data.marketStatus.label}</Text>
            </View>
          </View>
          {data.isMock ? (
            <View className="bg-primary/10 rounded-lg px-3 py-2 mt-3">
              <Text className="text-primary dark:text-primaryDark text-xs">
                Mostrando datos de ejemplo (mock). Configura FINNHUB_API_KEY y ANTHROPIC_API_KEY en el backend para datos e IA reales.
              </Text>
            </View>
          ) : null}

          <Card className="mt-4">
            <Text className="text-ink dark:text-inkDark font-semibold mb-1">{data.dailySummary.headline}</Text>
            <Text className="text-muted dark:text-mutedDark text-sm leading-5">{data.dailySummary.body}</Text>
          </Card>

          <SectionHeader title="Índices" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-3">
              {data.indices.map((idx) => (
                <Card key={idx.symbol} className="w-32">
                  <Text className="text-muted dark:text-mutedDark text-xs">{idx.name}</Text>
                  <Text className="text-ink dark:text-inkDark font-semibold mt-1">{idx.value.toLocaleString()}</Text>
                  <Text className={idx.changePct >= 0 ? "text-positive dark:text-positiveDark text-xs mt-0.5" : "text-negative dark:text-negativeDark text-xs mt-0.5"}>
                    {idx.changePct >= 0 ? "+" : ""}
                    {(idx.changePct * 100).toFixed(2)}%
                  </Text>
                </Card>
              ))}
            </View>
          </ScrollView>

          <SectionHeader title="Mejor puntuación IA" action={{ label: "Ver scanner", onPress: () => router.push("/(tabs)/scanner") }} />
          <View className="gap-2">
            {data.topAiScores.map((item) => (
              <Pressable key={item.ticker} onPress={() => router.push(`/company/${item.ticker}`)}>
                <Card className="flex-row items-center justify-between">
                  <View className="flex-1 pr-3">
                    <Text className="text-ink dark:text-inkDark font-semibold">{item.ticker}</Text>
                    <Text className="text-muted dark:text-mutedDark text-xs" numberOfLines={1}>
                      {item.name} · {item.sector}
                    </Text>
                  </View>
                  <ScoreBadge value={item.globalScore} size="sm" />
                </Card>
              </Pressable>
            ))}
          </View>

          <SectionHeader title="Noticias destacadas" />
          <View className="gap-2">
            {data.topNews.slice(0, 6).map((n) => (
              <Card key={n.id}>
                <View className="flex-row items-center gap-2 mb-1">
                  <View
                    className={
                      n.sentiment === "positive" ? "bg-positive/15 px-2 py-0.5 rounded-full" : n.sentiment === "negative" ? "bg-negative/15 px-2 py-0.5 rounded-full" : "bg-muted/15 px-2 py-0.5 rounded-full"
                    }
                  >
                    <Text
                      className={
                        n.sentiment === "positive" ? "text-positive dark:text-positiveDark text-[10px] font-medium" : n.sentiment === "negative" ? "text-negative dark:text-negativeDark text-[10px] font-medium" : "text-muted dark:text-mutedDark text-[10px] font-medium"
                      }
                    >
                      {n.sentiment === "positive" ? "Positiva" : n.sentiment === "negative" ? "Negativa" : "Neutral"}
                    </Text>
                  </View>
                  <Text className="text-muted dark:text-mutedDark text-[10px]">{n.source}</Text>
                </View>
                <Text className="text-ink dark:text-inkDark text-sm font-medium">{n.headline}</Text>
              </Card>
            ))}
          </View>
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}
