import { Animated, Easing, View } from "react-native";
import { Card, CardContent, CardFooter } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "@xstate/react";
import { SetupEvent, TimerContext } from "~/lib/store/timer";
import { cn, formatDuration } from "~/lib/utils";
import { Play } from "~/lib/icons/Play";
import { Pause } from "~/lib/icons/Pause";
import { RotateCcw } from "~/lib/icons/RotateCcw";
import { Square } from "~/lib/icons/Square";
import { eventConfigStore } from "~/lib/store/eventConfig";
import { Input } from "./ui/input";
import { connectionActor } from "~/lib/store/connectionStore";
import Toast from "react-native-toast-message";

export const BlinkingLine = ({ isBlinking }: { isBlinking: boolean }) => {
  const movingValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(movingValue, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.linear,
        }),
        Animated.timing(movingValue, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.linear,
        }),
        Animated.timing(movingValue, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.linear,
        }),
      ])
    );
    if (isBlinking) {
      animation.start();
    } else {
      animation.stop();
      Animated.timing(movingValue, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isBlinking]);

  return (
    <Animated.View
      className="bg-red-600 w-1 md:w-2 h-5 md:h-9"
      style={{ opacity: movingValue }}
    />
  );
};

function Countdown() {
  const actorRef = TimerContext.useActorRef();
  const blinkLength = useSelector(
    eventConfigStore,
    (state) => state.context.blinkLength
  );
  const timer = useSelector(actorRef, (state) => state.context.timer);
  const isRunning = useSelector(actorRef, (state) =>
    state.matches({
      ACTIVE: "running",
    })
  );
  if (!timer) return null;

  const isOverdue = timer.elapsed === null ? false : timer.elapsed < 0;
  const timerColor = isOverdue
    ? "text-red-500"
    : isRunning
    ? "text-green-500"
    : "text-primary";

  const blinkTimePeriod = {
    start: timer.blinkingStartTime,
    end: blinkLength === null ? 0 : timer.blinkingStartTime - blinkLength,
  };

  const inBlinkTimePeriod = timer.elapsed
    ? timer.elapsed <= blinkTimePeriod.start &&
      timer.elapsed >= blinkTimePeriod.end
    : false;

  const displayTime =
    timer.elapsed === null ? timer.countdownTime : Math.abs(timer.elapsed);

  const blinkPeriod = (
    <Text className="text-2xl">
      Blink from {formatDuration(blinkTimePeriod.start)} till{" "}
      {formatDuration(blinkTimePeriod.end)}
    </Text>
  );

  const isBlinking = inBlinkTimePeriod && isRunning;

  return (
    <View className="flex flex-col md:flex-row md:landscape:flex-col gap-2 md:gap-4 items-baseline">
      <View className="flex flex-row gap-1 items-baseline">
        <Text className="text-2xl">
          Timer {timer.eventId + 1}: {timer.eventId}:
        </Text>
        <View className="flex flex-row gap-0.5"></View>
        <BlinkingLine isBlinking={isBlinking} />
        <Text className={cn("text-3xl md:text-5xl", timerColor)}>
          {formatDuration(displayTime)}
        </Text>
        <BlinkingLine isBlinking={isBlinking} />
      </View>
      {blinkPeriod}
    </View>
  );
}

function CountdownControls() {
  const actorRef = TimerContext.useActorRef();
  const isActive = useSelector(actorRef, (state) => state.matches("ACTIVE"));
  const isRunning = useSelector(actorRef, (state) =>
    state.matches({ ACTIVE: "running" })
  );
  const isPaused = useSelector(actorRef, (state) =>
    state.matches({
      ACTIVE: "paused",
    })
  );
  const isStopped = useSelector(actorRef, (state) =>
    state.matches({
      ACTIVE: "stopped",
    })
  );
  const canStop = useSelector(actorRef, (state) => state.can({ type: "stop" }));
  const canPause = useSelector(actorRef, (state) =>
    state.can({ type: "pause" })
  );
  const canResume = useSelector(actorRef, (state) =>
    state.can({ type: "resume" })
  );

  return (
    <View className="flex sm:flex-1 flex-row gap-4 justify-between md:justify-end">
      {isRunning && (
        <Button
          variant="outline"
          size="lg"
          disabled={!canPause}
          className="h-14 bg-secondary flex-row items-center gap-2"
          onPress={() => actorRef.send({ type: "pause" })}
        >
          <Pause className="color-primary" />
          <Text className="text-primary text-lg">Pause</Text>
        </Button>
      )}
      {isPaused && (
        <Button
          variant="outline"
          size="lg"
          className="h-14 bg-secondary flex-row items-center gap-2"
          disabled={!canResume}
          onPress={() => actorRef.send({ type: "resume" })}
        >
          <Play className="color-primary" />
          <Text className="text-primary text-lg">Resume</Text>
        </Button>
      )}
      {isStopped && (
        <Button
          variant="outline"
          size="lg"
          className="h-14 bg-secondary flex-row items-center gap-2"
          onPress={() => actorRef.send({ type: "start" })}
        >
          <Play className="color-primary" />
          <Text className="text-primary text-lg">Start</Text>
        </Button>
      )}
      {isActive && (
        <Button
          variant="outline"
          size="lg"
          disabled={!canStop}
          className="h-14 bg-secondary flex-row items-center gap-2"
          onPress={() => actorRef.send({ type: "stop" })}
        >
          <Square className="text-primary fill-primary" />
          <Text className="text-primary text-lg">Stop</Text>
        </Button>
      )}
    </View>
  );
}

