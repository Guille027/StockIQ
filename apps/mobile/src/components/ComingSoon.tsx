import { Text, View } from "react-native";

export function ComingSoon({ title, description }: { title: string; description: string }) {
  return (
    <View className="flex-1 items-center justify-center px-8 bg-background dark:bg-backgroundDark">
      <View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center mb-4">
        <Text className="text-2xl">🚧</Text>
      </View>
      <Text className="text-ink dark:text-inkDark text-xl font-semibold text-center">{title}</Text>
      <Text className="text-muted dark:text-mutedDark text-sm text-center mt-2">{description}</Text>
      <View className="mt-6 bg-surface dark:bg-surfaceDark border border-border dark:border-borderDark rounded-xl px-4 py-3">
        <Text className="text-muted dark:text-mutedDark text-xs text-center">Próximamente -- ver roadmap en docs/ARCHITECTURE.md</Text>
      </View>
    </View>
  );
}
