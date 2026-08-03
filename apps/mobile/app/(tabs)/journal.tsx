import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { EMOTION_LABELS } from "@stockiq/shared-types";
import { useJournal } from "@/api/hooks";
import { Card } from "@/components/Card";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { cn } from "@/utils/cn";

const FILTERS = [
  { key: undefined, label: "Todo" },
  { key: "trade", label: "Operaciones" },
  { key: "note", label: "Notas" },
] as const;

export default function JournalScreen() {
  const [kind, setKind] = useState<string | undefined>(undefined);
  const { data, isLoading, isError, refetch } = useJournal(kind ? { kind } : {});

  const pendingReflections = data?.filter((e) => e.kind === "trade" && e.content.side === "sell" && !e.reflectedAt).length ?? 0;

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-backgroundDark" edges={["top"]}>
      <ScrollView className="px-4" contentContainerStyle={{ paddingBottom: 32 }}>
        <Text className="font-display text-2xl text-ink dark:text-inkDark mt-2 mb-1">Diario</Text>
        <Text className="text-muted dark:text-mutedDark text-sm mb-3">Tu memoria como inversor: cada operación, tu plan y lo que aprendiste.</Text>

        <View className="flex-row gap-2 mb-3">
          {FILTERS.map((f) => (
            <Pressable key={f.label} onPress={() => setKind(f.key)}>
              <View className={cn("px-3.5 py-1.5 rounded-full border", kind === f.key ? "bg-primarySoft dark:bg-primarySoftDark border-primary dark:border-primaryDark" : "border-border dark:border-borderDark")}>
                <Text className={cn("text-xs", kind === f.key ? "text-primary dark:text-primaryDark font-medium" : "text-muted dark:text-mutedDark")}>{f.label}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        {pendingReflections > 0 ? (
          <Card className="mb-3 border-accent dark:border-accentDark">
            <Text className="text-ink dark:text-inkDark text-sm">
              ✍️ Tienes <Text className="font-mono-bold">{pendingReflections}</Text> {pendingReflections === 1 ? "venta sin reflexión" : "ventas sin reflexión"}. Revisar qué pasó después de cerrar es donde más se aprende (+25 XP).
            </Text>
          </Card>
        ) : null}

        {isLoading ? <LoadingState label="Cargando tu diario..." /> : null}
        {isError ? <ErrorState message="No se pudo cargar el diario." onRetry={() => refetch()} /> : null}

        {data && data.length === 0 ? (
          <Card>
            <Text className="text-xl mb-2">📓</Text>
            <Text className="font-sans-bold text-ink dark:text-inkDark mb-1">Aún no hay entradas</Text>
            <Text className="text-muted dark:text-mutedDark text-sm leading-5">
              Cuando hagas tu primera operación en Práctica, tu plan (por qué compras, qué riesgo ves, dónde saldrás) se guardará aquí automáticamente.
            </Text>
          </Card>
        ) : null}

        {data ? (
          <View className="gap-2">
            {data.map((e) => (
              <Pressable key={e.id} onPress={() => router.push(`/journal/${e.id}`)}>
                <Card>
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2 flex-1">
                      {e.kind === "trade" ? (
                        <>
                          <Text className={cn("font-mono-bold text-[11px]", e.content.side === "buy" ? "text-primary dark:text-primaryDark" : "text-ink dark:text-inkDark")}>
                            {e.content.side === "buy" ? "COMPRA" : "VENTA"}
                          </Text>
                          <Text className="font-sans-bold text-ink dark:text-inkDark">{e.ticker}</Text>
                          {e.content.emotion ? <Text className="text-sm">{EMOTION_LABELS[e.content.emotion].emoji}</Text> : null}
                        </>
                      ) : (
                        <Text className="font-sans-bold text-ink dark:text-inkDark">📝 Nota</Text>
                      )}
                    </View>
                    <Text className="text-muted dark:text-mutedDark text-[11px]">{new Date(e.createdAt).toLocaleDateString()}</Text>
                  </View>
                  <Text className="text-muted dark:text-mutedDark text-xs mt-1.5" numberOfLines={2}>
                    {e.kind === "trade" ? e.content.plan?.reason : e.content.text}
                  </Text>
                  <View className="flex-row items-center gap-3 mt-1.5">
                    {e.content.resultPct !== undefined ? (
                      <Text className={cn("font-mono text-xs", e.content.resultPct >= 0 ? "text-positive dark:text-positiveDark" : "text-negative dark:text-negativeDark")}>
                        {e.content.resultPct >= 0 ? "+" : ""}
                        {(e.content.resultPct * 100).toFixed(2)}% realizado
                      </Text>
                    ) : null}
                    {e.kind === "trade" && e.content.side === "sell" && !e.reflectedAt ? (
                      <Text className="text-accent dark:text-accentDark text-xs">Pendiente de reflexión</Text>
                    ) : null}
                    {e.reflectedAt ? <Text className="text-positive dark:text-positiveDark text-xs">✓ Reflexionada</Text> : null}
                  </View>
                </Card>
              </Pressable>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
