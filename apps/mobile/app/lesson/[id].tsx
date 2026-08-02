import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import type { LessonAnswers, LessonBlock } from "@stockiq/shared-types";
import { useCompleteLesson, useLesson } from "@/api/hooks";
import { Card } from "@/components/Card";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { CandleExample, LineExample } from "@/components/CandleExample";
import { cn } from "@/utils/cn";

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

  const advance = () => {
    setPicked(undefined);
    if (isLast) {
      complete.mutate(answers, { onSuccess: () => setFinished(true) });
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
            <Pressable onPress={() => router.back()} hitSlop={10}>
              <Text className="text-muted dark:text-mutedDark text-xl">✕</Text>
            </Pressable>
            <View className="flex-1 h-2.5 bg-surface dark:bg-surfaceDark rounded-full overflow-hidden">
              <View className="h-2.5 bg-primary dark:bg-primaryDark rounded-full" style={{ width: `${progressPct}%` }} />
            </View>
            <Text className="text-muted dark:text-mutedDark text-xs">
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

      {lesson && finished && complete.data ? (
        <View className="flex-1 px-4 items-center justify-center">
          <Text className="text-5xl mb-4">{complete.data.scorePct === 100 ? "🏆" : complete.data.scorePct >= 60 ? "🎉" : "💪"}</Text>
          <Text className="text-ink dark:text-inkDark text-2xl font-bold">{complete.data.scorePct}%</Text>
          <Text className="text-muted dark:text-mutedDark text-sm mt-1 text-center">
            {complete.data.scorePct === 100
              ? "Perfecto. Concepto dominado."
              : complete.data.scorePct >= 60
                ? "Buen trabajo. Puedes repasar la lección cuando quieras."
                : "No pasa nada: los errores son parte del aprendizaje. Repítela cuando quieras."}
          </Text>
          {complete.data.xpAwarded > 0 ? (
            <View className="bg-accent/15 px-4 py-2 rounded-full mt-4">
              <Text className="text-accent dark:text-accentDark font-bold">+{complete.data.xpAwarded} XP</Text>
            </View>
          ) : null}
          <Pressable className="bg-primary rounded-xl px-8 py-3.5 mt-8" onPress={() => router.back()}>
            <Text className="text-white font-semibold">Continuar</Text>
          </Pressable>
        </View>
      ) : null}
    </SafeAreaView>
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
          <Text className="text-ink dark:text-inkDark text-xl font-bold mb-3">{block.title}</Text>
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
          <Text className="text-ink dark:text-inkDark text-sm font-medium mt-3">{block.caption}</Text>
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
            <Text className="text-muted dark:text-mutedDark text-xs">{block.ticker} · dato real ahora mismo</Text>
            <Text className="text-ink dark:text-inkDark text-3xl font-bold mt-2">{block.value ?? "n/d"}</Text>
          </Card>
          <Text className="text-muted dark:text-mutedDark text-sm leading-5 mt-3">{block.caption}</Text>
        </View>
      );

    case "quiz":
      return (
        <View>
          <Text className="text-ink dark:text-inkDark text-lg font-bold mb-4">{block.question}</Text>
          <View className="gap-2">
            {block.options.map((opt, i) => {
              const answered = picked !== undefined;
              const isPicked = picked === i;
              const isCorrect = i === block.correctIndex;
              return (
                <Pressable key={i} onPress={() => onAnswer(i)} disabled={answered}>
                  <Card
                    className={cn(
                      answered && isCorrect && "border-positive bg-positive/10",
                      answered && isPicked && !isCorrect && "border-negative bg-negative/10",
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
          <Text className="text-ink dark:text-inkDark text-lg font-bold mb-4">{block.statement}</Text>
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
                      answered && isCorrect && "border-positive bg-positive/10",
                      answered && isPicked && !isCorrect && "border-negative bg-negative/10",
                    )}
                  >
                    <Text className="text-ink dark:text-inkDark font-semibold">{v ? "Verdadero" : "Falso"}</Text>
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
    <Card className={cn("mt-4", correct ? "border-positive" : "border-negative")}>
      <Text className={cn("font-semibold text-sm mb-1", correct ? "text-positive dark:text-positiveDark" : "text-negative dark:text-negativeDark")}>
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
              <Text key={ci} className="font-bold">
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
      className={cn("rounded-xl py-3.5 items-center mb-4", disabled ? "bg-surface dark:bg-surfaceDark" : "bg-primary")}
      disabled={disabled}
      onPress={onPress}
    >
      <Text className={cn("font-semibold", disabled ? "text-muted dark:text-mutedDark" : "text-white")}>
        {busy ? "Corrigiendo..." : isLast ? "Terminar" : "Continuar"}
      </Text>
    </Pressable>
  );
}
