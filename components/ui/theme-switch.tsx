import * as SwitchPrimitives from "@rn-primitives/switch";
import * as React from "react";
import { Platform } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from "react-native-reanimated";
import { Moon } from "~/lib/icons/Moon";
import { SunMoon } from "~/lib/icons/SunMoon";
import { useColorScheme } from "~/lib/useColorScheme";
import { cn } from "~/lib/utils";

const ThemeSwitchWeb = React.forwardRef<
  SwitchPrimitives.RootRef,
  SwitchPrimitives.RootProps
>(({ className, ...props }, ref) => null);

ThemeSwitchWeb.displayName = "SwitchWeb";

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

const ThemeSwitchNative = React.forwardRef<
  SwitchPrimitives.RootRef,
  SwitchPrimitives.RootProps
>(({ className, ...props }, ref) => {
  const { colorScheme } = useColorScheme();
  const translateX = useDerivedValue(() => (props.checked ? 68 - 34 - 3 : 3));
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
      // style={animatedRootStyle}
      className={cn(
        "w-[68] h-[40] rounded-full",
        props.disabled && "opacity-50"
      )}
    >
      <SwitchPrimitives.Root
        style={{ backgroundColor: "hsla(0, 0%, 100%, 0.15)", borderWidth: colorScheme == "light" ? 0.5 : 0  }}
        className={cn(
          "flex-row w-[68] h-[40] shrink-0 items-center rounded-full",
          props.checked ? "bg-input" : "bg-input",
          className
        )}
        {...props}
        ref={ref}
      >
        <Animated.View style={animatedThumbStyle}>
          <SwitchPrimitives.Thumb
            className={
              "h-[34] w-[34] items-center justify-center rounded-full bg-highlight"
            }
          >
            <Moon size={18} className="text-primary" />
          </SwitchPrimitives.Thumb>
        </Animated.View>
      </SwitchPrimitives.Root>
    </Animated.View>
  );
});
ThemeSwitchNative.displayName = "SwitchNative";

const ThemeSwitch = Platform.select({
  web: ThemeSwitchNative,
  default: ThemeSwitchNative,
});

export { ThemeSwitch as Switch };
