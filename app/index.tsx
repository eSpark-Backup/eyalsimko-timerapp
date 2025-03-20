import { View } from "react-native";
import Card from "~/components/Card";
import { useSelector as useMachineSelector } from "@xstate/react";

import { ActiveTimerWidget } from "~/components/widgets/ActiveTimer";
import {
  MessageWidget,
  MessageWidgetHeader,
} from "~/components/widgets/Messages";
import TimerControls from "~/components/widgets/TimerControls";
import TimersList, { TimersListHeader } from "~/components/widgets/TimersList";
import { TimerContext } from "~/lib/store/timer";

export default function TimerScreen() {
  const actorRef = TimerContext.useActorRef();
  const timerIsRunning = useMachineSelector(
    actorRef,
    (state) => state.context.timer?.elapsed !== null
  );

  return (
    <View className="flex-1 gap-[24] pt-[20] px-[32] pb-[34]">
      <View className="flex-1 flex-row gap-[24]">
        <Card scrollable={true} header={<TimersListHeader />}>
          <TimersList />
        </Card>
        <View style={{ width: 360 }}>
          <Card
            spacing="small"
            borderColor={timerIsRunning ? "active" : "default"}
          >
            <ActiveTimerWidget />
          </Card>
        </View>
      </View>
      <View className="h-[425] flex-row gap-[24]">
        <View className="flex-1">
          <Card header={<MessageWidgetHeader />} scrollable={true}>
            <MessageWidget />
          </Card>
        </View>
        <View className="flex-1">
          <Card>
            <TimerControls />
          </Card>
        </View>
      </View>
    </View>
  );
}
