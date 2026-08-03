import { useMemo } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import type { RoadmapLesson, RoadmapLevel } from "@stockiq/shared-types";
import { useProfile, useRoadmap } from "@/api/hooks";
import { Card } from "@/components/Card";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { StreakFlame } from "@/components/StreakFlame";
import { LEVEL_ACCENTS, LessonPathNode, type LessonNodeAlign, type LessonNodeStatus, type LevelAccent } from "@/components/LessonPathNode";

interface PathRow {
  levelId: string;
  levelOrder: number;
  levelTitle: string;
  lessonId: string;
  title: string;
  sub: string;
  status: LessonNodeStatus;
  align: LessonNodeAlign;
  accent: LevelAccent;
}

const ALIGNS: LessonNodeAlign[] = ["flex-start", "center", "flex-end"];

/** Aprender: the Duolingo-style level path. This is the app's identity now. */
export default function LearnScreen() {
  const { data, isLoading, isError, refetch } = useRoadmap();
  const { data: profile } = useProfile();

  const { rows, banner } = useMemo(() => buildPath(data?.levels ?? []), [data]);

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-backgroundDark" edges={["top"]}>
      {isLoading ? <LoadingState label="Cargando tu camino..." /> : null}
      {isError ? <ErrorState message="No se pudo conectar con el servidor. Revisa que la API esté corriendo." onRetry={() => refetch()} /> : null}

      {data ? (
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          {banner ? (
            <LinearGradient
              colors={[banner.accent.light, banner.accent.mid]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ paddingTop: 18, paddingHorizontal: 20, paddingBottom: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}
            >
              <View className="flex-row items-center justify-between mb-3.5">
                {profile ? (
                  <View className="flex-row items-center gap-1" style={{ backgroundColor: "rgba(16,16,25,0.16)", borderRadius: 999, paddingVertical: 5, paddingHorizontal: 10 }}>
                    <StreakFlame size={13} color={banner.accent.shadow} />
                    <Text className="font-mono-bold text-[13px]" style={{ color: banner.accent.shadow }}>
                      {profile.currentStreak}
                    </Text>
                  </View>
                ) : (
                  <View />
                )}
                {profile ? (
                  <View style={{ backgroundColor: "rgba(16,16,25,0.16)", borderRadius: 999, paddingVertical: 5, paddingHorizontal: 12 }}>
                    <Text className="font-mono-bold text-[13px]" style={{ color: banner.accent.shadow }}>
                      {profile.xpTotal} XP
                    </Text>
                  </View>
                ) : null}
              </View>
              <Text className="font-mono-bold text-[11px] tracking-wide uppercase mb-1" style={{ color: banner.accent.shadow, opacity: 0.75 }}>
                Nivel {banner.levelOrder}
              </Text>
              <Text className="font-display text-2xl" style={{ color: banner.accent.shadow }}>
                {banner.topic}
              </Text>
            </LinearGradient>
          ) : null}

          <View className="px-5 pt-5">
            {groupByLevel(rows).map((group) => (
              <View key={group.levelId} className="mb-6">
                <View className="flex-row items-center gap-2 mb-4">
                  <View className="rounded-md px-1.5 py-0.5" style={{ backgroundColor: group.accent.mid }}>
                    <Text className="font-mono-bold text-[11px]" style={{ color: "#101019" }}>
                      N{group.levelOrder}
                    </Text>
                  </View>
                  <Text className="font-display-semibold text-[16px] text-ink dark:text-inkDark">{group.levelTitle}</Text>
                </View>

                {group.rows.length === 0 ? (
                  <Card className="opacity-60">
                    <Text className="text-muted dark:text-mutedDark text-sm">Próximamente</Text>
                  </Card>
                ) : (
                  group.rows.map((row) => (
                    <LessonPathNode
                      key={row.lessonId}
                      status={row.status}
                      accent={row.accent}
                      title={row.title}
                      sub={row.sub}
                      align={row.align}
                      onPress={() => {
                        if (row.status !== "locked") router.push(`/lesson/${row.lessonId}`);
                      }}
                    />
                  ))
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}

function groupByLevel(rows: PathRow[]) {
  const groups = new Map<string, { levelId: string; levelOrder: number; levelTitle: string; accent: LevelAccent; rows: PathRow[] }>();
  for (const row of rows) {
    if (!groups.has(row.levelId)) {
      groups.set(row.levelId, { levelId: row.levelId, levelOrder: row.levelOrder, levelTitle: row.levelTitle, accent: row.accent, rows: [] });
    }
    groups.get(row.levelId)!.rows.push(row);
  }
  return [...groups.values()];
}

function buildPath(levels: RoadmapLevel[]) {
  const rows: PathRow[] = [];
  let li = 0;
  let foundCurrent = false;
  let banner: { topic: string; levelOrder: number; accent: LevelAccent } | undefined;
  let firstLevelBanner: { topic: string; levelOrder: number; accent: LevelAccent } | undefined;

  for (const level of levels) {
    const accent = LEVEL_ACCENTS[level.order % LEVEL_ACCENTS.length];
    if (!firstLevelBanner) firstLevelBanner = { topic: level.title, levelOrder: level.order, accent };

    for (const lesson of level.lessons as RoadmapLesson[]) {
      const align = ALIGNS[li % 3];
      li++;

      let status: LessonNodeStatus;
      if (lesson.status === "completed") status = "done";
      else if (level.status === "locked") status = "locked";
      else if (!foundCurrent) {
        status = "current";
        foundCurrent = true;
        banner = { topic: level.title, levelOrder: level.order, accent };
      } else status = "available";

      rows.push({
        levelId: level.id,
        levelOrder: level.order,
        levelTitle: level.title,
        lessonId: lesson.id,
        title: lesson.title,
        sub: status === "done" && lesson.bestScorePct !== undefined ? `${Math.round(lesson.bestScorePct)}%` : `${lesson.estimatedMinutes} min`,
        status,
        align,
        accent,
      });
    }
  }

  return { rows, banner: banner ?? firstLevelBanner };
}
