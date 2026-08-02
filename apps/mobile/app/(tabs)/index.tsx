import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import type { RoadmapLesson, RoadmapLevel } from "@stockiq/shared-types";
import { useProfile, useRoadmap } from "@/api/hooks";
import { Card } from "@/components/Card";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { cn } from "@/utils/cn";

/** Aprender: the Duolingo-style level path. This is the app's identity now. */
export default function LearnScreen() {
  const { data, isLoading, isError, refetch } = useRoadmap();
  const { data: profile } = useProfile();

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-backgroundDark" edges={["top"]}>
      {isLoading ? <LoadingState label="Cargando tu camino..." /> : null}
      {isError ? <ErrorState message="No se pudo conectar con el servidor. Revisa que la API esté corriendo." onRetry={() => refetch()} /> : null}

      {data ? (
        <ScrollView className="px-4" contentContainerStyle={{ paddingBottom: 32 }}>
          <View className="flex-row items-center justify-between mt-2">
            <Text className="text-2xl font-bold text-ink dark:text-inkDark">Aprender</Text>
            {profile ? (
              <View className="flex-row items-center gap-2">
                {profile.currentStreak > 0 ? (
                  <View className="flex-row items-center bg-accent/15 px-2.5 py-1 rounded-full">
                    <Text className="text-accent dark:text-accentDark text-xs font-semibold">🔥 {profile.currentStreak}</Text>
                  </View>
                ) : null}
                <View className="bg-primary/10 px-2.5 py-1 rounded-full">
                  <Text className="text-primary dark:text-primaryDark text-xs font-semibold">{profile.xpTotal} XP</Text>
                </View>
              </View>
            ) : null}
          </View>
          <Text className="text-muted dark:text-mutedDark text-sm mt-1 mb-4">
            Paso a paso, hasta analizar empresas por tu cuenta. Sin atajos, sin señales.
          </Text>

          {data.levels.map((level) => (
            <LevelSection key={level.id} level={level} />
          ))}
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}

function LevelSection({ level }: { level: RoadmapLevel }) {
  const locked = level.status === "locked";
  const hasLessons = level.lessons.length > 0;

  return (
    <View className="mb-5">
      <View className="flex-row items-center gap-2 mb-2">
        <Text className={cn("text-xl", locked && "opacity-40")}>{level.icon}</Text>
        <View className="flex-1">
          <Text className={cn("font-bold text-ink dark:text-inkDark", locked && "opacity-40")}>
            Nivel {level.order} · {level.title}
          </Text>
        </View>
        {level.status === "completed" ? <Text className="text-positive dark:text-positiveDark text-xs font-semibold">✓ Completado</Text> : null}
        {locked ? <Text className="text-muted dark:text-mutedDark text-xs">🔒</Text> : null}
      </View>
      <Text className={cn("text-muted dark:text-mutedDark text-xs mb-2", locked && "opacity-60")}>{level.description}</Text>

      {locked || !hasLessons ? (
        <Card className="opacity-60">
          <Text className="text-muted dark:text-mutedDark text-sm">
            {hasLessons || locked ? (locked && hasLessons ? "Completa el nivel anterior para desbloquear." : "Próximamente") : "Próximamente"}
          </Text>
        </Card>
      ) : (
        <View className="gap-2">
          {level.lessons.map((lesson) => (
            <LessonRow key={lesson.id} lesson={lesson} />
          ))}
        </View>
      )}
    </View>
  );
}

function LessonRow({ lesson }: { lesson: RoadmapLesson }) {
  const done = lesson.status === "completed";
  return (
    <Pressable onPress={() => router.push(`/lesson/${lesson.id}`)}>
      <Card className="flex-row items-center gap-3">
        <View
          className={cn(
            "w-9 h-9 rounded-full items-center justify-center",
            done ? "bg-positive/15" : "bg-primary/10",
          )}
        >
          <Text className="text-base">{done ? "✅" : "📘"}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-ink dark:text-inkDark font-medium">{lesson.title}</Text>
          <Text className="text-muted dark:text-mutedDark text-xs mt-0.5" numberOfLines={1}>
            {done && lesson.bestScorePct !== undefined ? `Mejor puntuación: ${Math.round(lesson.bestScorePct)}%` : `${lesson.estimatedMinutes} min · ${lesson.description}`}
          </Text>
        </View>
        <Text className="text-muted dark:text-mutedDark">›</Text>
      </Card>
    </Pressable>
  );
}
