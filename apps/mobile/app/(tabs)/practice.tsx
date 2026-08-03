import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { usePortfolios, useCreatePortfolio } from "@/api/hooks";
import { Card } from "@/components/Card";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { cn } from "@/utils/cn";

export default function PaperTradingListScreen() {
  const { data, isLoading, isError, refetch } = usePortfolios();
  const createPortfolio = useCreatePortfolio();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [startingBalance, setStartingBalance] = useState("10000");

  const submit = () => {
    if (!name.trim()) return;
    createPortfolio.mutate(
      { name: name.trim(), startingBalance: Number(startingBalance) || 10000 },
      {
        onSuccess: (portfolio) => {
          setShowForm(false);
          setName("");
          setStartingBalance("10000");
          router.push(`/portfolio/${portfolio.id}`);
        },
      },
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-backgroundDark" edges={["top"]}>
      <ScrollView className="px-4" contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="flex-row items-center justify-between mt-2 mb-1">
          <Text className="font-display text-2xl text-ink dark:text-inkDark">Práctica</Text>
          <Pressable onPress={() => setShowForm((v) => !v)} className="bg-primary dark:bg-primaryDark px-3 py-1.5 rounded-full">
            <Text className="font-sans-semibold text-white text-sm">{showForm ? "Cancelar" : "+ Nueva"}</Text>
          </Pressable>
        </View>
        <Text className="text-muted dark:text-mutedDark text-sm mb-4">
          Tu campo de entrenamiento: dinero ficticio, decisiones reales. Cada operación te pedirá un plan.
        </Text>

        {showForm ? (
          <Card className="mb-4">
            <Text className="text-ink dark:text-inkDark text-sm font-medium mb-1">Nombre</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="ej. Cartera principal"
              placeholderTextColor="#8B93A7"
              className="border border-border dark:border-borderDark rounded-xl px-3 py-2.5 text-ink dark:text-inkDark mb-3"
            />
            <Text className="text-ink dark:text-inkDark text-sm font-medium mb-1">Saldo inicial ($)</Text>
            <TextInput
              value={startingBalance}
              onChangeText={setStartingBalance}
              keyboardType="numeric"
              placeholderTextColor="#8B93A7"
              className="border border-border dark:border-borderDark rounded-xl px-3 py-2.5 text-ink dark:text-inkDark mb-3"
            />
            <Pressable onPress={submit} className="bg-primary dark:bg-primaryDark rounded-xl py-3 items-center">
              <Text className="font-sans-bold text-white">Crear cartera</Text>
            </Pressable>
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
              <Pressable key={p.id} onPress={() => router.push(`/portfolio/${p.id}`)}>
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
              </Pressable>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
