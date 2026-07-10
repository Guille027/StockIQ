import { SafeAreaView } from "react-native-safe-area-context";
import { ComingSoon } from "@/components/ComingSoon";

export default function ChatScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-backgroundDark">
      <ComingSoon
        title="Chat IA"
        description="Pregunta cosas como '¿por qué cayó Nvidia?' o '¿Apple está sobrevalorada?' y obtén respuestas razonadas con datos. Llega en la fase 2."
      />
    </SafeAreaView>
  );
}
