import { cva } from "class-variance-authority";
import React from "react";
import { ScrollView, View } from "react-native";
import { cn } from "~/lib/utils";

const cardVariants = cva("border flex-1 rounded-[10]", {
  variants: {
    borderColor: {
      active: "border-highlight",
      default: "border-cardBorder",
    },
  },
  defaultVariants: {
    borderColor: "default",
  },
});

const nonScrollableCardVariants = cva("", {
  variants: {
    spacing: {
      small: "p-[16]",
      default: "p-[20]",
    },
  },
  defaultVariants: {
    spacing: "default",
  },
});

const scrollableCardHeaderVariants = cva("", {
  variants: {
    spacing: {
      small: "p-[16]",
      default: "p-[20]",
    },
  },
  defaultVariants: {
    spacing: "default",
  },
});
const scrollableCardContentVariants = cva("", {
  variants: {
    spacing: {
      small: "px-[16] pb-[16]",
      default: "px-[20] pb-[20]",
    },
  },
  defaultVariants: {
    spacing: "default",
  },
});

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
  if (scrollable) {
    return (
      <View
        style={{ backgroundColor: "hsla(0, 0%, 100%, 0.03)" }}
        className={cn(cardVariants({ borderColor }))}
      >
        <View className={scrollableCardHeaderVariants({ spacing })}>
          {header}
        </View>
        <ScrollView className={scrollableCardContentVariants({ spacing })}>
          {children}
        </ScrollView>
      </View>
    );
  }
  return (
    <View
      style={{ backgroundColor: "hsla(0, 0%, 100%, 0.03)" }}
      className={cn(
        nonScrollableCardVariants({ spacing }),
        cardVariants({ borderColor })
      )}
    >
      {children}
    </View>
  );
}
