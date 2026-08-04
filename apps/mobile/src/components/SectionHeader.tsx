import { Text, View } from "react-native";
import { PressableScale } from "@/components/PressableScale";

interface SectionHeaderProps {
  title: string;
  action?: { label: string; onPress: () => void };
}

export function SectionHeader({ title, action }: SectionHeaderProps) {
  return (
    <View className="flex-row items-center justify-between mb-3 mt-6">
      <Text className="font-display text-ink dark:text-inkDark text-lg">{title}</Text>
      {action ? (
        <PressableScale onPress={action.onPress} hitSlop={8}>
          <Text className="font-sans-semibold text-primary dark:text-primaryDark text-sm">{action.label}</Text>
        </PressableScale>
      ) : null}
    </View>
  );
}
