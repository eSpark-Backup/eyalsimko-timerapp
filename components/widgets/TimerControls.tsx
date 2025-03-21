import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { Button } from "~/components/ui/button";
import { useSelector as useMachineSelector } from "@xstate/react";
import { Pause } from "~/lib/icons/Pause";
import { formatCountdown, formatDuration } from "~/lib/utils";
import { useState } from "react";
import { IconButton } from "../iconButton";
import { SkipBack } from "~/lib/icons/SkipBack";
import { SkipForward } from "~/lib/icons/SkipForward";
import { Switch } from "../ui/switch";
import { TimerContext } from "~/lib/store/timer";
import { useSelector } from "@xstate/store/react";
import { eventConfigStore } from "~/lib/store/eventConfig";
import { Play } from "~/lib/icons/Play";

export default function TimerControls() {
  const actorRef = TimerContext.useActorRef();
  const timer = useMachineSelector(actorRef, (state) => state.context.timer);
  const event = useSelector(eventConfigStore, () =>
    eventConfigStore
      .getSnapshot()
      .context.events.find((event) => event.id === timer?.eventId)
  );
  const eventIndex = useSelector(eventConfigStore, (state) =>
    state.context.events.findIndex((event) => event.id === timer?.eventId)
  );
  const previousEvent = useSelector(eventConfigStore, (state) =>
    eventIndex > 0 ? state.context.events.at(eventIndex - 1) : null
  );
  const nextEvent = useSelector(eventConfigStore, (state) =>
    state.context.events.at(eventIndex + 1)
  );

  const isRunning = useMachineSelector(actorRef, (state) =>
    state.matches({ ACTIVE: "running" })
  );
  const isStopped = useMachineSelector(actorRef, (state) =>
    state.matches({ ACTIVE: "stopped" })
  );

  const [blackoutActive, setBlackoutActive] = useState(false);
  const [glowActive, setGlowActive] = useState(false);

  if (!timer || !event) return null;

  return (
    <View className="flex-col gap-[16]">
      <View className="flex-row justify-between items-center">
        <Button size="sm">
          <Text>-1m</Text>
        </Button>
        <View className="flex-row gap-[24] items-center">
          <IconButton
            size="sm"
            disabled={!previousEvent}
            icon={SkipBack}
            onPress={() => {
              if (!previousEvent) return;
              actorRef.send({
                type: "setup",
                data: { eventId: previousEvent.id },
              });
              actorRef.send({ type: "start" });
            }}
          />
          {isRunning ? (
            <IconButton
              size="lg"
              icon={Pause}
              onPress={() => {
                actorRef.send({ type: "pause" });
              }}
            />
          ) : (
            <IconButton
              size="lg"
              icon={Play}
              onPress={() => {
                if (isStopped) {
                  actorRef.send({
                    type: "start",
                  });
                } else {
                  actorRef.send({ type: "resume" });
                }
              }}
            />
          )}
          <IconButton
            size="sm"
            disabled={!nextEvent}
            icon={SkipForward}
            onPress={() => {
              if (!nextEvent) return;
              actorRef.send({
                type: "setup",
                data: { eventId: nextEvent.id },
              });
              actorRef.send({ type: "start" });
            }}
          />
        </View>
        <Button size="sm">
          <Text>+1m</Text>
        </Button>
      </View>
      <View className="flex-row justify-between">
        {/* TODO: revisit all text and set 20pt line height*/}
        <Text className="text-md font-normal">Countdown Timer</Text>
        <Text className="text-md font-normal">
          {formatCountdown({
            countdownTime: timer.countdownTime,
            elapsedTime: timer.countdownTime,
          })}
        </Text>
      </View>
      <View className="flex-row justify-between items-center">
        <Text className="font-normal ">Flash Timer</Text>
        <Text className="font-normal ">
          {formatDuration(event.blinkingStartTime, true)}
        </Text>
      </View>
      <View className="flex-row justify-between items-center">
        <Text className="font-normal ">Flash Length</Text>
        <Text className="font-normal ">
          {formatDuration(event.blinkLength, true)}
        </Text>
      </View>
      <View className="flex-row justify-between items-center">
        <Text className="font-normal ">Glow Effect</Text>
        <Switch
          checked={glowActive}
          onCheckedChange={() => setGlowActive(!glowActive)}
        />
      </View>
      <View className="flex-row justify-between items-center">
        <Text className="font-normal ">Blackout Screen</Text>
        <Switch
          checked={blackoutActive}
          onCheckedChange={() => setBlackoutActive(!blackoutActive)}
        />
      </View>
      <View className="flex-row justify-between items-center">
        <Text className="font-normal ">Elapsed Time</Text>
        {timer.elapsed !== null && (
          <View className="border-highlight border py-[8] px-[12] rounded-[8]">
            <Text className="font-normal ">
              {formatCountdown({
                countdownTime: timer.countdownTime,
                elapsedTime: timer.elapsed,
              })}
            </Text>
          </View>
        )}
      </View>
      <View
        style={{ backgroundColor: "hsla(210, 32%, 13%, 1)" }}
        className="flex-row gap-[16] rounded-[12] py-[12] px-[16]"
      >
        <Text>{eventIndex + 1}</Text>
        <View>
          <Text>{event.name}</Text>
          <Text>{event.speakerName}</Text>
        </View>
      </View>
    </View>
  );
}
