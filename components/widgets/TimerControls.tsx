import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { Button } from "~/components/ui/button";
import { Pause } from "~/lib/icons/Pause";
import { formatCountdown, formatDuration } from "~/lib/utils";
import { useState } from "react";
import { IconButton } from "../iconButton";
import { SkipBack } from "~/lib/icons/SkipBack";
import { SkipForward } from "~/lib/icons/SkipForward";

let timer = {
  speakerName: "David",
  countdownTime: 1000,
  elapsedTime: 100,
  flashStartTime: 60,
  flashLength: 25,
  timerName: "Goals of the evening",
  speakerIndex: 0,
};
// timer = null;

export default function TimerControls() {
  const [blackoutActive, setBlackoutActive] = useState(false);
  const [glowActive, setGlowActive] = useState(false);

  if (!timer) return null;

  return (
    <View className="flex-col gap-[16]">
      <View className="flex-row justify-between items-center">
        <Button size="sm">
          <Text>-1m</Text>
        </Button>
        <View className="flex-row gap-[24] items-center">
          <IconButton size="sm" icon={SkipBack} />
          <IconButton size="lg" icon={Pause} />
          <IconButton size="sm" icon={SkipForward} />
        </View>
        <Button size="sm">
          <Text>+1m</Text>
        </Button>
      </View>
      <View className="flex-row justify-between">
        {/* TODO: revisit all text and set 20pt line height*/}
        <Text className="text-md font-normal leading-6">Countdown Timer</Text>
        <Text className="text-md font-normal leading-6">
          {formatCountdown({
            countdownTime: timer.countdownTime,
            elapsedTime: timer.countdownTime,
          })}
        </Text>
      </View>
      <View className="flex-row justify-between items-center">
        <Text className="font-normal leading-6">Flash Timer</Text>
        <Text className="font-normal leading-6">
          {formatDuration(timer.flashStartTime, true)}
        </Text>
      </View>
      <View className="flex-row justify-between items-center">
        <Text className="font-normal leading-6">Flash Length</Text>
        <Text className="font-normal leading-6">
          {formatDuration(timer.flashLength, true)}
        </Text>
      </View>
      <View className="flex-row justify-between items-center">
        <Text className="font-normal leading-6">Glow Effect</Text>
        <Button
          size="sm"
          variant={glowActive ? "primary" : "default"}
          onPress={() => setGlowActive(!glowActive)}
        >
          <Text>Glow</Text>
        </Button>
      </View>
      <View className="flex-row justify-between items-center">
        <Text className="font-normal leading-6">Blackout Screen</Text>
        <Button
          size="sm"
          variant={blackoutActive ? "primary" : "default"}
          onPress={() => setBlackoutActive(!blackoutActive)}
        >
          <Text>Blackout</Text>
        </Button>
      </View>
      <View className="flex-row justify-between items-center">
        <Text className="font-normal leading-6">Elapsed Time</Text>
        <View className="border-highlight border py-[8] px-[12] rounded-[8]">
          <Text className="font-normal leading-6">
            {formatCountdown({
              countdownTime: timer.countdownTime,
              elapsedTime: timer.elapsedTime,
            })}
          </Text>
        </View>
      </View>
      <View
        style={{ backgroundColor: "hsla(210, 32%, 13%, 1)" }}
        className="flex-row gap-[16] rounded-[12] py-[12] px-[16]"
      >
        <Text>{timer.speakerIndex + 1}</Text>
        <View>
          <Text>{timer.timerName}</Text>
          <Text>{timer.speakerName}</Text>
        </View>
      </View>
    </View>
  );
}
