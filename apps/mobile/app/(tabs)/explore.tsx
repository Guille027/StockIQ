import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useHome, useTickerSearch } from "@/api/hooks";
import { Card } from "@/components/Card";
import { SectionHeader } from "@/components/SectionHeader";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { cn } from "@/utils/cn";

/**
 * Explorar: análisis tools for practicing what you learn. Market overview,
 * company search, screener and news -- deliberately NO "best picks" list.
 */
export default function ExploreScreen() {
  const { data, isLoading, isError, refetch } = useHome();
  const [search, setSearch] = useState("");
  const { data: searchResults } = useTickerSearch(search);

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-backgroundDark" edges={["top"]}>
      {isLoading ? <LoadingState label="Cargando mercado..." /> : null}
      {isError ? <ErrorState message="No se pudo conectar con el servidor. Revisa que la API esté corriendo." onRetry={() => refetch()} /> : null}

      {data ? (
        <ScrollView className="px-4" contentContainerStyle={{ paddingBottom: 32 }} keyboardShouldPersistTaps="handled">
          <View className="flex-row items-center justify-between mt-2">
            <Text className="font-display text-2xl text-ink dark:text-inkDark">Explorar</Text>
            <View className="flex-row items-center gap-1.5">
              <View className={`w-2 h-2 rounded-full ${data.marketStatus.isOpen ? "bg-positive" : "bg-muted"}`} />
              <Text className="text-muted dark:text-mutedDark text-xs">{data.marketStatus.label}</Text>
            </View>
          </View>
          <Text className="text-muted dark:text-mutedDark text-xs mt-1 mb-3">
            Herramientas de análisis para practicar. Aquí no hay recomendaciones: las conclusiones son tuyas.
          </Text>

          {data.isMock ? (
            <View className="bg-primary/10 rounded-lg px-3 py-2 mb-3">
              <Text className="text-primary dark:text-primaryDark text-xs">
                Mostrando datos de ejemplo (mock). Configura FINNHUB_API_KEY y GEMINI_API_KEY en el backend para datos e IA reales.
              </Text>
            </View>
          ) : null}

          <TextInput
            className="bg-card dark:bg-cardDark border border-border dark:border-borderDark rounded-xl px-4 py-3 text-ink dark:text-inkDark"
            placeholder="Busca una empresa (ej. Apple, MSFT...)"
            placeholderTextColor="#98A0AA"
            autoCapitalize="none"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && searchResults?.results.length ? (
            <View className="border border-border dark:border-borderDark rounded-xl mt-1 overflow-hidden">
              {searchResults.results.slice(0, 6).map((r) => (
                <Pressable
                  key={r.ticker}
                  className="px-4 py-3 bg-card dark:bg-cardDark border-b border-border dark:border-borderDark"
                  onPress={() => {
                    setSearch("");
                    router.push(`/company/${r.ticker}`);
                  }}
                >
                  <Text className="text-ink dark:text-inkDark font-medium">
                    {r.ticker} <Text className="text-muted dark:text-mutedDark font-normal">· {r.name}</Text>
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : null}

          <Pressable onPress={() => router.push("/scanner")}>
            <Card className="flex-row items-center gap-3 mt-3">
              <Text className="text-xl">🔍</Text>
              <View className="flex-1">
                <Text className="text-ink dark:text-inkDark font-medium">Screener de empresas</Text>
                <Text className="text-muted dark:text-mutedDark text-xs mt-0.5">Filtra el universo por métricas y practica encontrando negocios que cumplan tus criterios.</Text>
              </View>
              <Text className="text-muted dark:text-mutedDark">›</Text>
            </Card>
          </Pressable>

          <Card className="mt-3">
            <Text className="font-sans-bold text-ink dark:text-inkDark mb-1">{data.dailySummary.headline}</Text>
            <Text className="text-muted dark:text-mutedDark text-sm leading-5">{data.dailySummary.body}</Text>
          </Card>

          <SectionHeader title="Índices" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-3">
              {data.indices.map((idx) => (
                <Card key={idx.symbol} className="w-32">
                  <Text className="text-muted dark:text-mutedDark text-xs">{idx.name}</Text>
                  <Text className="font-mono-bold text-ink dark:text-inkDark mt-1">{idx.value.toLocaleString()}</Text>
                  <Text className={cn("font-mono text-xs mt-0.5", idx.changePct >= 0 ? "text-positive dark:text-positiveDark" : "text-negative dark:text-negativeDark")}>
                    {idx.changePct >= 0 ? "+" : ""}
                    {(idx.changePct * 100).toFixed(2)}%
                  </Text>
                </Card>
              ))}
            </View>
          </ScrollView>

          <SectionHeader title="Noticias" />
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
