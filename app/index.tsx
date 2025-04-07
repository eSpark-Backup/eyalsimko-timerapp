import * as React from "react";
import { View } from "react-native";

import Card from "~/components/Card";
import { useSelector as useMachineSelector } from "@xstate/react";

import { ActiveTimerWidget } from "~/components/widgets/ActiveTimer";
import TimerControls from "~/components/widgets/TimerControls";
import { TimerContext } from "~/lib/store/timer";
import { ConnectionLostModal } from "~/components/ConnectionLostModal";
import MessagesCard from "~/components/cards/MessagesCard";
import TimersListCard from "~/components/cards/TimersListCard";
import { Header } from "~/components/header";
import { Modals } from "~/components/Modals";
import { useModal } from "~/lib/context/ModalContext";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";

export default function TimerScreen() {
  const actorRef = TimerContext.useActorRef();
  const timerIsActive = useMachineSelector(actorRef, (state) =>
    state.matches("ACTIVE")
  );
  const modal = useModal();
  return (
    <>
      <KeyboardAvoidingView
        enabled={modal.type === "none"}
        behavior={"position"}
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <Header />
        <View className="flex-1 gap-[24] pt-[20] px-[32] pb-[34]">
          <View className="flex-1 flex-row gap-[24]">
            <TimersListCard />
            <View style={{ width: 395 }}>
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
      <Modals />
    </>
  );
}
