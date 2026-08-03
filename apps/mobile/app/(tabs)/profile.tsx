import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import { useColorScheme } from "nativewind";
import { useCoachReview, useProfile } from "@/api/hooks";
import { ApiError } from "@/api/client";
import { Card } from "@/components/Card";
import { CoachFeedbackCard } from "@/components/CoachFeedbackCard";
import { XpBar } from "@/components/XpBar";
import { StreakFlame } from "@/components/StreakFlame";
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

// The rank card is the ONE place in the app that breaks from the flat
// paper/surface palette -- a brand gradient, so it reads as "the achievements
// screen of a game" rather than another list item. Text on it is dark ink,
// not white: the gradient is a light-mid purple, not a deep navy.
const GRADIENT = { light: ["#cabdff", "#6a56d6"] as const, dark: ["#8b7cf6", "#6a5ad6"] as const };

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
            <Text className="font-display text-2xl text-ink dark:text-inkDark">Perfil</Text>
            <View className="flex-row items-center gap-1">
              <Pressable onPress={() => router.push("/explore")} hitSlop={8} className="w-9 h-9 items-center justify-center">
                <Svg width={19} height={19} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M4 17l5-6 4 3 7-9M15 5h5v5"
                    stroke={isDark ? "#8a8998" : "#6b6a72"}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </Pressable>
              <Pressable onPress={() => router.push("/settings")} hitSlop={8} className="w-9 h-9 items-center justify-center">
                <Ionicons name="settings-outline" size={20} color={isDark ? "#8a8998" : "#6b6a72"} />
              </Pressable>
            </View>
          </View>

          <LinearGradient
            colors={isDark ? GRADIENT.dark : GRADIENT.light}
            start={{ x: 0.1, y: 0 }}
            end={{ x: 0.9, y: 1 }}
            style={{ borderRadius: 20, padding: 20, overflow: "hidden" }}
          >
            <View className="absolute -right-8 -top-8 w-36 h-36 rounded-full" style={{ backgroundColor: "rgba(16,16,25,0.08)" }} />
            <Text className="font-mono-bold text-[11px] tracking-wide uppercase" style={{ color: "rgba(16,16,25,0.6)" }}>
              Rango {data.rank}
            </Text>
            <Text className="font-display text-2xl mt-1" style={{ color: "#101019" }}>
              {data.rankName}
            </Text>
            <View className="mt-4">
              <XpBar xpIntoRank={data.xpIntoRank} xpForNextRank={data.xpForNextRank} variant="onBrand" />
            </View>
          </LinearGradient>

          <View className="flex-row gap-2 mt-3">
            <Card className="flex-1 items-center py-3.5">
              <View className="flex-row items-center gap-1.5">
                <StreakFlame size={16} />
                <Text className="font-mono-bold text-ink dark:text-inkDark text-lg">{data.currentStreak}</Text>
              </View>
              <Text className="text-muted dark:text-mutedDark text-[11px] mt-1">Racha actual</Text>
            </Card>
            <Card className="flex-1 items-center py-3.5">
              <Text className="font-mono-bold text-ink dark:text-inkDark text-lg">{data.lessonsCompleted}</Text>
              <Text className="text-muted dark:text-mutedDark text-[11px] mt-1">Lecciones</Text>
            </Card>
            <Card className="flex-1 items-center py-3.5">
              <Text className="font-mono-bold text-ink dark:text-inkDark text-lg">{data.tradesPlanned}</Text>
              <Text className="text-muted dark:text-mutedDark text-[11px] mt-1">Planes de trade</Text>
            </Card>
          </View>

          <Text className="font-sans-bold text-ink dark:text-inkDark mt-6 mb-2">Revisión del mentor</Text>
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
                className={cn("rounded-xl py-3 items-center", review.isPending ? "bg-surface dark:bg-surfaceDark" : "bg-primary dark:bg-primaryDark")}
              >
                <Text className={cn("font-sans-bold", review.isPending ? "text-muted dark:text-mutedDark" : "text-white")}>
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

          <Text className="font-sans-bold text-ink dark:text-inkDark mt-6 mb-2">Actividad reciente</Text>
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
                    <Text className="font-sans-semibold text-ink dark:text-inkDark text-sm">{KIND_LABELS[e.kind] ?? e.kind}</Text>
                    <Text className="text-muted dark:text-mutedDark text-[11px] mt-0.5">{new Date(e.createdAt).toLocaleDateString()}</Text>
                  </View>
                  <Text className="font-mono-bold text-accent dark:text-accentDark text-sm">+{e.amount} XP</Text>
                </Card>
              ))}
            </View>
          )}
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}
