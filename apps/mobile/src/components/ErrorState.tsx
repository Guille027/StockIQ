import { Text, View } from "react-native";
import { PressableScale } from "@/components/PressableScale";

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View className="flex-1 items-center justify-center py-16 px-6">
      <Text className="text-ink dark:text-inkDark text-base font-medium text-center">No se pudo cargar la información</Text>
      <Text className="text-muted dark:text-mutedDark text-sm text-center mt-2">{message}</Text>
      {onRetry ? (
        <PressableScale onPress={onRetry} className="mt-4 bg-primary dark:bg-primaryDark px-4 py-2 rounded-full">
          <Text className="text-white font-medium">Reintentar</Text>
        </PressableScale>
      ) : null}
    </View>
  );
}
