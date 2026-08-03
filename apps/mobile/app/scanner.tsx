import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useCompanies, useScanner } from "@/api/hooks";
import type { ScannerFilter } from "@/api/types";
import { Card } from "@/components/Card";
import { ScoreBadge } from "@/components/ScoreBadge";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { cn } from "@/utils/cn";

function NumberField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <View className="mb-3">
      <Text className="text-ink dark:text-inkDark text-sm font-medium mb-1">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        keyboardType="numeric"
        placeholder={placeholder}
        placeholderTextColor="#8a8998"
        className="border border-border dark:border-borderDark rounded-xl px-3 py-2.5 text-ink dark:text-inkDark"
      />
    </View>
  );
}

export default function ScannerScreen() {
  const { data: companiesData } = useCompanies();
  const [peMax, setPeMax] = useState("");
  const [roeMin, setRoeMin] = useState("");
  const [revenueGrowthMin, setRevenueGrowthMin] = useState("");
  const [sector, setSector] = useState<string | null>(null);
  const [insiderBuyingOnly, setInsiderBuyingOnly] = useState(false);
  const [positiveNewsOnly, setPositiveNewsOnly] = useState(false);
  const [submittedFilter, setSubmittedFilter] = useState<ScannerFilter | null>(null);

  const { data, isLoading, isError, refetch } = useScanner(submittedFilter ?? {}, submittedFilter !== null);

  const runScan = () => {
    const filter: ScannerFilter = {
      peMax: peMax ? Number(peMax) : undefined,
      roeMin: roeMin ? Number(roeMin) / 100 : undefined,
      revenueGrowthMin: revenueGrowthMin ? Number(revenueGrowthMin) / 100 : undefined,
      sectors: sector ? [sector] : undefined,
      insiderBuyingOnly: insiderBuyingOnly || undefined,
      positiveNewsOnly: positiveNewsOnly || undefined,
    };
    setSubmittedFilter(filter);
  };

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-backgroundDark" edges={[]}>
      <ScrollView className="px-4" contentContainerStyle={{ paddingBottom: 32, paddingTop: 16 }}>
        <Text className="text-muted dark:text-mutedDark text-xs mb-3">
          Herramienta de análisis para practicar tus criterios -- los resultados no son recomendaciones.
        </Text>

        <Card>
          <NumberField label="PER máximo" value={peMax} onChange={setPeMax} placeholder="ej. 25" />
          <NumberField label="ROE mínimo (%)" value={roeMin} onChange={setRoeMin} placeholder="ej. 15" />
          <NumberField label="Crecimiento de ingresos mínimo (%)" value={revenueGrowthMin} onChange={setRevenueGrowthMin} placeholder="ej. 10" />

          <Text className="text-ink dark:text-inkDark text-sm font-medium mb-2">Sector</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
            <View className="flex-row gap-2">
              {(companiesData?.sectors ?? []).map((s) => (
                <Pressable key={s} onPress={() => setSector(sector === s ? null : s)}>
                  <View className={cn("px-3 py-1.5 rounded-full border", sector === s ? "bg-primary dark:bg-primaryDark border-primary dark:border-primaryDark" : "border-border dark:border-borderDark")}>
                    <Text className={sector === s ? "text-white text-xs font-medium" : "text-ink dark:text-inkDark text-xs"}>{s}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          <View className="flex-row gap-2 mb-4">
            <Pressable onPress={() => setInsiderBuyingOnly((v) => !v)} className="flex-1">
              <View className={cn("px-3 py-2 rounded-xl border items-center", insiderBuyingOnly ? "bg-primary dark:bg-primaryDark border-primary dark:border-primaryDark" : "border-border dark:border-borderDark")}>
                <Text className={insiderBuyingOnly ? "text-white text-xs font-medium" : "text-ink dark:text-inkDark text-xs"}>Insider buying</Text>
              </View>
            </Pressable>
            <Pressable onPress={() => setPositiveNewsOnly((v) => !v)} className="flex-1">
              <View className={cn("px-3 py-2 rounded-xl border items-center", positiveNewsOnly ? "bg-primary dark:bg-primaryDark border-primary dark:border-primaryDark" : "border-border dark:border-borderDark")}>
                <Text className={positiveNewsOnly ? "text-white text-xs font-medium" : "text-ink dark:text-inkDark text-xs"}>Noticias positivas</Text>
              </View>
            </Pressable>
          </View>

          <Pressable onPress={runScan} className="bg-primary dark:bg-primaryDark rounded-xl py-3 items-center">
            <Text className="font-sans-bold text-white">Buscar</Text>
          </Pressable>
        </Card>

        {isLoading ? <LoadingState label="Analizando el universo de empresas..." /> : null}
        {isError ? <ErrorState message="No se pudo ejecutar el scanner." onRetry={() => refetch()} /> : null}

        {data ? (
          <View className="mt-4">
            <Text className="font-mono text-muted dark:text-mutedDark text-sm mb-2">{data.count} resultados</Text>
            <View className="gap-2">
              {data.results.map((row) => (
                <Pressable key={row.ticker} onPress={() => router.push(`/company/${row.ticker}`)}>
                  <Card className="flex-row items-center justify-between">
                    <View className="flex-1 pr-3">
                      <Text className="font-sans-bold text-ink dark:text-inkDark">
                        {row.ticker} <Text className="text-muted dark:text-mutedDark font-normal">· {row.sector}</Text>
                      </Text>
                      <Text className="text-muted dark:text-mutedDark text-xs mt-0.5" numberOfLines={1}>
                        {row.matchedFilters.join(" · ") || "Coincide con los filtros"}
                      </Text>
                    </View>
                    <ScoreBadge value={row.globalScore} size="sm" />
                  </Card>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
