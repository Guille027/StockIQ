import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import type { RoadmapLesson, RoadmapLevel } from "@stockiq/shared-types";
import { useProfile, useRoadmap } from "@/api/hooks";
import { Card } from "@/components/Card";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { LessonIcon } from "@/components/LessonIcon";
import { StreakFlame } from "@/components/StreakFlame";
import { PressableScale } from "@/components/PressableScale";
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
            <Text className="font-display text-2xl text-ink dark:text-inkDark">Aprender</Text>
            {profile ? (
              <View className="flex-row items-center gap-2">
                {profile.currentStreak > 0 ? (
                  <View className="flex-row items-center gap-1.5 bg-accentSoft dark:bg-accentSoftDark px-2.5 py-1 rounded-full">
                    <StreakFlame size={14} />
                    <Text className="font-mono-bold text-accent dark:text-accentDark text-xs">{profile.currentStreak}</Text>
                  </View>
                ) : null}
                <View className="bg-primarySoft dark:bg-primarySoftDark px-2.5 py-1 rounded-full">
                  <Text className="font-mono-bold text-primary dark:text-primaryDark text-xs">{profile.xpTotal} XP</Text>
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
          <Text className={cn("font-sans-bold text-ink dark:text-inkDark text-[15px]", locked && "opacity-40")}>
            Nivel {level.order} · {level.title}
          </Text>
        </View>
        {level.status === "completed" ? (
          <Text className="font-sans-bold text-positive dark:text-positiveDark text-xs">✓ Completado</Text>
        ) : null}
        {locked ? (
          <View className="w-5 h-5 items-center justify-center opacity-50">
            <Text style={{ fontSize: 13 }}>🔒</Text>
          </View>
        ) : null}
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
    <PressableScale onPress={() => router.push(`/lesson/${lesson.id}`)}>
      <Card className="flex-row items-center gap-3">
        <LessonIcon status={done ? "completed" : "available"} />
        <View className="flex-1">
          <Text className="font-sans-bold text-ink dark:text-inkDark text-[14.5px]">{lesson.title}</Text>
          <Text className="text-muted dark:text-mutedDark text-xs mt-0.5" numberOfLines={1}>
            {done && lesson.bestScorePct !== undefined ? (
              <>
                Mejor puntuación: <Text className="font-mono text-muted dark:text-mutedDark text-xs">{Math.round(lesson.bestScorePct)}%</Text>
              </>
            ) : (
              `${lesson.estimatedMinutes} min · ${lesson.description}`
            )}
          </Text>
        </View>
        <Text className="text-muted dark:text-mutedDark">›</Text>
      </Card>
    </PressableScale>
  );
}
