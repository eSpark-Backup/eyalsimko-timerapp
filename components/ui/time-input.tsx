import * as React from "react";
import {
  NativeSyntheticEvent,
  TextInput,
  TextInputFocusEventData,
} from "react-native";
import { Input, TextInputRef } from "~/components/ui/input";

interface TimeInputProps
  extends Omit<React.ComponentProps<typeof Input>, "value" | "onChange"> {
  value: number | undefined; // value in seconds
  onChange: (newValue: number) => void;
}

const TimeInput = ({ value, onChange, onBlur, ...props }: TimeInputProps) => {
  const ref = React.useRef<TextInputRef>(null);
  const [localValue, setLocalValue] = React.useState(() =>
    value !== undefined ? formatTime(value) : ""
  );

  // Format seconds into HH:mm:ss
  function formatTime(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;
  }

  function padZero(num: number): string {
    return num.toString().padStart(2, "0");
  }

  // Convert HH:mm:ss string to seconds
  function timeToSeconds(timeStr: string): number {
    const [hours = "0", minutes = "0", seconds = "0"] = timeStr
      .replace(/[^\d:]/g, "")
      .split(":");
    return parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds);
  }

  // Format input as user types
  function handleChangeText(text: string) {
    const cleaned = text.replace(/[^\d:]/g, "");
    let formatted = cleaned;

    // Handle backspacing
    if (cleaned.length < localValue.replace(/[^\d:]/g, "").length) {
      setLocalValue(cleaned);
      return;
    }

    // Validate and format each section as user types
    if (cleaned.length >= 2) {
      // Minutes validation
      if (cleaned.length >= 3) {
        const minutes = cleaned.slice(3, 5);
        if (parseInt(minutes[0], 10) > 5) {
          formatted = localValue;
        }
      }

      // Seconds validation
      if (cleaned.length >= 6) {
        const seconds = cleaned.slice(6, 9);
        if (parseInt(seconds[0], 10) > 5) {
          formatted = localValue;
        }
      }

      // Add colons
      if (cleaned.length < 5 && !cleaned.includes(":")) {
        formatted = `${formatted.slice(0, 2)}:${formatted.slice(2)}`;
      } else if (cleaned.length >= 5 && !formatted.slice(5).includes(":")) {
        formatted = `${formatted.slice(0, 5)}:${formatted.slice(5)}`;
      }
    }

    if (formatted.length === 8) ref.current?.blurAndRemoveFocus();
    setLocalValue(formatted);
  }

  // Update parent when input is complete
  function handleBlur(e: NativeSyntheticEvent<TextInputFocusEventData>) {
    if (onBlur) onBlur(e);
    const seconds = timeToSeconds(localValue);
    onChange(seconds);
    setLocalValue(formatTime(seconds));
  }

  // Update local value when parent value changes
  React.useEffect(() => {
    setLocalValue(value !== undefined ? formatTime(value) : "");
  }, [value]);

  return (
    <Input
      ref={ref}
      value={localValue}
      onChangeText={handleChangeText}
      onBlur={handleBlur}
      maxLength={8}
      placeholder="00:00:00"
      keyboardType="number-pad"
      {...props}
    />
  );
};

export { TimeInput };
