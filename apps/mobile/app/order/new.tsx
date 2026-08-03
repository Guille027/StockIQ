import { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { EMOTIONAL_STATES, EMOTION_LABELS, type EmotionalState } from "@stockiq/shared-types";
import { usePlaceOrder, usePortfolio, useTickerSearch } from "@/api/hooks";
import { ApiError } from "@/api/client";
import { Card } from "@/components/Card";
import { cn } from "@/utils/cn";

const STEPS = ["Orden", "Tu plan", "Emoción", "Confirmar"] as const;

const PLAN_QUESTIONS = [
  { key: "reason", label: "¿Por qué haces esta operación?", placeholder: "ej. Los resultados del último trimestre superaron expectativas y el margen sigue creciendo..." },
  { key: "expectation", label: "¿Qué esperas que ocurra?", placeholder: "ej. Que el precio recupere la zona de $190 en 2-3 meses..." },
  { key: "riskNoted", label: "¿Qué riesgo ves?", placeholder: "ej. Si la próxima presentación de resultados decepciona, podría caer un 10%..." },
  { key: "exitPlan", label: "¿Dónde sales si te equivocas?", placeholder: "ej. Si pierde el soporte de $170, vendo y reevalúo..." },
] as const;

const ALERT_EMOTIONS: EmotionalState[] = ["fomo", "euforia", "venganza"];

/**
 * Pre-trade wizard: no order executes without a plan. This is the heart of
 * the app -- the moment where a simulator becomes a coach.
 */
export default function NewOrderScreen() {
  const params = useLocalSearchParams<{ portfolioId: string; ticker?: string; side?: string }>();
  const portfolioId = params.portfolioId ?? "";
  const { data: portfolio } = usePortfolio(portfolioId);
  const placeOrder = usePlaceOrder(portfolioId);

  const [step, setStep] = useState(0);
  const [side, setSide] = useState<"buy" | "sell">(params.side === "sell" ? "sell" : "buy");
  const [ticker, setTicker] = useState(params.ticker ?? "");
  const [tickerSelected, setTickerSelected] = useState(!!params.ticker);
  const [inputMode, setInputMode] = useState<"shares" | "amount">("shares");
  const [amountValue, setAmountValue] = useState("");
  const [plan, setPlan] = useState({ reason: "", expectation: "", riskNoted: "", exitPlan: "" });
  const [stopPrice, setStopPrice] = useState("");
  const [emotion, setEmotion] = useState<EmotionalState | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ orderId: string; xpAwarded: number } | null>(null);

  const search = useTickerSearch(tickerSelected ? "" : ticker);

  const numericValue = Number(amountValue) || 0;
  const holding = portfolio?.positions.find((p) => p.ticker === ticker);
  const estValue = useMemo(() => {
    if (inputMode === "amount") return numericValue;
    const price = holding?.currentPrice;
    return price ? price * numericValue : undefined;
  }, [inputMode, numericValue, holding]);
  const portfolioPct = portfolio && estValue !== undefined && portfolio.totalValue > 0 ? Math.min(100, (estValue / portfolio.totalValue) * 100) : undefined;

  const stepValid = (): boolean => {
    switch (step) {
      case 0:
        return tickerSelected && ticker.length > 0 && numericValue > 0;
      case 1:
        return PLAN_QUESTIONS.every((q) => plan[q.key].trim().length >= 10);
      case 2:
        return emotion !== undefined;
      default:
        return true;
    }
  };

  const submit = () => {
    setError(null);
    placeOrder.mutate(
      {
        ticker,
        side,
        ...(inputMode === "shares" ? { quantity: numericValue } : { amount: numericValue }),
        plan: { ...plan, stopPrice: Number(stopPrice) || undefined, portfolioPct: portfolioPct ?? 0 },
        emotion: emotion!,
      },
      {
        onSuccess: (res) => setSuccess({ orderId: res.orderId, xpAwarded: res.xpAwarded }),
        onError: (e) => setError(e instanceof ApiError ? e.message : "No se pudo ejecutar la orden."),
      },
    );
  };

  if (success) {
    return (
      <SafeAreaView className="flex-1 bg-background dark:bg-backgroundDark items-center justify-center px-6">
        <Text className="text-5xl mb-4">📝</Text>
        <Text className="font-display text-ink dark:text-inkDark text-xl text-center">Operación registrada con plan</Text>
        <Text className="text-muted dark:text-mutedDark text-sm text-center mt-2">
          Lo importante no es si esta operación sale bien o mal: es que la decidiste con un proceso. Tu plan queda guardado en el diario.
        </Text>
        {success.xpAwarded > 0 ? (
          <View className="bg-accentSoft dark:bg-accentSoftDark px-4 py-2 rounded-full mt-4">
            <Text className="font-mono-bold text-accent dark:text-accentDark">+{success.xpAwarded} XP por planificar</Text>
          </View>
        ) : null}
        <Pressable className="bg-primary dark:bg-primaryDark rounded-xl px-8 py-3.5 mt-8" onPress={() => router.back()}>
          <Text className="font-sans-bold text-white">Volver a la cartera</Text>
        </Pressable>
        <Pressable className="mt-3" onPress={() => router.replace("/(tabs)/practice?tab=diario")}>
          <Text className="text-primary dark:text-primaryDark text-sm">Ver en tu diario</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-backgroundDark" edges={["top"]}>
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View className="flex-1 px-4">
          <View className="flex-row items-center gap-3 mt-2">
            <Pressable onPress={() => (step === 0 ? router.back() : setStep((s) => s - 1))} hitSlop={10}>
              <Text className="text-muted dark:text-mutedDark text-xl">{step === 0 ? "✕" : "‹"}</Text>
            </Pressable>
            <View className="flex-1 flex-row items-center justify-center gap-2">
              {STEPS.map((label, i) => (
                <View key={label} className={cn("h-1.5 rounded-full flex-1", i <= step ? "bg-primary dark:bg-primaryDark" : "bg-surface dark:bg-surfaceDark")} />
              ))}
            </View>
            <Text className="text-muted dark:text-mutedDark text-xs w-16 text-right">{STEPS[step]}</Text>
          </View>

          <ScrollView className="flex-1 mt-4" contentContainerStyle={{ paddingBottom: 16 }} keyboardShouldPersistTaps="handled">
            {step === 0 ? (
              <View>
                <Text className="text-ink dark:text-inkDark font-display text-xl mb-4">{side === "buy" ? "¿Qué quieres comprar?" : "¿Qué quieres vender?"}</Text>

                <View className="flex-row gap-2 mb-4">
                  {(["buy", "sell"] as const).map((s) => (
                    <Pressable key={s} className="flex-1" onPress={() => setSide(s)}>
                      <View className={cn("py-2.5 rounded-xl items-center border", side === s ? "bg-primarySoft dark:bg-primarySoftDark border-primary dark:border-primaryDark" : "border-border dark:border-borderDark")}>
                        <Text className={cn("text-sm font-sans-semibold", side === s ? "text-primary dark:text-primaryDark" : "text-muted dark:text-mutedDark")}>
                          {s === "buy" ? "Comprar" : "Vender"}
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                </View>

                <Text className="text-ink dark:text-inkDark text-sm font-medium mb-1">Empresa</Text>
                <TextInput
                  value={ticker}
                  onChangeText={(t) => {
                    setTicker(t.toUpperCase());
                    setTickerSelected(false);
                  }}
                  autoCapitalize="characters"
                  placeholder="Busca por nombre o ticker..."
                  placeholderTextColor="#8a8998"
                  className="border border-border dark:border-borderDark rounded-xl px-3 py-2.5 text-ink dark:text-inkDark"
                />
                {!tickerSelected && ticker.length > 0 && search.data?.results.length ? (
                  <View className="border border-border dark:border-borderDark rounded-xl mt-1 overflow-hidden max-h-56">
                    <ScrollView nestedScrollEnabled>
                      {search.data.results.map((r) => (
                        <Pressable
                          key={r.ticker}
                          className="px-3 py-2.5 bg-card dark:bg-cardDark border-b border-border dark:border-borderDark"
                          onPress={() => {
                            setTicker(r.ticker);
                            setTickerSelected(true);
                          }}
                        >
                          <Text className="text-ink dark:text-inkDark text-sm">
                            {r.ticker} <Text className="text-muted dark:text-mutedDark">· {r.name}</Text>
                          </Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                ) : null}

                <Text className="text-ink dark:text-inkDark text-sm font-medium mb-1 mt-4">
                  {inputMode === "shares" ? "Cantidad de acciones" : "Importe en dólares"}
                </Text>
                <TextInput
                  value={amountValue}
                  onChangeText={setAmountValue}
                  keyboardType="numeric"
                  placeholder={inputMode === "shares" ? "ej. 5" : "ej. 2500"}
                  placeholderTextColor="#8a8998"
                  className="border border-border dark:border-borderDark rounded-xl px-3 py-2.5 text-ink dark:text-inkDark"
                />
                <Pressable onPress={() => setInputMode((m) => (m === "shares" ? "amount" : "shares"))}>
                  <Text className="text-primary dark:text-primaryDark text-xs mt-2">
                    {inputMode === "shares" ? "Prefiero indicar un importe ($)" : "Prefiero indicar un número de acciones"}
                  </Text>
                </Pressable>

                {portfolioPct !== undefined ? (
                  <Card className="mt-4">
                    <Text className="text-muted dark:text-mutedDark text-xs">
                      Esta orden representa el <Text className="font-mono-bold text-ink dark:text-inkDark">{portfolioPct.toFixed(1)}%</Text> de tu cartera
                      {estValue !== undefined ? ` (~$${estValue.toFixed(2)})` : ""}.
                    </Text>
                    {portfolioPct > 20 ? (
                      <Text className="text-negative dark:text-negativeDark text-xs mt-1">
                        Más del 20% en una sola posición es mucha concentración. No está prohibido -- pero ¿lo has decidido o te ha salido solo?
                      </Text>
                    ) : null}
                  </Card>
                ) : null}
              </View>
            ) : null}

            {step === 1 ? (
              <View>
                <Text className="font-display text-ink dark:text-inkDark text-xl mb-1">Tu plan</Text>
                <Text className="text-muted dark:text-mutedDark text-xs mb-4">
                  Responder esto ANTES de operar es lo que separa invertir de apostar. Mínimo unas palabras por respuesta.
                </Text>
                {PLAN_QUESTIONS.map((q) => (
                  <View key={q.key} className="mb-4">
                    <Text className="text-ink dark:text-inkDark text-sm font-medium mb-1">{q.label}</Text>
                    <TextInput
                      value={plan[q.key]}
                      onChangeText={(t) => setPlan((p) => ({ ...p, [q.key]: t }))}
                      multiline
                      numberOfLines={3}
                      placeholder={q.placeholder}
                      placeholderTextColor="#8a8998"
                      className="border border-border dark:border-borderDark rounded-xl px-3 py-2.5 text-ink dark:text-inkDark min-h-[72px]"
                      textAlignVertical="top"
                    />
                  </View>
                ))}
                <Text className="text-ink dark:text-inkDark text-sm font-medium mb-1">Stop (precio de salida si te equivocas, opcional)</Text>
                <TextInput
                  value={stopPrice}
                  onChangeText={setStopPrice}
                  keyboardType="numeric"
                  placeholder="ej. 170"
                  placeholderTextColor="#8a8998"
                  className="border border-border dark:border-borderDark rounded-xl px-3 py-2.5 text-ink dark:text-inkDark"
                />
              </View>
            ) : null}

            {step === 2 ? (
              <View>
                <Text className="font-display text-ink dark:text-inkDark text-xl mb-1">¿Cómo te sientes ahora mismo?</Text>
                <Text className="text-muted dark:text-mutedDark text-xs mb-4">
                  Sin juicio. Conocer tu estado emocional al operar es una de las herramientas más potentes que existen.
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {EMOTIONAL_STATES.map((e) => (
                    <Pressable key={e} onPress={() => setEmotion(e)}>
                      <View className={cn("flex-row items-center gap-1.5 px-3.5 py-2.5 rounded-full border", emotion === e ? "bg-primarySoft dark:bg-primarySoftDark border-primary dark:border-primaryDark" : "border-border dark:border-borderDark")}>
                        <Text>{EMOTION_LABELS[e].emoji}</Text>
                        <Text className={cn("text-sm", emotion === e ? "text-primary dark:text-primaryDark font-medium" : "text-ink dark:text-inkDark")}>
                          {EMOTION_LABELS[e].label}
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
                {emotion && ALERT_EMOTIONS.includes(emotion) ? (
                  <Card className="mt-4 border-accent dark:border-accentDark">
                    <Text className="text-ink dark:text-inkDark text-sm">
                      Respira. {EMOTION_LABELS[emotion].label} es una de las emociones que más operaciones malas provoca. ¿Tu plan sigue teniendo sentido si el precio no se mueve en una semana?
                    </Text>
                  </Card>
                ) : null}
              </View>
            ) : null}

            {step === 3 ? (
              <View>
                <Text className="font-display text-ink dark:text-inkDark text-xl mb-4">Confirma tu operación</Text>
                <Card>
                  <Row label="Operación" value={`${side === "buy" ? "Comprar" : "Vender"} ${ticker}`} />
                  <Row label={inputMode === "shares" ? "Acciones" : "Importe"} value={inputMode === "shares" ? String(numericValue) : `$${numericValue}`} />
                  {portfolioPct !== undefined ? <Row label="% de cartera" value={`${portfolioPct.toFixed(1)}%`} /> : null}
                  {stopPrice ? <Row label="Stop" value={`$${stopPrice}`} /> : null}
                  {emotion ? <Row label="Estado emocional" value={`${EMOTION_LABELS[emotion].emoji} ${EMOTION_LABELS[emotion].label}`} /> : null}
                </Card>
                <Card className="mt-3">
                  <Text className="text-muted dark:text-mutedDark text-xs mb-1">Tu plan</Text>
                  <Text className="text-ink dark:text-inkDark text-sm leading-5">{plan.reason}</Text>
                  <Text className="text-muted dark:text-mutedDark text-xs mt-3 mb-1">Saldrás si...</Text>
                  <Text className="text-ink dark:text-inkDark text-sm leading-5">{plan.exitPlan}</Text>
                </Card>
                {error ? <Text className="text-negative dark:text-negativeDark text-sm mt-3">{error}</Text> : null}
              </View>
            ) : null}
          </ScrollView>

          <Pressable
            className={cn("rounded-xl py-3.5 items-center mb-4", !stepValid() || placeOrder.isPending ? "bg-surface dark:bg-surfaceDark" : "bg-primary dark:bg-primaryDark")}
            disabled={!stepValid() || placeOrder.isPending}
            onPress={() => (step === 3 ? submit() : setStep((s) => s + 1))}
          >
            <Text className={cn("font-sans-bold", !stepValid() || placeOrder.isPending ? "text-muted dark:text-mutedDark" : "text-white")}>
              {placeOrder.isPending ? "Ejecutando..." : step === 3 ? `${side === "buy" ? "Comprar" : "Vender"} con plan` : "Continuar"}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between py-1.5">
      <Text className="text-muted dark:text-mutedDark text-sm">{label}</Text>
      <Text className="font-mono text-ink dark:text-inkDark text-sm">{value}</Text>
    </View>
  );
}
