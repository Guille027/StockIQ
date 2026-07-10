import { Pressable, Text, View } from "react-native";

interface SectionHeaderProps {
  title: string;
  action?: { label: string; onPress: () => void };
}

export function SectionHeader({ title, action }: SectionHeaderProps) {
  return (
    <View className="flex-row items-center justify-between mb-3 mt-6">
      <Text className="text-ink dark:text-inkDark text-lg font-semibold">{title}</Text>
      {action ? (
        <Pressable onPress={action.onPress} hitSlop={8}>
          <Text className="text-primary dark:text-primaryDark text-sm font-medium">{action.label}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