export const TimerCard = ({
  speakerIndex,
  countdownTime,
  speakerName,
  startBlinkingTime,
}: {
  speakerIndex: number;
  countdownTime: number | null;
  startBlinkingTime: number | null;
  speakerName: string;
}) => {
  const actorRef = TimerContext.useActorRef();

  const canSetMessage = useSelector(actorRef, (state) =>
    state.can({ type: "setMessage", data: { message: "" } })
  );
  const canShowMessage = useSelector(actorRef, (state) =>
    state.can({ type: "showMessage" })
  );
  const canHideMessage = useSelector(actorRef, (state) =>
    state.can({ type: "hideMessage" })
  );
  const messageIsVisible = useSelector(
    actorRef,
    (state) => state.context.timer?.messageIsVisible ?? false
  );

  const canToggleMessage = canShowMessage || canHideMessage;

  const message = useSelector(
    actorRef,
    (state) => state.context.timer?.message ?? ""
  );

  const toggleMessage = () => {
    if (messageIsVisible) {
      actorRef.send({ type: "hideMessage" });
    } else {
      actorRef.send({ type: "showMessage" });
    }
  };

  const setupEvent: SetupEvent = {
    type: "setup",
    data: {
      countdownTime: countdownTime ?? 0,
      blinkingStartTime: startBlinkingTime ?? 0,
      blinkLength: 0,
      eventId: "123",
    },
  } as const;
  const canSetup = useSelector(actorRef, (state) => state.can(setupEvent));

  const isConnected = useSelector(connectionActor, (state) =>
    state.matches("CONNECTED")
  );
  const canReset = isConnected ? canSetup : true;

  return (
    <Card className="flex-1">
      <CardContent className="p-6 flex flex-1 flex-col gap-8">
        <View className="flex flex-col gap-6 md:flex-row md:justify-between">
          <Countdown />
          <CountdownControls />
        </View>
      </CardContent>
      <CardFooter>
        <View className="flex flex-col flex-1 gap-8">
          <Button
            variant="destructive"
            size="lg"
            className="w-full h-14 bg-brand flex-row items-center gap-2"
            disabled={!canReset}
            onPress={() => {
              if (!isConnected) {
                Toast.show({
                  type: "error",
                  text1: "Not connected",
                  text2:
                    "Not connected to module. Please choose connect over WIRELESS or WIRED from the settings menu.",
                });
                return;
              }
              actorRef.send({ type: "reset" });
              actorRef.send(setupEvent);
            }}
          >
            <RotateCcw className="color-primary-foreground" />
            <Text className="text-primary-foreground text-lg">Reset</Text>
          </Button>
          <View className="flex flex-col md:flex-row gap-4 md:gap-8">
            <View className="flex-1">
              {!messageIsVisible && (
                <Input
                  editable={canSetMessage}
                  placeholder={`Message for the ${speakerName || "Speaker"}`}
                  className="flex-1"
                  numberOfLines={1}
                  value={message}
                  style={{ fontSize: 21, lineHeight: 28 }}
                  onChangeText={(text) => {
                    actorRef.send({
                      type: "setMessage",
                      data: { message: text },
                    });
                  }}
                  maxLength={40}
                />
              )}
              {messageIsVisible && (
                <Input
                  editable={false}
                  placeholder={`Message for the ${speakerName || "Speaker"}`}
                  className="flex-1 border-brand text-brand opacity-1"
                  numberOfLines={1}
                  value={message}
                  style={{ fontSize: 21, lineHeight: 28 }}
                  onChangeText={(text) => {
                    actorRef.send({
                      type: "setMessage",
                      data: { message: text },
                    });
                  }}
                  maxLength={40}
                />
              )}
            </View>
            <Button
              variant="destructive"
              size="lg"
              className="h-14 bg-brand"
              onPress={toggleMessage}
              disabled={!canToggleMessage}
            >
              <Text className="text-primary-foreground text-lg">
                {messageIsVisible ? "Hide" : "Show"} Message
              </Text>
            </Button>
          </View>
        </View>
      </CardFooter>
    </Card>
  );
};
