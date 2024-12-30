import React, { useEffect, useState } from "react";
import { View, TouchableOpacity } from "react-native";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent } from "~/components/ui/card";
import { Text } from "~/components/ui/text";
import { LinearGradient } from "expo-linear-gradient";
import { TimerPickerModal } from "react-native-timer-picker";
import * as Haptics from "expo-haptics"; // for haptic feedback
import { TimerCard } from "~/components/TimerCard";
import { cn, formatDuration, getDurationObject } from "~/lib/utils";
import { Progress } from "~/components/ui/progress";
import {
  eventConfigStore,
  useIsLastSpeaker,
  useSpeaker,
} from "~/lib/store/eventConfig";
import { useSelector } from "@xstate/react";
import { Link, useLocalSearchParams } from "expo-router";
import { ArrowRight } from "~/lib/icons/ArrowRight";
import { Plus } from "~/lib/icons/Plus";
import { ArrowLeft } from "~/lib/icons/ArrowLeft";

function SetTime({
  value,
  defaultValue,
  placeholder,
  onChange,
  modalTitle,
}: {
  value: number | null;
  defaultValue?: number | null;
  onChange: (value: number) => void;
  placeholder: string;
  modalTitle: string;
}) {
  const [showPicker, setShowPicker] = useState(false);

  const initialValue = value ?? defaultValue;

  const isDefaultValueUsed =
    defaultValue === undefined ? false : value === null ? true : false;

  return (
    <>
      <TouchableOpacity activeOpacity={0.7} onPress={() => setShowPicker(true)}>
        <View>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setShowPicker(true)}
          >
            <Text
              className={cn(
                "text-2xl",
                isDefaultValueUsed && "text-muted-foreground"
              )}
            >
              {initialValue ? formatDuration(initialValue) : placeholder}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
      <TimerPickerModal
        initialValue={
          initialValue ? getDurationObject(initialValue) : undefined
        }
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
  const speakerIndexStr = useLocalSearchParams<{ speakerIndex?: string }>()
    .speakerIndex;
  const speakerIndex = parseInt(speakerIndexStr ?? "0");
  const defaultBlinkingStartTime = useSelector(
    eventConfigStore,
    (state) => state.context.defaultBlinkingStartTime
  );

  const speaker = useSpeaker(speakerIndex);

  const speakerName = speaker?.name ?? "";
  const setSpeakerName = (name: string) => {
    eventConfigStore.send({
      type: "setSpeakerName",
      speakerIndex,
      name,
    });
  };
  const countDown = speaker?.countDownTime ?? null;
  const setCountDown = (countDown: number) => {
    eventConfigStore.send({
      type: "setSpeakerContDownTime",
      speakerIndex,
      countDownTime: countDown,
    });
  };
  const blinkingStartTime = speaker?.blinkingStartTime ?? null;
  const setBlinkingStartTime = (blinkingStartTime: number) => {
    eventConfigStore.send({
      type: "setSpeakerBlinkingStartTime",
      speakerIndex,
      blinkingStartTime,
    });
  };

  const isLastSpeaker = useIsLastSpeaker(speakerIndex);

  const effectiveBlinkingStartTime =
    blinkingStartTime ?? defaultBlinkingStartTime;

  const prevButton = (
    <Link
      href={{
        pathname: "/",
        params: {
          speakerIndex: (speakerIndex - 1).toString(),
        },
      }}
      asChild
    >
      <Button
        variant="outline"
        className="bg-brand flex flex-row gap-2"
        disabled={speakerIndex === 0}
      >
        <ArrowLeft className="h-4 w-4 mr-2 color-primary-foreground" />
        <Text className="text-primary-foreground">Prev</Text>
      </Button>
    </Link>
  );

  const nextButton = (
    <Link
      href={{
        pathname: "/",
        params: {
          speakerIndex: (speakerIndex + 1).toString(),
        },
      }}
      asChild
    >
      <Button variant="outline" className="bg-brand gap-2 flex-row">
        <Text className="text-primary-foreground">
          {isLastSpeaker ? "Add" : "Next"}
        </Text>
        {isLastSpeaker ? (
          <Plus className="h-4 w-4 mr-2 color-primary-foreground" />
        ) : (
          <ArrowRight className="h-4 w-4 mr-2 color-primary-foreground" />
        )}
      </Button>
    </Link>
  );

  return (
    <View className="flex flex-1 gap-4 p-4 bg-secondary/30">
      {/* For some reason resizing doesn't happen when screen in background w/o progress bar */}
      <Progress
        value={10}
        className="h-2 hidden"
        indicatorClassName="bg-sky-600"
      />
      <Card>
        <CardContent className="p-6 flex flex-col gap-8">
          <View className="flex flex-row justify-between gap-8 md:gap-32">
            <View className="hidden md:flex">{prevButton}</View>
            <View className="flex flex-row grow gap-4 items-center">
              <Text className="text-3xl font-bold text-primary">
                Timer {speakerIndex + 1}:
              </Text>
              <Input
                placeholder="Speaker Name"
                value={speakerName}
                onChangeText={setSpeakerName}
                style={{ fontSize: 24, lineHeight: 32 }}
                className="flex-1 border-b border-t-0 border-l-0 border-r-0 rounded-none bg-transparent px-0 text-primary"
              />
            </View>
            <View className="hidden md:flex">{nextButton}</View>
          </View>
          <View className="flex flex-col md:flex-row justify-between gap-8">
            <View className="flex flex-row gap-12 justify-between">
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
            <View className="flex flex-row gap-12 justify-between">
              <Text className="text-2xl font-semibold mb-2 text-primary">
                Blink Start Time:
              </Text>
              <SetTime
                placeholder="Enter time"
                value={blinkingStartTime}
                defaultValue={defaultBlinkingStartTime}
                onChange={setBlinkingStartTime}
                modalTitle={`Set blinking start time for ${
                  speakerName || "Speaker"
                }`}
              />
            </View>
          </View>
          <View className="flex flex-row justify-between md:hidden">
            {prevButton}
            {nextButton}
          </View>
        </CardContent>
      </Card>
      <TimerCard
        speakerIndex={speakerIndex}
        countdownTime={countDown}
        startBlinkingTime={effectiveBlinkingStartTime}
        speakerName={speakerName}
      />
    </View>
  );
}
