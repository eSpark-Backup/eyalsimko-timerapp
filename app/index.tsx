import * as React from "react";
import { KeyboardAvoidingView, View } from "react-native";
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
import { ConnectionLostModal } from "~/components/ConnectionLostModal";
import MessagesCard from "~/components/cards/MessagesCard";
import TimersListCard from "~/components/cards/TimersListCard";
import { Header } from "~/components/header";
import { Modals } from "~/components/Modals";
import { useSelector } from "@xstate/store/react";
import { modalStore } from "~/lib/store/modalStore";
import { useRouter } from "expo-router";

export default function TimerScreen() {
  const actorRef = TimerContext.useActorRef();
  const timerIsActive = useMachineSelector(actorRef, (state) =>
    state.matches("ACTIVE")
  );
  const modal = useSelector(modalStore, (state) => state.context.modal);
  return (
    <>
      <Modals />
      <KeyboardAvoidingView
        behavior={modal ? undefined : "position"}
        keyboardVerticalOffset={0}
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <Header />
        <View className="flex-1 gap-[24] pt-[20] px-[32] pb-[34]">
          <View className="flex-1 flex-row gap-[24]">
            <TimersListCard />
            <View style={{ width: 360 }}>
              <Card
                spacing="small"
                borderColor={timerIsActive ? "active" : "default"}
              >
                <ActiveTimerWidget />
              </Card>
            </View>
          </View>
          <View className="h-[400] flex-row gap-[24]">
            <View className="flex-1">
              <MessagesCard />
            </View>
            <View className="flex-1">
              <Card>
                <TimerControls />
              </Card>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
      <ConnectionLostModal />
    </>
  );
}
