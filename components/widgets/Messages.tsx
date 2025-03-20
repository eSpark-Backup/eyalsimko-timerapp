import type React from "react";
import { View } from "react-native";
import { useSelector as useMachineSelector } from "@xstate/react";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { Eye } from "~/lib/icons/Eye";
import { Zap } from "~/lib/icons/Zap";
import { Plus } from "~/lib/icons/Plus";
import { Input } from "../ui/input";
import { IconButton } from "../iconButton";
import { Trash } from "~/lib/icons/Trash";
import { Move } from "~/lib/icons/Move";
import { useSelector } from "@xstate/store/react";
import { eventConfigStore, Message } from "~/lib/store/eventConfig";
import { useState } from "react";
import { useMachine } from "@xstate/react";
import { TimerContext } from "~/lib/store/timer";
import { connectionActor } from "~/lib/store/connectionStore";

export const MessageWidgetHeader = () => {
  const [isFlashing, setIsFlashing] = useState(false);
  return (
    <View className="flex-row items-baseline justify-between">
      <Text className="text-lg font-semibold">Messages</Text>
      <View className="flex-row gap-[12]">
        <Button
          size="sm"
          variant={isFlashing ? "primary" : "default"}
          icon={Zap}
          onPress={() => setIsFlashing(!isFlashing)}
        >
          <Text>Flash</Text>
        </Button>
        <Button
          size="sm"
          icon={Plus}
          onPress={() => {
            eventConfigStore.send({ type: "addMessage" });
          }}
        >
          <Text>Add New Message</Text>
        </Button>
      </View>
    </View>
  );
};

function MessageRow({ message }: { message: Message }) {
  const actorRef = TimerContext.useActorRef();
  const activeMessageId = useMachineSelector(
    actorRef,
    (state) => state.context.timer?.messageId
  );
  const canShowMessage = useMachineSelector(actorRef, (state) =>
    state.can({ type: "showMessage", data: { messageId: message.id } })
  );
  const canHideMessage = useMachineSelector(actorRef, (state) =>
    state.can({ type: "hideMessage" })
  );
  const isConnected = useMachineSelector(connectionActor, (state) =>
    state.matches("CONNECTED")
  );
  return (
    <View
      className={`rounded-[12] p-[12] gap-[8] ${
        message.id === activeMessageId ? "bg-item-highlight" : "bg-item"
      }`}
    >
      <Input
        size="small"
        maxLength={40}
        defaultValue={message.content}
        editable={message.id !== activeMessageId}
        onSubmitEditing={(event) => {
          eventConfigStore.send({
            type: "editMessage",
            updatedMessage: {
              ...message,
              content: event.nativeEvent.text,
            },
          });
        }}
      />
      <View className="justify-between items-center flex-row gap-[12]">
        <Move color="hsla(213, 5%, 57%, 1)" size={16} />
        <View className="flex-row gap-[12]">
          <IconButton
            border
            size="xs"
            disabled={message.id === activeMessageId}
            icon={Trash}
            onPress={() => {
              eventConfigStore.send({
                type: "removeMessage",
                message,
              });
            }}
          />
          {message.id === activeMessageId ? (
            <Button
              disabled={!canHideMessage}
              size="xs"
              onPress={() => {
                actorRef.send({ type: "hideMessage" });
              }}
              icon={Eye}
            >
              <Text>Hide</Text>
            </Button>
          ) : (
            <Button
              disabled={!canShowMessage}
              size="xs"
              onPress={() => {
                actorRef.send({
                  type: "showMessage",
                  data: { messageId: message.id },
                });
              }}
              icon={Eye}
            >
              <Text>Show</Text>
            </Button>
          )}
        </View>
      </View>
    </View>
  );
}

export const MessageWidget = () => {
  const messages = useSelector(
    eventConfigStore,
    (state) => state.context.messages
  );
  return (
    <View className="gap-[20]">
      {messages.map((message) => (
        <MessageRow key={message.id} message={message} />
      ))}
    </View>
  );
};
