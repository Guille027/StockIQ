import { Text, View } from "react-native";
import { router } from "expo-router";
import type { CoachFeedbackDto } from "@stockiq/shared-types";
import { Card } from "./Card";
import { PressableScale } from "@/components/PressableScale";

/** Renders the mentor's feedback -- shared by journal detail and profile review. */
export function CoachFeedbackCard({ feedback }: { feedback: CoachFeedbackDto }) {
  return (
    <Card>
      <View className="flex-row items-center gap-2 mb-2">
        <Text className="text-lg">🧑‍🏫</Text>
        <Text className="font-sans-bold text-ink dark:text-inkDark flex-1">Tu mentor</Text>
        {feedback.isMock ? (
          <View className="bg-surface dark:bg-surfaceDark px-2 py-0.5 rounded-full">
            <Text className="font-mono text-muted dark:text-mutedDark text-[10px]">Ejemplo (sin clave IA)</Text>
          </View>
        ) : null}
      </View>

      <Text className="text-ink dark:text-inkDark text-sm leading-5">{feedback.planAdherence}</Text>
      {feedback.emotionalRead ? <Text className="text-muted dark:text-mutedDark text-sm leading-5 mt-2">{feedback.emotionalRead}</Text> : null}

      {feedback.strengths.length > 0 ? (
        <>
          <Text className="font-sans-bold text-positive dark:text-positiveDark text-xs mt-3 mb-1">Lo que hiciste bien</Text>
          {feedback.strengths.map((s, i) => (
            <Text key={i} className="text-ink dark:text-inkDark text-sm leading-5">
              • {s}
            </Text>
          ))}
        </>
      ) : null}

      {feedback.improvements.length > 0 ? (
        <>
          <Text className="font-sans-bold text-accent dark:text-accentDark text-xs mt-3 mb-1">Para la próxima</Text>
          {feedback.improvements.map((s, i) => (
            <Text key={i} className="text-ink dark:text-inkDark text-sm leading-5">
              • {s}
            </Text>
          ))}
        </>
      ) : null}

      {feedback.suggestedLessonIds.length > 0 ? (
        <View className="flex-row flex-wrap gap-2 mt-3">
          {feedback.suggestedLessonIds.map((id) => (
            <PressableScale key={id} onPress={() => router.push(`/lesson/${id}`)}>
              <View className="bg-primarySoft dark:bg-primarySoftDark px-3 py-1.5 rounded-full">
                <Text className="font-sans-semibold text-primary dark:text-primaryDark text-xs">📘 Repasar {id}</Text>
              </View>
            </PressableScale>
          ))}
        </View>
      ) : null}

      {feedback.question ? (
        <View className="bg-surface dark:bg-surfaceDark rounded-xl px-3 py-2.5 mt-3">
          <Text className="text-ink dark:text-inkDark text-sm italic leading-5">💭 {feedback.question}</Text>
        </View>
      ) : null}
    </Card>
  );
}
