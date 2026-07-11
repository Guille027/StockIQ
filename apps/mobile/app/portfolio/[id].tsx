import { useState } from "react";
import { Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { usePortfolio, usePortfolioOrders, usePlaceOrder, useResetPortfolio, useDeletePortfolio } from "@/api/hooks";
import { ApiError } from "@/api/client";
import { Card } from "@/components/Card";
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
  const placeOrder = usePlaceOrder(portfolioId);
  const resetPortfolio = useResetPortfolio(portfolioId);
  const deletePortfolio = useDeletePortfolio();

  const [ticker, setTicker] = useState("");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [quantity, setQuantity] = useState("");
  const [orderError, setOrderError] = useState<string | null>(null);

  const submitOrder = () => {
    setOrderError(null);
    const qty = Number(quantity);
    if (!ticker.trim() || !qty || qty <= 0) {
      setOrderError("Introduce un ticker y una cantidad válida.");
      return;
    }
    placeOrder.mutate(
      { ticker: ticker.trim().toUpperCase(), side, quantity: qty },
      {
        onSuccess: () => {
          setTicker("");
          setQuantity("");
        },
        onError: (err) => {
          setOrderError(err instanceof ApiError ? err.message : "No se pudo ejecutar la orden.");
        },
      },
    );
  };

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
        <ScrollView className="px-4" contentContainerStyle={{ paddingBottom: 32 }}>
          <Card className="mt-2">
            <Text className="text-muted dark:text-mutedDark text-xs">Valor total</Text>
            <Text className="text-ink dark:text-inkDark text-3xl font-bold mt-1">{fmtMoney(portfolio.totalValue)}</Text>
            <Text className={cn("text-sm font-medium mt-1", portfolio.totalReturnPct >= 0 ? "text-positive dark:text-positiveDark" : "text-negative dark:text-negativeDark")}>
              {fmtPct(portfolio.totalReturnPct)} desde el inicio
            </Text>
            <View className="flex-row justify-between mt-3 pt-3 border-t border-border dark:border-borderDark">
              <View>
                <Text className="text-muted dark:text-mutedDark text-xs">Efectivo</Text>
                <Text className="text-ink dark:text-inkDark font-medium mt-0.5">{fmtMoney(portfolio.cashBalance)}</Text>
              </View>
              <View>
                <Text className="text-muted dark:text-mutedDark text-xs">Saldo inicial</Text>
                <Text className="text-ink dark:text-inkDark font-medium mt-0.5">{fmtMoney(portfolio.startingBalance)}</Text>
              </View>
            </View>
          </Card>

          <Text className="text-ink dark:text-inkDark font-semibold mt-5 mb-2">Comprar / Vender</Text>
          <Card>
            <View className="flex-row gap-2 mb-3">
              <Pressable onPress={() => setSide("buy")} className="flex-1">
                <View className={cn("py-2 rounded-lg items-center", side === "buy" ? "bg-positive" : "bg-surface dark:bg-surfaceDark")}>
                  <Text className={side === "buy" ? "text-white font-medium" : "text-ink dark:text-inkDark"}>Comprar</Text>
                </View>
              </Pressable>
              <Pressable onPress={() => setSide("sell")} className="flex-1">
                <View className={cn("py-2 rounded-lg items-center", side === "sell" ? "bg-negative" : "bg-surface dark:bg-surfaceDark")}>
                  <Text className={side === "sell" ? "text-white font-medium" : "text-ink dark:text-inkDark"}>Vender</Text>
                </View>
              </Pressable>
            </View>
            <TextInput
              value={ticker}
              onChangeText={(t) => setTicker(t.toUpperCase())}
              placeholder="Ticker, ej. AAPL"
              placeholderTextColor="#8B93A7"
              autoCapitalize="characters"
              className="border border-border dark:border-borderDark rounded-xl px-3 py-2.5 text-ink dark:text-inkDark mb-3"
            />
            <TextInput
              value={quantity}
              onChangeText={setQuantity}
              placeholder="Cantidad de acciones"
              placeholderTextColor="#8B93A7"
              keyboardType="numeric"
              className="border border-border dark:border-borderDark rounded-xl px-3 py-2.5 text-ink dark:text-inkDark mb-3"
            />
            {orderError ? <Text className="text-negative dark:text-negativeDark text-xs mb-3">{orderError}</Text> : null}
            <Pressable onPress={submitOrder} disabled={placeOrder.isPending} className="bg-primary dark:bg-primaryDark rounded-xl py-3 items-center">
              <Text className="text-white font-semibold">{placeOrder.isPending ? "Ejecutando..." : side === "buy" ? "Comprar" : "Vender"}</Text>
            </Pressable>
          </Card>

          <Text className="text-ink dark:text-inkDark font-semibold mt-5 mb-2">Posiciones</Text>
          {portfolio.positions.length === 0 ? (
            <Card>
              <Text className="text-muted dark:text-mutedDark text-sm">Sin posiciones abiertas todavía.</Text>
            </Card>
          ) : (
            <View className="gap-2">
              {portfolio.positions.map((pos) => (
                <Pressable key={pos.ticker} onPress={() => router.push(`/company/${pos.ticker}`)}>
                  <Card className="flex-row items-center justify-between">
                    <View className="flex-1 pr-3">
                      <Text className="text-ink dark:text-inkDark font-semibold">{pos.ticker}</Text>
                      <Text className="text-muted dark:text-mutedDark text-xs mt-0.5">
                        {pos.quantity} acciones · coste medio {fmtMoney(pos.avgCostBasis)}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-ink dark:text-inkDark font-medium">{fmtMoney(pos.marketValue)}</Text>
                      <Text className={pos.unrealizedPnlPct >= 0 ? "text-positive dark:text-positiveDark text-xs" : "text-negative dark:text-negativeDark text-xs"}>
                        {fmtPct(pos.unrealizedPnlPct)}
                      </Text>
                    </View>
                  </Card>
                </Pressable>
              ))}
            </View>
          )}

          <Text className="text-ink dark:text-inkDark font-semibold mt-5 mb-2">Historial de órdenes</Text>
          {!orders || orders.length === 0 ? (
            <Card>
              <Text className="text-muted dark:text-mutedDark text-sm">Sin órdenes todavía.</Text>
            </Card>
          ) : (
            <View className="gap-2">
              {orders.map((o) => (
                <Card key={o.id} className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-ink dark:text-inkDark font-medium">
                      <Text className={o.side === "buy" ? "text-positive dark:text-positiveDark" : "text-negative dark:text-negativeDark"}>
                        {o.side === "buy" ? "Compra" : "Venta"}
                      </Text>{" "}
                      {o.ticker}
                    </Text>
                    <Text className="text-muted dark:text-mutedDark text-xs mt-0.5">
                      {o.quantity} @ {fmtMoney(o.price)}
                    </Text>
                  </View>
                  <Text className="text-muted dark:text-mutedDark text-xs">{new Date(o.executedAt).toLocaleDateString()}</Text>
                </Card>
              ))}
            </View>
          )}

          <View className="flex-row gap-2 mt-6">
            <Pressable onPress={confirmReset} className="flex-1 border border-border dark:border-borderDark rounded-xl py-3 items-center">
              <Text className="text-ink dark:text-inkDark font-medium">Resetear</Text>
            </Pressable>
            <Pressable onPress={confirmDelete} className="flex-1 border border-negative dark:border-negativeDark rounded-xl py-3 items-center">
              <Text className="text-negative dark:text-negativeDark font-medium">Eliminar</Text>
            </Pressable>
          </View>
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}
