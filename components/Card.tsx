import React from "react";
import { ScrollView, View } from "react-native";
import { cn } from "~/lib/utils";

const spacingSizeMap = {
  default: 20,
  small: 16,
} as const;

export default function Card({
  children,
  scrollable = false,
  header = null,
  spacing = "default",
  borderColor = "default",
}: {
  children: React.ReactNode;
  scrollable?: boolean;
  header?: React.ReactNode;
  spacing?: "default" | "small";
  borderColor?: "default" | "active";
}) {
  const spacingSize = spacingSizeMap[spacing];
  if (scrollable) {
    return (
      <View
        style={{ backgroundColor: "hsla(0, 0%, 100%, 0.03)" }}
        className={cn(
          `border flex-1 rounded-[10] border-cardBorder pt-[${spacingSize}] gap-[${spacingSize}]`
        )}
      >
        <View className={`px-[${spacingSize}]`}>{header}</View>
        <ScrollView className={`px-[${spacingSize}] pb-[${spacingSize}]`}>
          {children}
        </ScrollView>
      </View>
    );
  }
  return (
    <View
      style={{ backgroundColor: "hsla(0, 0%, 100%, 0.03)" }}
      className={cn(
        `border flex-1 rounded-[10] p-[${spacingSize}]`,
        borderColor === "active" && "border-highlight",
        borderColor === "default" && "border-cardBorder"
      )}
    >
      {children}
    </View>
  );
}
