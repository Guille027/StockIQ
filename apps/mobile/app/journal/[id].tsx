import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useLocalSearchParams } from "expo-router";
import { EMOTION_LABELS } from "@stockiq/shared-types";
import { useCoachFeedback, useJournalEntry, useRequestCoachFeedback, useSaveReflection } from "@/api/hooks";
import { Card } from "@/components/Card";
import { CoachFeedbackCard } from "@/components/CoachFeedbackCard";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { cn } from "@/utils/cn";

export default function JournalEntryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: entry, isLoading, isError, refetch } = useJournalEntry(id ?? "");
  const saveReflection = useSaveReflection(id ?? "");
  const isSell = entry?.kind === "trade" && entry.content.side === "sell";
  const coach = useCoachFeedback(isSell ? entry?.orderId : undefined);
  const requestCoach = useRequestCoachFeedback(entry?.orderId);

  const [editing, setEditing] = useState(false);
  const [reflection, setReflection] = useState("");
  const [mistakes, setMistakes] = useState("");
  const [learnings, setLearnings] = useState("");
  const [savedXp, setSavedXp] = useState<number | null>(null);

  const startEditing = () => {
    setReflection(entry?.content.reflection ?? "");
    setMistakes((entry?.content.mistakes ?? []).join("\n"));
    setLearnings((entry?.content.learnings ?? []).join("\n"));
    setEditing(true);
  };

  const submit = () => {
    saveReflection.mutate(
      {
        reflection: reflection.trim(),
        mistakes: mistakes.split("\n").map((s) => s.trim()).filter(Boolean),
        learnings: learnings.split("\n").map((s) => s.trim()).filter(Boolean),
      },
      {
        onSuccess: (res) => {
          setEditing(false);
          setSavedXp(res.xpAwarded);
        },
      },
    );
  };

  const plan = entry?.tradePlan;

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-backgroundDark" edges={[]}>
      <Stack.Screen options={{ headerShown: true, headerTitle: entry?.ticker ? `Diario · ${entry.ticker}` : "Diario", headerBackTitle: "Atrás" }} />

      {isLoading ? <LoadingState label="Cargando entrada..." /> : null}
      {isError ? <ErrorState message="No se pudo cargar la entrada." onRetry={() => refetch()} /> : null}

      {entry ? (
        <ScrollView className="px-4" contentContainerStyle={{ paddingBottom: 32, paddingTop: 16 }}>
          {entry.kind === "trade" ? (
            <>
              <Card>
                <View className="flex-row items-center justify-between">
                  <Text className="font-display text-ink dark:text-inkDark text-lg">
                    {entry.content.side === "buy" ? "Compra" : "Venta"} · {entry.ticker}
                  </Text>
                  {entry.content.emotion ? (
                    <View className="flex-row items-center gap-1 bg-surface dark:bg-surfaceDark px-2.5 py-1 rounded-full">
                      <Text>{EMOTION_LABELS[entry.content.emotion].emoji}</Text>
                      <Text className="text-muted dark:text-mutedDark text-xs">{EMOTION_LABELS[entry.content.emotion].label}</Text>
                    </View>
                  ) : null}
                </View>
                <Text className="font-mono text-muted dark:text-mutedDark text-xs mt-1">
                  {entry.content.quantity} acciones @ ${entry.content.price?.toFixed(2)} · {new Date(entry.createdAt).toLocaleString()}
                </Text>
                {entry.content.resultPct !== undefined ? (
                  <Text className={cn("font-mono-bold text-sm mt-2", entry.content.resultPct >= 0 ? "text-positive dark:text-positiveDark" : "text-negative dark:text-negativeDark")}>
                    Resultado realizado: {entry.content.resultPct >= 0 ? "+" : ""}
                    {(entry.content.resultPct * 100).toFixed(2)}%
                  </Text>
                ) : null}
              </Card>

              {plan ? (
                <>
                  <Text className="font-sans-bold text-ink dark:text-inkDark mt-6 mb-2">Tu plan al operar</Text>
                  <Card className="gap-3">
                    <PlanItem label="¿Por qué?" text={plan.reason} />
                    <PlanItem label="¿Qué esperabas?" text={plan.expectation} />
                    <PlanItem label="Riesgo que veías" text={plan.riskNoted} />
                    <PlanItem label="Salida si te equivocabas" text={plan.exitPlan} />
                    <View className="flex-row gap-4">
                      {plan.stopPrice ? <Text className="font-mono text-muted dark:text-mutedDark text-xs">Stop: ${plan.stopPrice}</Text> : null}
                      <Text className="font-mono text-muted dark:text-mutedDark text-xs">Tamaño: {plan.portfolioPct.toFixed(1)}% de la cartera</Text>
                    </View>
                  </Card>
                </>
              ) : null}
            </>
          ) : (
            <Card>
              <Text className="text-ink dark:text-inkDark text-base leading-6">{entry.content.text}</Text>
              <Text className="text-muted dark:text-mutedDark text-xs mt-2">{new Date(entry.createdAt).toLocaleString()}</Text>
            </Card>
          )}

          {isSell ? (
            <>
              <Text className="font-sans-bold text-ink dark:text-inkDark mt-6 mb-2">Feedback del mentor</Text>
              {coach.data ? (
                <>
                  {requestCoach.data && requestCoach.data.xpAwarded > 0 ? (
                    <View className="bg-accentSoft dark:bg-accentSoftDark px-3 py-2 rounded-lg mb-2 self-start">
                      <Text className="font-mono-bold text-accent dark:text-accentDark text-xs">+{requestCoach.data.xpAwarded} XP por revisar tu operación</Text>
                    </View>
                  ) : null}
                  <CoachFeedbackCard feedback={coach.data.feedback} />
                </>
              ) : (
                <Card>
                  <Text className="text-muted dark:text-mutedDark text-sm mb-3">
                    Tu mentor puede analizar esta operación: si seguiste tu plan, cómo influyó tu estado emocional y qué mejorar. Analiza tu proceso, nunca el resultado.
                  </Text>
                  <Pressable
                    onPress={() => requestCoach.mutate()}
                    disabled={requestCoach.isPending}
                    className={cn("rounded-xl py-3 items-center", requestCoach.isPending ? "bg-surface dark:bg-surfaceDark" : "bg-primary dark:bg-primaryDark")}
                  >
                    <Text className={cn("font-sans-bold", requestCoach.isPending ? "text-muted dark:text-mutedDark" : "text-white")}>
                      {requestCoach.isPending ? "Analizando tu operación..." : "🧑‍🏫 Pedir feedback del mentor"}
                    </Text>
                  </Pressable>
                  {requestCoach.isError ? (
                    <Text className="text-negative dark:text-negativeDark text-xs mt-2">No se pudo generar el feedback. Inténtalo de nuevo.</Text>
                  ) : null}
                </Card>
              )}
            </>
          ) : null}

          {entry.kind === "trade" ? (
            <>
              <Text className="font-sans-bold text-ink dark:text-inkDark mt-6 mb-2">Reflexión posterior</Text>

              {savedXp !== null && savedXp > 0 ? (
                <View className="bg-accentSoft dark:bg-accentSoftDark px-3 py-2 rounded-lg mb-2 self-start">
                  <Text className="font-mono-bold text-accent dark:text-accentDark text-xs">+{savedXp} XP por reflexionar</Text>
                </View>
              ) : null}

              {!editing && entry.content.reflection ? (
                <Card>
                  <Text className="text-ink dark:text-inkDark text-sm leading-5">{entry.content.reflection}</Text>
                  {entry.content.mistakes?.length ? (
                    <>
                      <Text className="font-sans-bold text-negative dark:text-negativeDark text-xs mt-3 mb-1">Errores detectados</Text>
                      {entry.content.mistakes.map((m, i) => (
                        <Text key={i} className="text-ink dark:text-inkDark text-sm">• {m}</Text>
                      ))}
                    </>
                  ) : null}
                  {entry.content.learnings?.length ? (
                    <>
                      <Text className="font-sans-bold text-positive dark:text-positiveDark text-xs mt-3 mb-1">Aprendizajes</Text>
                      {entry.content.learnings.map((l, i) => (
                        <Text key={i} className="text-ink dark:text-inkDark text-sm">• {l}</Text>
                      ))}
                    </>
                  ) : null}
                  <Pressable onPress={startEditing} className="mt-3">
                    <Text className="text-primary dark:text-primaryDark text-xs">Editar reflexión</Text>
                  </Pressable>
                </Card>
              ) : null}

              {!editing && !entry.content.reflection ? (
                <Card>
                  <Text className="text-muted dark:text-mutedDark text-sm mb-3">
                    {entry.content.side === "sell"
                      ? "La operación está cerrada. ¿Qué pasó comparado con tu plan? Aquí es donde de verdad se aprende."
                      : "Puedes escribir una reflexión en cualquier momento -- por ejemplo, si la tesis cambió desde que compraste."}
                  </Text>
                  <Pressable onPress={startEditing} className="bg-primary dark:bg-primaryDark rounded-xl py-3 items-center">
                    <Text className="font-sans-bold text-white">Escribir reflexión</Text>
                  </Pressable>
                </Card>
              ) : null}

              {editing ? (
                <Card>
                  <Text className="text-ink dark:text-inkDark text-sm font-medium mb-1">¿Qué pasó y qué harías distinto?</Text>
                  <TextInput
                    value={reflection}
                    onChangeText={setReflection}
                    multiline
                    placeholder="ej. Vendí antes de tiempo por miedo cuando mi plan decía aguantar hasta $200..."
                    placeholderTextColor="#98A0AA"
                    className="border border-border dark:border-borderDark rounded-xl px-3 py-2.5 text-ink dark:text-inkDark min-h-[90px] mb-3"
                    textAlignVertical="top"
                  />
                  <Text className="text-ink dark:text-inkDark text-sm font-medium mb-1">Errores (uno por línea)</Text>
                  <TextInput
                    value={mistakes}
                    onChangeText={setMistakes}
                    multiline
                    placeholder={"ej. No respeté mi stop\nOperé con FOMO"}
                    placeholderTextColor="#98A0AA"
                    className="border border-border dark:border-borderDark rounded-xl px-3 py-2.5 text-ink dark:text-inkDark min-h-[70px] mb-3"
                    textAlignVertical="top"
                  />
                  <Text className="text-ink dark:text-inkDark text-sm font-medium mb-1">Aprendizajes (uno por línea)</Text>
                  <TextInput
                    value={learnings}
                    onChangeText={setLearnings}
                    multiline
                    placeholder={"ej. Definir el stop antes de comprar, no después"}
                    placeholderTextColor="#98A0AA"
                    className="border border-border dark:border-borderDark rounded-xl px-3 py-2.5 text-ink dark:text-inkDark min-h-[70px] mb-3"
                    textAlignVertical="top"
                  />
                  <Pressable
                    onPress={submit}
                    disabled={reflection.trim().length < 10 || saveReflection.isPending}
                    className={cn("rounded-xl py-3 items-center", reflection.trim().length < 10 || saveReflection.isPending ? "bg-surface dark:bg-surfaceDark" : "bg-primary dark:bg-primaryDark")}
                  >
                    <Text className={cn("font-sans-bold", reflection.trim().length < 10 || saveReflection.isPending ? "text-muted dark:text-mutedDark" : "text-white")}>
                      {saveReflection.isPending ? "Guardando..." : "Guardar reflexión"}
                    </Text>
                  </Pressable>
                </Card>
              ) : null}
            </>
          ) : null}
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}

function PlanItem({ label, text }: { label: string; text: string }) {
  return (
    <View>
      <Text className="text-muted dark:text-mutedDark text-xs mb-0.5">{label}</Text>
      <Text className="text-ink dark:text-inkDark text-sm leading-5">{text}</Text>
    </View>
  );
}
