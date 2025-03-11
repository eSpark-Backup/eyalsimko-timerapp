import { cva, VariantProps } from "class-variance-authority";
import * as React from "react";
import {
  TextInput,
  View,
  Animated,
  StyleSheet,
  TextInputProps,
  Platform,
  Easing,
  useAnimatedValue,
} from "react-native";
import { cn } from "~/lib/utils";

const variants = cva("border-2", {
  variants: {
    size: {
      small: "native:h-[36] p-[8] rounded-[8] text-md",
      default: "native:h-[60] rounded-[8] pt-[30] pb-[10] px-[15] text-md",
    },
    background: {
      default: "bg-input-background",
      modal: "bg-input-background-modal",
    },
  },
  defaultVariants: {
    size: "default",
    background: "default",
  },
});

interface FloatingLabelInputProps
  extends Omit<TextInputProps, "placeholder">,
    VariantProps<typeof variants> {
  label: string;
}

const Input = React.forwardRef<TextInput, FloatingLabelInputProps>(
  (
    {
      className,
      placeholderClassName,
      size,
      background,
      label,
      onChangeText,
      defaultValue,
      ...props
    },
    ref
  ) => {
    const valueRef = React.useRef(defaultValue ?? "");
    const [isFocused, setIsFocused] = React.useState(false);
    const isFilledOrFocused = isFocused || valueRef.current.length > 0;
    const labelFloating = useAnimatedValue(isFilledOrFocused ? 1 : 0);

    React.useEffect(() => {
      Animated.timing(labelFloating, {
        toValue: isFilledOrFocused ? 1 : 0,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true, // Ernable native driver for better performance
      }).start();
    }, [isFilledOrFocused, labelFloating]);

    const labelStyle = {
      transform: [
        {
          translateY: labelFloating.interpolate({
            inputRange: [0, 1],
            outputRange: [20, 10],
          }),
        },
        {
          scale: labelFloating.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 0.85],
          }),
        },
      ],
      color: isFilledOrFocused
        ? "hsla(213, 5%, 57%, 1)"
        : "hsla(213, 5%, 57%, 0.5)",
    };

    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);
    return (
      <View className="relative">
        <Animated.Text style={[styles.label, labelStyle]}>
          {label}
        </Animated.Text>
        <TextInput
          onSubmitEditing={(e) => {
            console.log("submit", e.nativeEvent.text);
            valueRef.current = e.nativeEvent.text;
          }}
          ref={ref}
          defaultValue={defaultValue}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={cn(
            "web:flex web:w-full border-transparent native:leading-[1.25] text-foreground placeholder:text-muted-foreground web:ring-offset-background file:border-0 file:bg-transparent file:font-medium web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2",
            isFocused && "border-highlight",
            props.editable === false && "opacity-50 web:cursor-not-allowed",
            variants({ size, className, background })
          )}
          {...props}
        />
      </View>
    );
  }
);

Input.displayName = "Input";

const styles = StyleSheet.create({
  label: {
    position: "absolute",
    left: 15,
    top: 0,
    fontSize: 14,
    backgroundColor: "transparent",
    transformOrigin: "left top",
  },
});

export { Input };
