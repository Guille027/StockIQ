import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import type { LessonAnswers, LessonBlock } from "@stockiq/shared-types";
import { useCompleteLesson, useLesson } from "@/api/hooks";
import { Card } from "@/components/Card";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { CandleExample, LineExample } from "@/components/CandleExample";
import { Confetti } from "@/components/Confetti";
import { cn } from "@/utils/cn";

/**
 * Lessons can be entered with nothing underneath them in the stack (e.g. the
 * onboarding carousel routes straight into the first lesson) -- router.back()
 * throws "GO_BACK was not handled by any navigator" in that case, so fall
 * back to Aprender instead of assuming a previous screen exists.
 */
function exitLesson() {
  if (router.canGoBack()) router.back();
  else router.replace("/(tabs)");
}

/**
 * Block-by-block lesson player: one block per screen, Duolingo-style.
 * Quiz answers are graded server-side at the end; the instant right/wrong
 * tint here is purely visual feedback (the answer key ships in each quiz
 * block for immediate explanation, final XP comes from the API).
 */
export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: lesson, isLoading, isError, refetch } = useLesson(id ?? "");
  const complete = useCompleteLesson(id ?? "");

  const [blockIndex, setBlockIndex] = useState(0);
  const [answers, setAnswers] = useState<LessonAnswers>({});
  const [picked, setPicked] = useState<number | boolean | undefined>(undefined);
  const [finished, setFinished] = useState(false);

  const totalBlocks = lesson?.blocks.length ?? 0;
  const block = lesson?.blocks[blockIndex];
  const isLast = blockIndex >= totalBlocks - 1;

  const progressPct = useMemo(
    () => (totalBlocks === 0 ? 0 : Math.round(((finished ? totalBlocks : blockIndex) / totalBlocks) * 100)),
    [blockIndex, totalBlocks, finished],
  );
  const progressWidth = useSharedValue(0);
  useEffect(() => {
    progressWidth.value = withTiming(progressPct, { duration: 350, easing: Easing.out(Easing.quad) });
  }, [progressPct]);
  const progressStyle = useAnimatedStyle(() => ({ width: `${progressWidth.value}%` }));

  const advance = () => {
    if (block?.type === "quiz" || block?.type === "trueFalse") {
      const correct = block.type === "quiz" ? picked === block.correctIndex : picked === block.answer;
      Haptics.notificationAsync(correct ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning).catch(() => {});
    }
    setPicked(undefined);
    if (isLast) {
      complete.mutate(answers, {
        onSuccess: (res) => {
          setFinished(true);
          if (res.scorePct >= 60) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        },
      });
    } else {
      setBlockIndex((i) => i + 1);
    }
  };

  const answer = (value: number | boolean) => {
    if (picked !== undefined) return; // already answered
    setPicked(value);
    setAnswers((a) => ({ ...a, [blockIndex]: value }));
  };

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-backgroundDark" edges={["top"]}>
      {isLoading ? <LoadingState label="Cargando lección..." /> : null}
      {isError ? <ErrorState message="No se pudo cargar la lección." onRetry={() => refetch()} /> : null}

      {lesson && !finished ? (
        <View className="flex-1 px-4">
          <View className="flex-row items-center gap-3 mt-2">
            <Pressable onPress={exitLesson} hitSlop={10}>
              <Text className="text-muted dark:text-mutedDark text-xl">✕</Text>
            </Pressable>
            <View className="flex-1 h-2.5 bg-surface dark:bg-surfaceDark rounded-full overflow-hidden">
              <Animated.View className="h-2.5 bg-primary dark:bg-primaryDark rounded-full" style={progressStyle} />
            </View>
            <Text className="font-mono text-muted dark:text-mutedDark text-xs">
              {Math.min(blockIndex + 1, totalBlocks)}/{totalBlocks}
            </Text>
          </View>

          <ScrollView className="flex-1 mt-4" contentContainerStyle={{ paddingBottom: 16 }}>
            {block ? <Block block={block} picked={picked} onAnswer={answer} /> : null}
          </ScrollView>

          <ContinueButton
            block={block}
            picked={picked}
            isLast={isLast}
            busy={complete.isPending}
            onPress={advance}
          />
        </View>
      ) : null}

      {lesson && finished && complete.data ? <ResultScreen scorePct={complete.data.scorePct} xpAwarded={complete.data.xpAwarded} /> : null}
    </SafeAreaView>
  );
}

