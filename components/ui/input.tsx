import { cva, VariantProps } from "class-variance-authority";
import { LucideIcon } from "lucide-react-native";
import * as React from "react";
import {
  TextInput,
  View,
  StyleSheet,
  TextInputProps,
  Text,
  NativeSyntheticEvent,
  TextInputFocusEventData,
  TextInputSubmitEditingEventData,
} from "react-native";
import { cn } from "~/lib/utils";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated"; // Reanimated for both web and mobile

const variants = cva("", {
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
const iconVariants = cva("absolute justify-center right-0 top-0", {
  variants: {
    size: {
      small: "native:h-[36] pr-[8]",
      default: "native:h-[60] pr-[15]",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

type IconProps = React.ComponentProps<LucideIcon>;

interface FloatingLabelInputProps
  extends TextInputProps,
    VariantProps<typeof variants> {
  label?: string;
  hasError?: boolean;
  hint?: string;
  hitClassName?: string;
  icon?: React.ComponentType<IconProps>;
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
      hasError,
      onBlur,
      onFocus,
      onSubmitEditing,
      onChangeText,
      icon: Icon,
      hint,
      hitClassName,
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

    const labelFloating = useSharedValue(isFilledOrFocused ? 1 : 0);

    React.useEffect(() => {
      labelFloating.value = withSpring(isFilledOrFocused ? 1 : 0, {
        damping: 20,
        stiffness: 100,
      });
    }, [isFilledOrFocused, labelFloating]);

    const labelStyle = useAnimatedStyle(() => {
      return {
        transform: [
          {
            translateY: withSpring(labelFloating.value === 1 ? 10 : 20),
          },
          {
            scale: withSpring(labelFloating.value === 1 ? 0.85 : 1),
          },
        ],
        color: labelFloating.value === 1
          ? "hsla(213, 5%, 57%, 1)"
          : "hsla(213, 5%, 57%, 0.5)",
      };
    });

    const handleSubmitEditing = (
      e: NativeSyntheticEvent<TextInputSubmitEditingEventData>
    ) => {
      if (onSubmitEditing) onSubmitEditing(e);
      valueRef.current = e.nativeEvent.text;
    };

    const handleChangeText = (text: string) => {
      if (onChangeText) onChangeText(text);
      valueRef.current = text;
    };

    const handleFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
      if (onFocus) onFocus(e);
      setIsFocused(true);
    };

    const handleBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
      if (onBlur) {
        onBlur(e);
      }
      if (onSubmitEditing) {
        onSubmitEditing({
          nativeEvent: {
            text: valueRef.current,
          },
        } as NativeSyntheticEvent<TextInputSubmitEditingEventData>);
      }
      setIsFocused(false);
    };

    React.useImperativeHandle(ref, () =>
      inputRef.current
        ? {
            ...inputRef.current,
            blurAndRemoveFocus: () => {
              handleBlur(
                null as unknown as NativeSyntheticEvent<TextInputFocusEventData>
              );
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
        {Icon && (
            <View className="absolute right-3 top-0 bottom-0 flex-row items-center justify-center">
              <Icon size={20} className="text-muted" />
            </View>
          )}
        {hint && isFilledOrFocused && (
          <View className="absolute flex-row bottom-[12] left-[17]">
            <Text className={cn("font-normal font-poppins web:font-poppin text-md text-muted-foreground", hitClassName)}>
              {hint}
            </Text>
          </View>
        )}
        <TextInput
          value={value}
          ref={inputRef}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSubmitEditing={handleSubmitEditing}
          onChangeText={handleChangeText}
          className={cn(
            "web:flex web:w-full border-transparent native:leading-[1.25] text-foreground placeholder:text-muted-foreground web:ring-offset-background file:border-0 file:bg-transparent file:font-medium web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2",
            isFocused && "border-highlight",
            !hasError && "border-2",
            !isFocused && hasError && "border border-red-500",
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