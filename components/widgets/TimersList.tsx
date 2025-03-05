import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { Button } from "../ui/button";
import { Plus } from "~/lib/icons/Plus";
import { Eye } from "~/lib/icons/Eye";
import { cn, formatCountdown } from "~/lib/utils";
import { IconButton } from "../iconButton";
export const TimersListHeader = () => {
  return (
    <View className="flex-row justify-between items-center">
      <Text className="text-lg font-semibold">List of Events</Text>
      <Button size="sm" icon={Plus}>
        <Text>Add New Timer</Text>
      </Button>
    </View>
  );
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  timeStyle: "medium",
});

export default function TimersList() {
  const runningTimerIndex = 0;
  const timers = [
    {
      speakerName: "David",
      countdownTime: 1000,
      elapsedTime: 100,
      flashStartTime: 60,
      timerName: "Goals of the evening",
      startedAt: new Date(),
      speakerIndex: 0,
      description: "Moves around a lot",
    },
    {
      speakerName: "David",
      countdownTime: 1000,
      elapsedTime: 100,
      flashStartTime: 60,
      startedAt: null,
      timerName: "Goals of the evening",
      speakerIndex: 1,
    },
    {
      speakerName: "David",
      countdownTime: 1000,
      elapsedTime: 100,
      startedAt: null,
      flashStartTime: 60,
      timerName: "Goals of the evening",
      speakerIndex: 2,
    },
    {
      speakerName: "David",
      countdownTime: 1000,
      elapsedTime: 100,
      startedAt: null,
      flashStartTime: 60,
      timerName: "Goals of the evening",
      speakerIndex: 3,
    },
  ];
  return (
    <View className="gap-[12]">
      {timers.map((timer) => (
        <View
          key={timer.speakerIndex}
          className={cn(
            "flex-row items-center rounded-[8] py-[12] px-[20] gap-[16]",
            timer.speakerIndex === runningTimerIndex && "bg-item-highlight",
            timer.speakerIndex !== runningTimerIndex && "bg-item"
          )}
        >
          <Eye color="hsla(213, 5%, 57%, 1)" className="h-[16]" />
          <View className="flex-1 flex-row items-center justify-between">
            <View className="flex-row items-center gap-[16]">
              <Text
                style={{ color: "hsla(0, 0%, 100%, 0.5)" }}
                className="text-md w-[20]"
              >
                {timer.speakerIndex + 1}
              </Text>
              <Text className="color-primary text-md w-[100]">
                {timer.startedAt ? dateFormatter.format(timer.startedAt) : ""}
              </Text>
              <View className="w-[60]">
                <Text className="color-primary">
                  {formatCountdown({
                    countdownTime: timer.countdownTime,
                    elapsedTime: timer.countdownTime,
                  })}
                </Text>
              </View>
              <View className="gap-[4]">
                <View className="flex-row gap-[12]">
                  <Text>{timer.timerName}</Text>
                  <Text style={{ color: "hsla(0, 0%, 100%, 0.5)" }}>
                    {timer.speakerName}
                  </Text>
                </View>
                {timer.description && (
                  <Text
                    style={{ color: "hsla(0, 0%, 100%, 0.5)" }}
                    className="text-sm"
                  >
                    {timer.description}
                  </Text>
                )}
              </View>
            </View>
            <View className="flex-row gap-[16] self-end">
              {timer.speakerIndex === runningTimerIndex ? (
                <IconButton size="sm" variant="primary" icon={Eye} />
              ) : (
                <IconButton size="sm" variant="success" icon={Eye} />
              )}
              <IconButton size="sm" icon={Eye} />
              <IconButton size="sm" icon={Eye} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}
