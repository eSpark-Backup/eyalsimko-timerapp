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
import { TimerCard } from "~/components/TimerCard";
import { formatDuration, getDurationObject } from "~/lib/utils";

function SetTime({
  value,
  placeholder,
  onChange,
  modalTitle,
}: {
  value?: number;
  onChange: (value: number) => void;
  placeholder: string;
  modalTitle: string;
}) {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <>
      <TouchableOpacity activeOpacity={0.7} onPress={() => setShowPicker(true)}>
        <View>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setShowPicker(true)}
          >
            <Text className="text-2xl">
              {value ? formatDuration(value) : placeholder}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
      <TimerPickerModal
        initialValue={value ? getDurationObject(value) : undefined}
        visible={showPicker}
        setIsVisible={setShowPicker}
        onConfirm={(pickedDuration) => {
          onChange(
            pickedDuration.hours * 3600 +
              pickedDuration.minutes * 60 +
              pickedDuration.seconds
          );
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
  const [countDown, setCountDown] = useState<number | undefined>(0);
  const [blinkingStartTime, setBlinkingStartTime] = useState<
    number | undefined
  >(0);
  const [speakerName, setSpeakerName] = useState("");

  return (
    <View className="flex flex-1 gap-4 p-4 bg-secondary">
      <Card>
        <CardContent className="p-6 flex flex-col gap-8">
          <View className="flex flex-row justify-between gap-8 md:gap-32">
            <Button variant="outline" className="bg-brand">
              <Text className="text-primary-foreground">Prev</Text>
            </Button>
            <View className="flex flex-row grow gap-4 items-center">
              <Text className="text-3xl font-bold text-primary">Timer 1:</Text>
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
      <TimerCard
        countdownTime={countDown}
        startBlinkingTime={blinkingStartTime}
        speakerName={speakerName}
      />
    </View>
  );
}
