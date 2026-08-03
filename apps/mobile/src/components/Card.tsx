import { View, ViewProps } from "react-native";
import { cn } from "@/utils/cn";

export function Card({ className, ...props }: ViewProps & { className?: string }) {
  return (
    <View
      className={cn("bg-card dark:bg-cardDark border border-border dark:border-borderDark rounded-xl p-4", className)}
      {...props}
    />
  );
}
