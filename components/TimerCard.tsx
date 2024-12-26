import { Animated, Easing, View } from "react-native";
import { Card, CardContent, CardFooter } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "@xstate/react";
import { TimerContext } from "~/lib/store/timer";
import { cn, formatDuration } from "~/lib/utils";
import { Play } from "~/lib/icons/Play";
import { Pause } from "~/lib/icons/Pause";
import { RotateCcw } from "~/lib/icons/RotateCcw";
import { Square } from "~/lib/icons/Square";
import { eventConfigStore } from "~/lib/store/eventConfig";

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
      className="bg-red-600 w-2"
      style={{ opacity: movingValue, height: 29 }}
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
    start: timer.startBlinkingTime,
    end: blinkLength === null ? 0 : timer.startBlinkingTime - blinkLength,
  };

  const inBlinkTimePeriod = timer.elapsed
    ? timer.elapsed <= blinkTimePeriod.start &&
      timer.elapsed >= blinkTimePeriod.end
    : false;

  const displayTime =
    timer.elapsed === null ? timer.countdownTime : Math.abs(timer.elapsed);

  return (
    <View className="flex flex-row gap-2 text-2xl items-baseline">
      <Text className="text-xl">Timer {timer.speakerName}:</Text>
      <View className="flex flex-row gap-0.5">
        <BlinkingLine isBlinking={inBlinkTimePeriod} />
        <Text className={cn("text-5xl", timerColor)}>
          {formatDuration(displayTime)}
        </Text>
        <BlinkingLine isBlinking={inBlinkTimePeriod} />
      </View>
    </View>
  );
}

function CountdownControls() {
  const actorRef = TimerContext.useActorRef();
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

  return (
    <View className="flex sm:flex-1 flex-row gap-4 justify-between md:justify-end">
      {isRunning && (
        <Button
          variant="outline"
          size="lg"
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
      {canStop && (
        <Button
          variant="outline"
          size="lg"
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
  countdownTime,
  speakerName,
  startBlinkingTime,
}: {
  countdownTime: number | null;
  startBlinkingTime: number | null;
  speakerName: string;
}) => {
  const [showMessage, setShowMessage] = useState(false);

  const actorRef = TimerContext.useActorRef();

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
            disabled={!countdownTime || !startBlinkingTime}
            onPress={() => {
              actorRef.send({ type: "reset" });
              countdownTime &&
                startBlinkingTime &&
                actorRef.send({
                  type: "setup",
                  data: {
                    speakerName,
                    countdownTime,
                    startBlinkingTime,
                  },
                });
            }}
          >
            <RotateCcw className="color-primary-foreground" />
            <Text className="text-primary-foreground text-lg">Reset</Text>
          </Button>
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
        </View>
      </CardFooter>
    </Card>
  );
};
