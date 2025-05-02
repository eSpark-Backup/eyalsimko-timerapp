import * as SwitchPrimitives from "@rn-primitives/switch";
import * as React from "react";
import { Platform } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from "react-native-reanimated";
import { useColorScheme } from "~/lib/useColorScheme";
import { cn } from "~/lib/utils";

const SwitchWeb = React.forwardRef<
  SwitchPrimitives.RootRef,
  SwitchPrimitives.RootProps
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer flex-row h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed",
      props.checked ? "bg-primary" : "bg-input",
      props.disabled && "opacity-50",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-md shadow-foreground/5 ring-0 transition-transform",
        props.checked ? "translate-x-5" : "translate-x-0"
      )}
    />
  </SwitchPrimitives.Root>
));

SwitchWeb.displayName = "SwitchWeb";

const RGB_COLORS = {
  light: {
    primary: "hsla(0, 0%, 100%, 0.15)",
    input: "hsla(0, 0%, 100%, 0.15)",
  },
  dark: {
    primary: "hsla(0, 0%, 100%, 0.15)",
    input: "hsla(0, 0%, 100%, 0.15)",
  },
} as const;

const SwitchNative = React.forwardRef<
  SwitchPrimitives.RootRef,
  SwitchPrimitives.RootProps
>(({ className, ...props }, ref) => {
  const { colorScheme } = useColorScheme();
  const translateX = useDerivedValue(() => (props.checked ? 38 - 18 - 3 : 3));
  const animatedRootStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        translateX.value,
        [3, 65],
        [RGB_COLORS[colorScheme].input, RGB_COLORS[colorScheme].primary]
      ),
    };
  });
  const animatedThumbStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: withTiming(translateX.value, { duration: 200 }) },
    ],
  }));
  return (
    <Animated.View
      style={animatedRootStyle}
      className={cn(
        "w-[38] h-[24] rounded-full",
        props.disabled && "opacity-50"
      )}
    >
      <SwitchPrimitives.Root
        className={cn(
          "flex-row w-[38] h-[24] shrink-0 items-center rounded-full",
          props.checked ? "bg-input" : "bg-input",
          className
        )}
        {...props}
        ref={ref}
      >
        <Animated.View style={animatedThumbStyle}>
          <SwitchPrimitives.Thumb
            className={cn(
              "h-[18] w-[18] items-center justify-center rounded-full bg-highlight",
              props.checked && "bg-highlight",
              !props.checked && "bg-toggle-disabled"
            )}
          />
        </Animated.View>
      </SwitchPrimitives.Root>
    </Animated.View>
  );
});
SwitchNative.displayName = "SwitchNative";

const Switch = Platform.select({
  web: SwitchWeb,
  default: SwitchNative,
});

export { Switch };
