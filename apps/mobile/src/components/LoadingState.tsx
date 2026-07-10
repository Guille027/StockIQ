import { ActivityIndicator, Text, View } from "react-native";

export function LoadingState({ label = "Cargando..." }: { label?: string }) {
  return (
    <View className="flex-1 items-center justify-center py-16">
      <ActivityIndicator />
      <Text className="text-muted dark:text-mutedDark mt-3">{label}</Text>
    </View>
  );
}
