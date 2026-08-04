import { useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import Svg, { Path } from "react-native-svg";
import { useColorScheme } from "nativewind";
import { EMOTION_LABELS } from "@stockiq/shared-types";
import { usePortfolios, useCreatePortfolio, useJournal } from "@/api/hooks";
import { Card } from "@/components/Card";
import { PressableScale } from "@/components/PressableScale";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { cn } from "@/utils/cn";

type SubTab = "carteras" | "diario";

export default function PracticeScreen() {
  const params = useLocalSearchParams<{ tab?: string }>();
  const [sub, setSub] = useState<SubTab>(params.tab === "diario" ? "diario" : "carteras");
  const [showForm, setShowForm] = useState(false);
  const { colorScheme } = useColorScheme();
  const inkColor = colorScheme === "dark" ? "#f2f1f6" : "#1a1a22";

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-backgroundDark" edges={["top"]}>
      <ScrollView className="px-4" contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="flex-row items-center justify-between mt-2 mb-1">
          <Text className="font-display text-2xl text-ink dark:text-inkDark">Práctica</Text>
          <View className="flex-row items-center gap-2">
            <PressableScale onPress={() => router.push("/explore")} hitSlop={8} className="w-9 h-9 rounded-full bg-surface dark:bg-surfaceDark items-center justify-center">
              <Svg width={17} height={17} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M4 17l5-6 4 3 7-9M15 5h5v5"
                  stroke={inkColor}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </PressableScale>
            {sub === "carteras" ? (
              <PressableScale onPress={() => setShowForm((v) => !v)} className="bg-primary dark:bg-primaryDark px-3 py-1.5 rounded-full">
                <Text className="font-sans-semibold text-white text-sm">{showForm ? "Cancelar" : "+ Nueva"}</Text>
              </PressableScale>
            ) : null}
          </View>
        </View>
        <Text className="text-muted dark:text-mutedDark text-sm mb-4">
          Tu campo de entrenamiento: dinero ficticio, decisiones reales. Cada operación te pedirá un plan.
        </Text>

        <View className="flex-row gap-2 mb-4">
          <PressableScale className="flex-1" onPress={() => setSub("carteras")}>
            <View className={cn("py-2 rounded-xl items-center", sub === "carteras" ? "bg-primary dark:bg-primaryDark" : "bg-surface dark:bg-surfaceDark")}>
              <Text className={sub === "carteras" ? "font-sans-semibold text-white text-sm" : "text-muted dark:text-mutedDark text-sm"}>Carteras</Text>
            </View>
          </PressableScale>
          <PressableScale className="flex-1" onPress={() => setSub("diario")}>
            <View className={cn("py-2 rounded-xl items-center", sub === "diario" ? "bg-primary dark:bg-primaryDark" : "bg-surface dark:bg-surfaceDark")}>
              <Text className={sub === "diario" ? "font-sans-semibold text-white text-sm" : "text-muted dark:text-mutedDark text-sm"}>Diario</Text>
            </View>
          </PressableScale>
        </View>

        {sub === "carteras" ? <CarterasView showForm={showForm} onCreated={() => setShowForm(false)} /> : <DiarioView />}
      </ScrollView>
    </SafeAreaView>
  );
}

