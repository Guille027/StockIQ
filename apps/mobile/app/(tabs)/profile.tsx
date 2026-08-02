import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { useCoachReview, useProfile } from "@/api/hooks";
import { ApiError } from "@/api/client";
import { Card } from "@/components/Card";
import { CoachFeedbackCard } from "@/components/CoachFeedbackCard";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { cn } from "@/utils/cn";

const KIND_LABELS: Record<string, string> = {
  lesson: "Lección completada",
  lesson_perfect: "Quiz perfecto",
  lesson_review: "Repaso de lección",
  trade_plan: "Plan de operación",
  coach_feedback: "Feedback del mentor",
  reflection: "Reflexión escrita",
  analysis: "Empresa analizada",
  streak: "Racha diaria",
};

export default function ProfileScreen() {
  const { data, isLoading, isError, refetch } = useProfile();
  const review = useCoachReview();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-backgroundDark" edges={["top"]}>
      {isLoading ? <LoadingState label="Cargando tu progreso..." /> : null}
      {isError ? <ErrorState message="No se pudo conectar con el servidor." onRetry={() => refetch()} /> : null}

      {data ? (
        <ScrollView className="px-4" contentContainerStyle={{ paddingBottom: 32 }}>
          <View className="flex-row items-center justify-between mt-2 mb-4">
            <Text className="text-2xl font-bold text-ink dark:text-inkDark">Perfil</Text>
            <Pressable onPress={() => router.push("/settings")} hitSlop={8}>
              <Ionicons name="settings-outline" size={22} color={isDark ? "#98A0AA" : "#77716A"} />
            </Pressable>
          </View>

          <Card>
            <Text className="text-muted dark:text-mutedDark text-xs">Rango {data.rank}</Text>
            <Text className="text-ink dark:text-inkDark text-xl font-bold mt-0.5">{data.rankName}</Text>
            <View className="h-2.5 bg-surface dark:bg-surfaceDark rounded-full mt-3 overflow-hidden">
              <View
                className="h-2.5 bg-primary dark:bg-primaryDark rounded-full"
                style={{ width: `${data.xpForNextRank ? Math.min(100, (data.xpIntoRank / data.xpForNextRank) * 100) : 100}%` }}
              />
            </View>
            <Text className="text-muted dark:text-mutedDark text-xs mt-1.5">
              {data.xpForNextRank !== undefined
                ? `${data.xpIntoRank} / ${data.xpForNextRank} XP para el siguiente rango`
                : "Rango máximo alcanzado"}
              {"  ·  "}
              {data.xpTotal} XP en total
            </Text>
          </Card>

          <View className="flex-row gap-2 mt-3">
            <Card className="flex-1 items-center py-3">
              <Text className="text-lg font-bold text-ink dark:text-inkDark">🔥 {data.currentStreak}</Text>
              <Text className="text-muted dark:text-mutedDark text-[11px] mt-0.5">Racha actual</Text>
            </Card>
            <Card className="flex-1 items-center py-3">
              <Text className="text-lg font-bold text-ink dark:text-inkDark">{data.lessonsCompleted}</Text>
              <Text className="text-muted dark:text-mutedDark text-[11px] mt-0.5">Lecciones</Text>
            </Card>
            <Card className="flex-1 items-center py-3">
              <Text className="text-lg font-bold text-ink dark:text-inkDark">{data.tradesPlanned}</Text>
              <Text className="text-muted dark:text-mutedDark text-[11px] mt-0.5">Planes de trade</Text>
            </Card>
          </View>

          <Text className="text-ink dark:text-inkDark font-semibold mt-5 mb-2">Revisión del mentor</Text>
          {review.data ? (
            <CoachFeedbackCard feedback={review.data.feedback} />
          ) : (
            <Card>
              <Text className="text-muted dark:text-mutedDark text-sm mb-3">
                Pide a tu mentor una revisión de tus últimas operaciones: patrones repetidos, emociones al operar y disciplina con tus propios planes.
              </Text>
              <Pressable
                onPress={() => review.mutate()}
                disabled={review.isPending}
                className={cn("rounded-xl py-3 items-center", review.isPending ? "bg-surface dark:bg-surfaceDark" : "bg-primary")}
              >
                <Text className={cn("font-semibold", review.isPending ? "text-muted dark:text-mutedDark" : "text-white")}>
                  {review.isPending ? "Revisando tus operaciones..." : "🧑‍🏫 Pedir revisión"}
                </Text>
              </Pressable>
              {review.isError ? (
                <Text className="text-negative dark:text-negativeDark text-xs mt-2">
                  {review.error instanceof ApiError ? review.error.message : "No se pudo generar la revisión."}
                </Text>
              ) : null}
            </Card>
          )}

          <Text className="text-ink dark:text-inkDark font-semibold mt-5 mb-2">Actividad reciente</Text>
          {data.recentEvents.length === 0 ? (
            <Card>
              <Text className="text-muted dark:text-mutedDark text-sm">
                Todavía no hay actividad. Completa tu primera lección en la pestaña Aprender: cada paso que des suma experiencia. Aquí nunca ganarás XP por obtener beneficios -- solo por aprender.
              </Text>
            </Card>
          ) : (
            <View className="gap-2">
              {data.recentEvents.map((e) => (
                <Card key={e.id} className="flex-row items-center justify-between py-3">
                  <View className="flex-1 pr-2">
                    <Text className="text-ink dark:text-inkDark text-sm font-medium">{KIND_LABELS[e.kind] ?? e.kind}</Text>
                    <Text className="text-muted dark:text-mutedDark text-[11px] mt-0.5">{new Date(e.createdAt).toLocaleDateString()}</Text>
                  </View>
                  <Text className="text-accent dark:text-accentDark font-semibold text-sm">+{e.amount} XP</Text>
                </Card>
              ))}
            </View>
          )}
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}
