import React from "react";
import { ScrollView, View } from "react-native";

export default function Card({
  children,
  scrollable = false,
  header,
}: {
  children: React.ReactNode;
  scrollable?: boolean;
  header: React.ReactNode;
}) {
  if (scrollable) {
    return (
      <View
        style={{ backgroundColor: "hsla(0, 0%, 100%, 0.03)" }}
        className="border flex-1 rounded-[10] border-cardBorder pt-[20] gap-[20]"
      >
        <View className="px-[20]">{header}</View>
        <ScrollView className="px-[20] pb-[20]">{children}</ScrollView>
      </View>
    );
  }
  return (
    <View
      style={{ backgroundColor: "hsla(0, 0%, 100%, 0.03)" }}
      className="border flex-1 rounded-[10] border-cardBorder p-[20]"
    >
      {children}
    </View>
  );
}
