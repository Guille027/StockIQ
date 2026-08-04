import { Alert, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { usePortfolio, usePortfolioOrders, useResetPortfolio, useDeletePortfolio } from "@/api/hooks";
import { Card } from "@/components/Card";
import { PressableScale } from "@/components/PressableScale";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { cn } from "@/utils/cn";

function fmtMoney(v: number): string {
  return `$${v.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function fmtPct(v: number): string {
  return `${v >= 0 ? "+" : ""}${(v * 100).toFixed(2)}%`;
}

export default function PortfolioDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const portfolioId = id ?? "";
  const { data: portfolio, isLoading, isError, refetch } = usePortfolio(portfolioId);
  const { data: orders } = usePortfolioOrders(portfolioId);
  const resetPortfolio = useResetPortfolio(portfolioId);
  const deletePortfolio = useDeletePortfolio();

  const confirmReset = () => {
    Alert.alert("Resetear cartera", "Esto borra todas las órdenes y devuelve el efectivo al saldo inicial. ¿Continuar?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Resetear", style: "destructive", onPress: () => resetPortfolio.mutate() },
    ]);
  };

  const confirmDelete = () => {
    Alert.alert("Eliminar cartera", "Esto borra la cartera y todo su historial de forma permanente. ¿Continuar?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => deletePortfolio.mutate(portfolioId, { onSuccess: () => router.back() }),
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-backgroundDark" edges={["top"]}>
      <Stack.Screen options={{ title: portfolio?.name ?? "" }} />

      {isLoading ? <LoadingState label="Cargando cartera..." /> : null}
      {isError ? <ErrorState message="No se pudo cargar la cartera." onRetry={() => refetch()} /> : null}

      {portfolio ? (
        <ScrollView className="px-4" contentContainerStyle={{ paddingBottom: 32 }} keyboardShouldPersistTaps="handled">
          <Card className="mt-2">
            <Text className="text-muted dark:text-mutedDark text-xs">Valor total</Text>
            <Text className="font-mono-bold text-ink dark:text-inkDark text-3xl mt-1">{fmtMoney(portfolio.totalValue)}</Text>
            <Text className={cn("font-mono text-sm mt-1", portfolio.totalReturnPct >= 0 ? "text-positive dark:text-positiveDark" : "text-negative dark:text-negativeDark")}>
              {fmtPct(portfolio.totalReturnPct)} desde el inicio
            </Text>
            <View className="flex-row justify-between mt-3 pt-3 border-t border-border dark:border-borderDark">
              <View>
                <Text className="text-muted dark:text-mutedDark text-xs">Efectivo</Text>
                <Text className="font-mono text-ink dark:text-inkDark mt-0.5">{fmtMoney(portfolio.cashBalance)}</Text>
              </View>
              <View>
                <Text className="text-muted dark:text-mutedDark text-xs">Saldo inicial</Text>
                <Text className="font-mono text-ink dark:text-inkDark mt-0.5">{fmtMoney(portfolio.startingBalance)}</Text>
              </View>
            </View>
          </Card>

          <Text className="font-sans-bold text-ink dark:text-inkDark mt-6 mb-2">Operar</Text>
          <Text className="text-muted dark:text-mutedDark text-xs mb-2">
            Toda operación empieza con un plan: por qué entras, qué riesgo ves y dónde sales. Sin plan no hay orden.
          </Text>
          <View className="flex-row gap-2">
            <PressableScale className="flex-1" onPress={() => router.push(`/order/new?portfolioId=${portfolioId}&side=buy`)}>
              <View className="bg-primary dark:bg-primaryDark rounded-xl py-3.5 items-center">
                <Text className="font-sans-bold text-white">Comprar con plan</Text>
              </View>
            </PressableScale>
            <PressableScale className="flex-1" onPress={() => router.push(`/order/new?portfolioId=${portfolioId}&side=sell`)}>
              <View className="border border-primary dark:border-primaryDark rounded-xl py-3.5 items-center">
                <Text className="font-sans-bold text-primary dark:text-primaryDark">Vender con plan</Text>
              </View>
            </PressableScale>
          </View>

          <Text className="font-sans-bold text-ink dark:text-inkDark mt-6 mb-2">Posiciones</Text>
          {portfolio.positions.length === 0 ? (
            <Card>
              <Text className="text-muted dark:text-mutedDark text-sm">Sin posiciones abiertas todavía.</Text>
            </Card>
          ) : (
            <View className="gap-2">
              {portfolio.positions.map((pos) => (
                <PressableScale key={pos.ticker} onPress={() => router.push(`/company/${pos.ticker}`)}>
                  <Card className="flex-row items-center justify-between">
                    <View className="flex-1 pr-3">
                      <Text className="font-sans-bold text-ink dark:text-inkDark">{pos.ticker}</Text>
                      <Text className="font-mono text-muted dark:text-mutedDark text-xs mt-0.5">
                        {pos.quantity} acciones · coste medio {fmtMoney(pos.avgCostBasis)}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className="font-mono-bold text-ink dark:text-inkDark">{fmtMoney(pos.marketValue)}</Text>
                      <Text className={cn("font-mono text-xs", pos.unrealizedPnlPct >= 0 ? "text-positive dark:text-positiveDark" : "text-negative dark:text-negativeDark")}>
                        {fmtPct(pos.unrealizedPnlPct)}
                      </Text>
                    </View>
                  </Card>
                </PressableScale>
              ))}
            </View>
          )}

          <Text className="font-sans-bold text-ink dark:text-inkDark mt-6 mb-2">Historial de órdenes</Text>
          {!orders || orders.length === 0 ? (
            <Card>
              <Text className="text-muted dark:text-mutedDark text-sm">Sin órdenes todavía.</Text>
            </Card>
          ) : (
            <View className="gap-2">
              {orders.map((o) => (
                <Card key={o.id} className="flex-row items-center justify-between">
                  <View>
                    <Text className="font-sans-bold text-ink dark:text-inkDark">
                      <Text className={o.side === "buy" ? "text-positive dark:text-positiveDark" : "text-negative dark:text-negativeDark"}>
                        {o.side === "buy" ? "Compra" : "Venta"}
                      </Text>{" "}
                      {o.ticker}
                    </Text>
                    <Text className="font-mono text-muted dark:text-mutedDark text-xs mt-0.5">
                      {o.quantity} @ {fmtMoney(o.price)}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-muted dark:text-mutedDark text-xs">{new Date(o.executedAt).toLocaleDateString()}</Text>
                    {o.realizedPnlPct !== undefined ? (
                      <Text className={cn("font-mono text-xs mt-0.5", o.realizedPnlPct >= 0 ? "text-positive dark:text-positiveDark" : "text-negative dark:text-negativeDark")}>
                        {fmtPct(o.realizedPnlPct)} realizado
                      </Text>
                    ) : null}
                  </View>
                </Card>
              ))}
            </View>
          )}

          <View className="flex-row gap-2 mt-6">
            <PressableScale onPress={confirmReset} className="flex-1 border border-border dark:border-borderDark rounded-xl py-3 items-center">
              <Text className="font-sans-semibold text-ink dark:text-inkDark">Resetear</Text>
            </PressableScale>
            <PressableScale onPress={confirmDelete} className="flex-1 border border-negative dark:border-negativeDark rounded-xl py-3 items-center">
              <Text className="font-sans-semibold text-negative dark:text-negativeDark">Eliminar</Text>
            </PressableScale>
          </View>
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}
