import { useEffect, useMemo, useRef, useState } from "react";
import { NativeScrollEvent, NativeSyntheticEvent, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
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

interface Group {
  levelId: string;
  levelOrder: number;
  levelTitle: string;
  accent: LevelAccent;
  rows: PathRow[];
}

const ALIGNS: LessonNodeAlign[] = ["flex-start", "center", "flex-end"];
/** How far a section's top can be above the viewport top before it stops
 * counting as "in view" -- keeps the header from flipping a beat too late. */
const SCROLL_TRIGGER_OFFSET = 32;

/** Aprender: the Duolingo-style level path. This is the app's identity now. */
export default function LearnScreen() {
  const { data, isLoading, isError, refetch } = useRoadmap();
  const { data: profile } = useProfile();

  const { rows, currentLevelId } = useMemo(() => buildPath(data?.levels ?? []), [data]);
  const groups = useMemo(() => groupByLevel(rows), [rows]);

  const scrollRef = useRef<ScrollView>(null);
  const offsetsRef = useRef<Record<string, number>>({});
  const scrolledToStart = useRef(false);
  const [activeGroupId, setActiveGroupId] = useState<string | undefined>(currentLevelId);

  useEffect(() => {
    scrolledToStart.current = false;
    setActiveGroupId(currentLevelId);
  }, [currentLevelId]);

  const active = groups.find((g) => g.levelId === activeGroupId) ?? groups[0];

  const tryScrollToCurrent = () => {
    if (scrolledToStart.current || !currentLevelId) return;
    const top = offsetsRef.current[currentLevelId];
    if (top === undefined) return;
    scrolledToStart.current = true;
    if (top > 40) scrollRef.current?.scrollTo({ y: top - 24, animated: false });
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    let candidate = groups[0]?.levelId;
    for (const g of groups) {
      const top = offsetsRef.current[g.levelId];
      if (top !== undefined && y + SCROLL_TRIGGER_OFFSET >= top) candidate = g.levelId;
    }
    if (candidate && candidate !== activeGroupId) setActiveGroupId(candidate);
  };

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-backgroundDark" edges={["top"]}>
      {isLoading ? <LoadingState label="Cargando tu camino..." /> : null}
      {isError ? <ErrorState message="No se pudo conectar con el servidor. Revisa que la API esté corriendo." onRetry={() => refetch()} /> : null}

      {data && active ? (
        <>
          {/* Pinned above the scroll content, not part of it -- like Duolingo's
              unit banner, it reads whatever level section is currently in
              view rather than a fixed snapshot of overall progress. */}
          <RoadmapHeader accent={active.accent} levelOrder={active.levelOrder} topic={active.levelTitle} profile={profile} />

          <ScrollView
            ref={scrollRef}
            onScroll={handleScroll}
            scrollEventThrottle={32}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            <View className="px-5 pt-5">
              {groups.map((group) => (
                <View
                  key={group.levelId}
                  className="mb-6"
                  onLayout={(e) => {
                    offsetsRef.current[group.levelId] = e.nativeEvent.layout.y;
                    tryScrollToCurrent();
                  }}
                >
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
                    group.rows.map((row, i) => (
                      <LessonPathNode
                        key={row.lessonId}
                        index={i}
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
        </>
      ) : null}
    </SafeAreaView>
  );
}

function RoadmapHeader({
  accent,
  levelOrder,
  topic,
  profile,
}: {
  accent: LevelAccent;
  levelOrder: number;
  topic: string;
  profile: { currentStreak: number; xpTotal: number } | undefined;
}) {
  return (
    <View style={{ borderBottomLeftRadius: 24, borderBottomRightRadius: 24, overflow: "hidden" }}>
      {/* Crossfading gradient stack: the outgoing level's colors fade out
          while the incoming ones fade in, so the banner "morphs" between
          levels instead of snapping. */}
      <Animated.View key={levelOrder} entering={FadeIn.duration(320)} exiting={FadeOut.duration(320)} style={{ position: "absolute", inset: 0 }}>
        <LinearGradient colors={[accent.light, accent.mid]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }} />
      </Animated.View>

      <View style={{ paddingTop: 18, paddingHorizontal: 20, paddingBottom: 20 }}>
        <View className="flex-row items-center justify-between mb-3.5">
          {profile ? (
            <View className="flex-row items-center gap-1" style={{ backgroundColor: "rgba(16,16,25,0.16)", borderRadius: 999, paddingVertical: 5, paddingHorizontal: 10 }}>
              <StreakFlame size={13} color={accent.shadow} />
              <Text className="font-mono-bold text-[13px]" style={{ color: accent.shadow }}>
                {profile.currentStreak}
              </Text>
            </View>
          ) : (
            <View />
          )}
          {profile ? (
            <View style={{ backgroundColor: "rgba(16,16,25,0.16)", borderRadius: 999, paddingVertical: 5, paddingHorizontal: 12 }}>
              <Text className="font-mono-bold text-[13px]" style={{ color: accent.shadow }}>
                {profile.xpTotal} XP
              </Text>
            </View>
          ) : null}
        </View>

        <Animated.View key={`text-${levelOrder}`} entering={FadeIn.duration(260).delay(60)} exiting={FadeOut.duration(160)}>
          <Text className="font-mono-bold text-[11px] tracking-wide uppercase mb-1" style={{ color: accent.shadow, opacity: 0.75 }}>
            Nivel {levelOrder}
          </Text>
          <Text className="font-display text-2xl" style={{ color: accent.shadow }}>
            {topic}
          </Text>
        </Animated.View>
      </View>
    </View>
  );
}

function groupByLevel(rows: PathRow[]): Group[] {
  const groups = new Map<string, Group>();
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
  let currentLevelId: string | undefined;
  let firstLevelId: string | undefined;

  for (const level of levels) {
    const accent = LEVEL_ACCENTS[level.order % LEVEL_ACCENTS.length];
    if (!firstLevelId) firstLevelId = level.id;

    for (const lesson of level.lessons as RoadmapLesson[]) {
      const align = ALIGNS[li % 3];
      li++;

      let status: LessonNodeStatus;
      if (lesson.status === "completed") status = "done";
      else if (level.status === "locked") status = "locked";
      else if (!foundCurrent) {
        status = "current";
        foundCurrent = true;
        currentLevelId = level.id;
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

  return { rows, currentLevelId: currentLevelId ?? firstLevelId };
}
