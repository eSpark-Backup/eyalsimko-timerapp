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
  NativeSyntheticEvent,
  TextInputSubmitEditingEventData,
  TextInputFocusEventData,
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
  extends TextInputProps,
    VariantProps<typeof variants> {
  label: string;
}

export type TextInputRef = TextInput & { blurAndRemoveFocus: () => void };

const Input = React.forwardRef<TextInputRef, FloatingLabelInputProps>(
  (
    {
      className,
      placeholderClassName,
      size,
      background,
      label,
      value,
      placeholder,
      ...props
    },
    ref
  ) => {
    const inputRef = React.useRef<TextInput>(null);
    const isControlled = value !== undefined;
    const valueRef = React.useRef(props.defaultValue ?? "");
    const isFilled = isControlled
      ? value.length > 0
      : valueRef.current.length > 0;
    const [isFocused, setIsFocused] = React.useState(false);
    const isFilledOrFocused = isFocused || isFilled;
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

    const onSubmitEditing = (
      e: NativeSyntheticEvent<TextInputSubmitEditingEventData>
    ) => {
      if (props.onSubmitEditing) props.onSubmitEditing(e);
      valueRef.current = e.nativeEvent.text;
    };

    const handleFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
      if (props.onFocus) props.onFocus(e);
      setIsFocused(true);
    };
    const handleBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
      if (props.onBlur) props.onBlur(e);
      setIsFocused(false);
    };

    React.useImperativeHandle(ref, () =>
      inputRef.current
        ? {
            ...inputRef.current,
            blurAndRemoveFocus: () => {
              inputRef.current?.blur();
              setIsFocused(false);
            },
          }
        : (undefined as any)
    );

    return (
      <View className="relative">
        <Animated.Text style={[styles.label, labelStyle]}>
          {label}
        </Animated.Text>
        <TextInput
          value={value}
          ref={inputRef}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSubmitEditing={onSubmitEditing}
          className={cn(
            "web:flex web:w-full border-transparent native:leading-[1.25] text-foreground placeholder:text-muted-foreground web:ring-offset-background file:border-0 file:bg-transparent file:font-medium web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2",
            isFocused && "border-highlight",
            props.editable === false && "opacity-50 web:cursor-not-allowed",
            variants({ size, className, background })
          )}
          placeholder={isFilledOrFocused ? placeholder : undefined}
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
