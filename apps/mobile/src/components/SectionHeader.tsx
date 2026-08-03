import { Pressable, Text, View } from "react-native";

interface SectionHeaderProps {
  title: string;
  action?: { label: string; onPress: () => void };
}

export function SectionHeader({ title, action }: SectionHeaderProps) {
  return (
    <View className="flex-row items-center justify-between mb-3 mt-6">
      <Text className="font-display text-ink dark:text-inkDark text-lg">{title}</Text>
      {action ? (
        <Pressable onPress={action.onPress} hitSlop={8}>
          <Text className="font-sans-semibold text-primary dark:text-primaryDark text-sm">{action.label}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