function ResultScreen({ scorePct, xpAwarded }: { scorePct: number; xpAwarded: number }) {
  const badgeScale = useSharedValue(0.4);
  const perfect = scorePct === 100;

  useEffect(() => {
    badgeScale.value = withSpring(1, { damping: 9, stiffness: 160 });
  }, []);
  const badgeStyle = useAnimatedStyle(() => ({ transform: [{ scale: badgeScale.value }] }));

  return (
    <View className="flex-1 px-4 items-center justify-center">
      {scorePct >= 60 ? <Confetti trigger={1} /> : null}
      <Animated.Text style={[badgeStyle, { fontSize: 52, marginBottom: 16 }]}>
        {perfect ? "🏆" : scorePct >= 60 ? "🎉" : "💪"}
      </Animated.Text>
      <Text className="font-mono-bold text-ink dark:text-inkDark text-3xl">{scorePct}%</Text>
      <Text className="text-muted dark:text-mutedDark text-sm mt-1 text-center max-w-[28ch]">
        {perfect
          ? "Perfecto. Concepto dominado."
          : scorePct >= 60
            ? "Buen trabajo. Puedes repasar la lección cuando quieras."
            : "No pasa nada: los errores son parte del aprendizaje. Repítela cuando quieras."}
      </Text>
      {xpAwarded > 0 ? (
        <View className="bg-accentSoft dark:bg-accentSoftDark px-4 py-2 rounded-full mt-4">
          <Text className="font-mono-bold text-accent dark:text-accentDark">+{xpAwarded} XP</Text>
        </View>
      ) : null}
      <Pressable className="bg-primary dark:bg-primaryDark rounded-xl px-8 py-3.5 mt-8" onPress={exitLesson}>
        <Text className="font-sans-bold text-white">Continuar</Text>
      </Pressable>
    </View>
  );
}

