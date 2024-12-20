import React, { ComponentProps, useState } from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent } from "~/components/ui/card";
import { Text } from "~/components/ui/text";
import { LinearGradient } from "expo-linear-gradient";
import { TimerPickerModal } from "react-native-timer-picker";
import * as Haptics from "expo-haptics"; // for haptic feedback

type Duration = Parameters<
  ComponentProps<typeof TimerPickerModal>["onConfirm"]
>[0];

function SetTime({
  value,
  placeholder,
  onChange,
  modalTitle,
}: {
  value?: Duration;
  onChange: (value: Duration) => void;
  placeholder: string;
  modalTitle: string;
}) {
  const [showPicker, setShowPicker] = useState(false);

  const formatValue = ({
    hours,
    minutes,
    seconds,
  }: {
    hours?: number;
    minutes?: number;
    seconds?: number;
  }) => {
    const timeParts = [];

    if (hours !== undefined) {
      timeParts.push(hours.toString().padStart(2, "0"));
    }
    if (minutes !== undefined) {
      timeParts.push(minutes.toString().padStart(2, "0"));
    }
    if (seconds !== undefined) {
      timeParts.push(seconds.toString().padStart(2, "0"));
    }

    return timeParts.join(":");
  };

  return (
    <>
      <TouchableOpacity activeOpacity={0.7} onPress={() => setShowPicker(true)}>
        <View>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setShowPicker(true)}
          >
            <Text className="text-2xl">
              {value ? formatValue(value) : placeholder}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
      <TimerPickerModal
        visible={showPicker}
        setIsVisible={setShowPicker}
        onConfirm={(pickedDuration) => {
          onChange(pickedDuration);
          setShowPicker(false);
        }}
        modalTitle={modalTitle}
        onCancel={() => setShowPicker(false)}
        closeOnOverlayPress
        LinearGradient={LinearGradient}
        Haptics={Haptics}
        styles={{
          theme: "dark",
        }}
        modalProps={{
          overlayOpacity: 0.2,
        }}
      />
    </>
  );
}

export default function TimerScreen() {
  const [countDown, setCountDown] = useState<Duration | undefined>();
  const [blinkingStartTime, setBlinkingStartTime] = useState<
    Duration | undefined
  >();
  const [speakerName, setSpeakerName] = useState("");
  const [time, setTime] = useState("01:00");
  const [isRunning, setIsRunning] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-secondary">
      <ScrollView className="flex flex-1">
        <View className="flex flex-1 gap-4 px-4">
          <Card>
            <CardContent className="p-6 flex flex-col gap-8">
              <View className="flex flex-row justify-between gap-8 md:gap-32">
                <Button variant="outline" className="bg-brand">
                  <Text className="text-primary-foreground">Prev</Text>
                </Button>
                <View className="flex flex-row grow gap-4 items-center">
                  <Text className="text-3xl font-bold text-primary">
                    Timer 1:
                  </Text>
                  <Input
                    placeholder="Speaker Name"
                    value={speakerName}
                    onChangeText={setSpeakerName}
                    style={{ fontSize: 24, lineHeight: 32 }}
                    className="flex-1 border-b border-t-0 border-l-0 border-r-0 rounded-none bg-transparent px-0 text-primary"
                  />
                </View>

                <Button variant="outline" className="bg-brand">
                  <Text className="text-primary-foreground">Next</Text>
                </Button>
              </View>
              <View className="flex flex-col md:flex-row justify-between gap-8 px-12">
                <View className="flex flex-row gap-12">
                  <Text className="text-2xl font-semibold mb-2 text-primary">
                    Countdown Time:
                  </Text>
                  <SetTime
                    placeholder="Enter time"
                    value={countDown}
                    onChange={setCountDown}
                    modalTitle={`Set countdown time for ${
                      speakerName || "Speaker"
                    }`}
                  />
                </View>
                <View className="flex flex-row gap-12">
                  <Text className="text-2xl font-semibold mb-2 text-primary">
                    Blink Start Time:
                  </Text>
                  <SetTime
                    placeholder="Enter time"
                    value={blinkingStartTime}
                    onChange={setBlinkingStartTime}
                    modalTitle={`Set blinking start time for ${
                      speakerName || "Speaker"
                    }`}
                  />
                </View>
              </View>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex flex-col gap-8">
              <View className="flex flex-col gap-4">
                <View className="flex flex-row gap-4">
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex-1 h-14 bg-secondary"
                    onPress={() => setIsRunning(true)}
                  >
                    <Text className="text-primary text-lg">Start</Text>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex-1 h-14 bg-secondary"
                    onPress={() => setIsRunning(false)}
                  >
                    <Text className="text-primary text-lg">Stop</Text>
                  </Button>
                </View>
                <Button
                  variant="destructive"
                  size="lg"
                  className="w-full h-14 bg-brand"
                  onPress={() => {
                    setIsRunning(false);
                    setTime("01:00");
                  }}
                >
                  <Text className="text-primary-foreground text-lg">Reset</Text>
                </Button>
              </View>

              <Button
                variant="destructive"
                size="lg"
                className="w-full h-14 bg-brand"
                onPress={() => setShowMessage(!showMessage)}
              >
                <Text className="text-primary-foreground text-lg">
                  Show Message
                </Text>
              </Button>

              {showMessage && (
                <Text className="text-2xl font-semibold text-brand border-b border-brand pb-2">
                  Time is up!
                </Text>
              )}
            </CardContent>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
