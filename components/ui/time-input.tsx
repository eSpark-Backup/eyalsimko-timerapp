import * as React from "react";
import {
  NativeSyntheticEvent,
  TextInput,
  TextInputFocusEventData,
} from "react-native";
import { Input, TextInputRef } from "~/components/ui/input";
import { Clocks } from "~/lib/icons/Clocks";

interface TimeInputProps
  extends Omit<React.ComponentProps<typeof Input>, "value" | "onChange"> {
  value?: number | null; // value in seconds
  onChange: (newValue: number) => void;
}

const emptyStringToNull = (value: string) => (value === "" ? null : value);

const TimeInput = ({ value, onChange, onBlur, ...props }: TimeInputProps) => {
  const ref = React.useRef<TextInputRef>(null);
  const [localValue, setLocalValue] = React.useState(() =>
    value !== null && value !== undefined ? formatTime(value) : ""
  );
  const localValueRef = React.useRef(localValue);

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
  function timeToSeconds(timeStr: string): number | null {
    const cleaned = timeStr.replace(/[^\d]/g, "");
    const hours = emptyStringToNull(cleaned.slice(0, 2));
    const minutes = emptyStringToNull(cleaned.slice(2, 4));
    const seconds = emptyStringToNull(cleaned.slice(4, 6));
    if (!hours || !minutes || !seconds) return null;

    return parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds);
  }

  // Format input as user types
  function handleChangeText(text: string) {
    const cleaned = text.replace(/[^\d]/g, "");
    const hours = emptyStringToNull(cleaned.slice(0, 2));
    const minutes = emptyStringToNull(cleaned.slice(2, 4));
    const seconds = emptyStringToNull(cleaned.slice(4, 6));

    // Validate and format each section as user types
    if (cleaned.length >= 2) {
      // Minutes validation
      if (minutes) {
        if (parseInt(minutes[0], 10) > 5) {
          return;
        }
      }

      // Seconds validation
      if (seconds) {
        if (parseInt(seconds[0], 10) > 5) {
          return;
        }
      }
    }
    // Add colons
    const formatted = [hours, minutes, seconds].filter(Boolean).join(":");

    setLocalValue(formatted);
    localValueRef.current = formatted;
    if (formatted.length === 8) ref.current?.blurAndRemoveFocus();
  }

  // Update parent when input is complete
  function handleBlur(e: NativeSyntheticEvent<TextInputFocusEventData>) {
    if (onBlur) onBlur(e);
    const seconds = timeToSeconds(localValueRef.current);
    if (seconds !== null) {
      onChange(seconds);
      setLocalValue(formatTime(seconds));
    } else {
      setLocalValue("");
      localValueRef.current = "";
    }
  }

  // Update local value when parent value changes
  React.useEffect(() => {
    setLocalValue(
      value !== null && value !== undefined ? formatTime(value) : ""
    );
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
      icon={Clocks}
      {...props}
    />
  );
};

export { TimeInput };