function CarterasView({ showForm, onCreated }: { showForm: boolean; onCreated: () => void }) {
  const { data, isLoading, isError, refetch } = usePortfolios();
  const createPortfolio = useCreatePortfolio();
  const [name, setName] = useState("");
  const [startingBalance, setStartingBalance] = useState("10000");

  const submit = () => {
    if (!name.trim()) return;
    createPortfolio.mutate(
      { name: name.trim(), startingBalance: Number(startingBalance) || 10000 },
      {
        onSuccess: (portfolio) => {
          onCreated();
          setName("");
          setStartingBalance("10000");
          router.push(`/portfolio/${portfolio.id}`);
        },
      },
    );
  };

  return (
    <View>
      {showForm ? (
        <Card className="mb-4">
          <Text className="text-ink dark:text-inkDark text-sm font-medium mb-1">Nombre</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="ej. Cartera principal"
            placeholderTextColor="#8a8998"
            className="border border-border dark:border-borderDark rounded-xl px-3 py-2.5 text-ink dark:text-inkDark mb-3"
          />
          <Text className="text-ink dark:text-inkDark text-sm font-medium mb-1">Saldo inicial ($)</Text>
          <TextInput
            value={startingBalance}
            onChangeText={setStartingBalance}
            keyboardType="numeric"
            placeholderTextColor="#8a8998"
            className="border border-border dark:border-borderDark rounded-xl px-3 py-2.5 text-ink dark:text-inkDark mb-3"
          />
          <PressableScale onPress={submit} className="bg-primary dark:bg-primaryDark rounded-xl py-3 items-center">
            <Text className="font-sans-bold text-white">Crear cartera</Text>
          </PressableScale>
        </Card>
      ) : null}

      {isLoading ? <LoadingState label="Cargando carteras..." /> : null}
      {isError ? <ErrorState message="No se pudieron cargar las carteras." onRetry={() => refetch()} /> : null}

      {data && data.length === 0 && !showForm ? (
        <Card>
          <Text className="text-ink dark:text-inkDark font-medium">Aún no tienes ninguna cartera</Text>
          <Text className="text-muted dark:text-mutedDark text-xs mt-1">
            Crea una con "+ Nueva" para empezar a comprar y vender con dinero ficticio.
          </Text>
        </Card>
      ) : null}

      {data ? (
        <View className="gap-2">
          {data.map((p) => (
            <PressableScale key={p.id} onPress={() => router.push(`/portfolio/${p.id}`)}>
              <Card className="flex-row items-center justify-between">
                <View className="flex-1 pr-3">
                  <Text className="font-sans-bold text-ink dark:text-inkDark">{p.name}</Text>
                  <Text className="font-mono text-muted dark:text-mutedDark text-xs mt-0.5">
                    ${p.totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })} · {p.positions.length} posiciones
                  </Text>
                </View>
                <Text className={cn("font-mono-bold", p.totalReturnPct >= 0 ? "text-positive dark:text-positiveDark" : "text-negative dark:text-negativeDark")}>
                  {p.totalReturnPct >= 0 ? "+" : ""}
                  {(p.totalReturnPct * 100).toFixed(2)}%
                </Text>
              </Card>
            </PressableScale>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const FILTERS = [
  { key: undefined, label: "Todo" },
  { key: "trade", label: "Operaciones" },
  { key: "note", label: "Notas" },
] as const;

function DiarioView() {
  const [kind, setKind] = useState<string | undefined>(undefined);
  const { data, isLoading, isError, refetch } = useJournal(kind ? { kind } : {});

  const pendingReflections = data?.filter((e) => e.kind === "trade" && e.content.side === "sell" && !e.reflectedAt).length ?? 0;

  return (
    <View>
      <View className="flex-row gap-2 mb-3">
        {FILTERS.map((f) => (
          <PressableScale key={f.label} onPress={() => setKind(f.key)}>
            <View className={cn("px-3.5 py-1.5 rounded-full border", kind === f.key ? "bg-primarySoft dark:bg-primarySoftDark border-primary dark:border-primaryDark" : "border-border dark:border-borderDark")}>
              <Text className={cn("text-xs", kind === f.key ? "text-primary dark:text-primaryDark font-medium" : "text-muted dark:text-mutedDark")}>{f.label}</Text>
            </View>
          </PressableScale>
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
            Cuando hagas tu primera operación en Carteras, tu plan (por qué compras, qué riesgo ves, dónde saldrás) se guardará aquí automáticamente.
          </Text>
        </Card>
      ) : null}

      {data ? (
        <View className="gap-2">
          {data.map((e) => (
            <PressableScale key={e.id} onPress={() => router.push(`/journal/${e.id}`)}>
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
            </PressableScale>
          ))}
        </View>
      ) : null}
    </View>
  );
}