function Block({
  block,
  picked,
  onAnswer,
}: {
  block: LessonBlock;
  picked: number | boolean | undefined;
  onAnswer: (v: number | boolean) => void;
}) {
  switch (block.type) {
    case "concept":
      return (
        <View>
          {block.emoji ? <Text className="text-4xl mb-3">{block.emoji}</Text> : null}
          <Text className="font-display text-xl text-ink dark:text-inkDark mb-3">{block.title}</Text>
          <RichBody body={block.body} />
        </View>
      );

    case "chartExample":
      return (
        <View>
          <Card className="py-4">
            {block.candles ? <CandleExample candles={block.candles} /> : null}
            {block.line ? <LineExample values={block.line} /> : null}
          </Card>
          <Text className="font-sans-semibold text-ink dark:text-inkDark text-sm mt-3">{block.caption}</Text>
          {block.annotations?.map((a, i) => (
            <View key={i} className="flex-row mt-2">
              <Text className="text-primary dark:text-primaryDark mr-2">•</Text>
              <Text className="text-muted dark:text-mutedDark text-sm flex-1">{a}</Text>
            </View>
          ))}
        </View>
      );

    case "liveStat":
      return (
        <View>
          <Card className="items-center py-6">
            <Text className="font-mono text-muted dark:text-mutedDark text-xs">{block.ticker} · dato real ahora mismo</Text>
            <Text className="font-mono-bold text-ink dark:text-inkDark text-3xl mt-2">{block.value ?? "n/d"}</Text>
          </Card>
          <Text className="text-muted dark:text-mutedDark text-sm leading-5 mt-3">{block.caption}</Text>
        </View>
      );

    case "quiz":
      return (
        <View>
          <Text className="font-display text-lg text-ink dark:text-inkDark mb-4">{block.question}</Text>
          <View className="gap-2">
            {block.options.map((opt, i) => {
              const answered = picked !== undefined;
              const isPicked = picked === i;
              const isCorrect = i === block.correctIndex;
              return (
                <Pressable key={i} onPress={() => onAnswer(i)} disabled={answered}>
                  <Card
                    className={cn(
                      answered && isCorrect && "border-positive dark:border-positiveDark bg-positiveSoft dark:bg-positiveSoftDark",
                      answered && isPicked && !isCorrect && "border-negative dark:border-negativeDark bg-negativeSoft dark:bg-negativeSoftDark",
                    )}
                  >
                    <Text className="text-ink dark:text-inkDark text-sm">{opt}</Text>
                  </Card>
                </Pressable>
              );
            })}
          </View>
          {picked !== undefined ? <Explanation correct={picked === block.correctIndex} text={block.explanation} /> : null}
        </View>
      );

    case "trueFalse":
      return (
        <View>
          <Text className="font-display text-lg text-ink dark:text-inkDark mb-4">{block.statement}</Text>
          <View className="flex-row gap-3">
            {([true, false] as const).map((v) => {
              const answered = picked !== undefined;
              const isPicked = picked === v;
              const isCorrect = v === block.answer;
              return (
                <Pressable key={String(v)} className="flex-1" onPress={() => onAnswer(v)} disabled={answered}>
                  <Card
                    className={cn(
                      "items-center py-4",
                      answered && isCorrect && "border-positive dark:border-positiveDark bg-positiveSoft dark:bg-positiveSoftDark",
                      answered && isPicked && !isCorrect && "border-negative dark:border-negativeDark bg-negativeSoft dark:bg-negativeSoftDark",
                    )}
                  >
                    <Text className="font-sans-bold text-ink dark:text-inkDark">{v ? "Verdadero" : "Falso"}</Text>
                  </Card>
                </Pressable>
              );
            })}
          </View>
          {picked !== undefined ? <Explanation correct={picked === block.answer} text={block.explanation} /> : null}
        </View>
      );

    default:
      return null;
  }
}

function Explanation({ correct, text }: { correct: boolean; text: string }) {
  return (
    <Card className={cn("mt-4", correct ? "border-positive dark:border-positiveDark" : "border-negative dark:border-negativeDark")}>
      <Text className={cn("font-sans-bold text-sm mb-1", correct ? "text-positive dark:text-positiveDark" : "text-negative dark:text-negativeDark")}>
        {correct ? "¡Correcto!" : "No exactamente"}
      </Text>
      <Text className="text-ink dark:text-inkDark text-sm leading-5">{text}</Text>
    </Card>
  );
}

/** Minimal markdown-lite: paragraphs on \n\n, **bold** spans. */
function RichBody({ body }: { body: string }) {
  return (
    <View className="gap-3">
      {body.split("\n\n").map((paragraph, pi) => (
        <Text key={pi} className="text-ink dark:text-inkDark text-base leading-6">
          {paragraph.split("**").map((chunk, ci) =>
            ci % 2 === 1 ? (
              <Text key={ci} className="font-sans-bold">
                {chunk}
              </Text>
            ) : (
              chunk
            ),
          )}
        </Text>
      ))}
    </View>
  );
}

function ContinueButton({
  block,
  picked,
  isLast,
  busy,
  onPress,
}: {
  block: LessonBlock | undefined;
  picked: number | boolean | undefined;
  isLast: boolean;
  busy: boolean;
  onPress: () => void;
}) {
  const needsAnswer = block?.type === "quiz" || block?.type === "trueFalse";
  const disabled = busy || (needsAnswer && picked === undefined);
  return (
    <Pressable
      className={cn("rounded-xl py-3.5 items-center mb-4", disabled ? "bg-surface dark:bg-surfaceDark" : "bg-primary dark:bg-primaryDark")}
      disabled={disabled}
      onPress={onPress}
    >
      <Text className={cn("font-sans-bold", disabled ? "text-muted dark:text-mutedDark" : "text-white")}>
        {busy ? "Corrigiendo..." : isLast ? "Terminar" : "Continuar"}
      </Text>
    </Pressable>
  );
}
