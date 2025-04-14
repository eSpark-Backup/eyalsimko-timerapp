import React, { useState, useEffect, useRef } from "react";
import { View, Platform } from "react-native";
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
import { TimerContext } from "~/lib/store/timer";
import { connectionActor } from "~/lib/store/connectionStore";
import { CardScrollRefContext } from "../Card";
import Sortable from "react-native-sortables";
let SortableJS: any;
if (Platform.OS === "web") {
  const sortableModule = require("sortablejs");
  SortableJS = sortableModule.default || sortableModule; // Access the default export
  }
  
export const MessageWidgetHeader = () => {
  const [isFlashing, setIsFlashing] = useState(false);
  return (
    <View className="flex-row items-baseline justify-between">
      <Text className="text-lg font-semibold font-[Poppins] web:font-poppins">Messages</Text>
      <View className="flex-row gap-[12]">
        <Button
          size="sm"
          variant={isFlashing ? "primary" : "default"}
          icon={Zap}
          onPress={() => setIsFlashing(!isFlashing)}
        >
          <Text className="font-[Poppins] web:font-poppins">Flash</Text>
        </Button>
        <Button
          size="sm"
          icon={Plus}
          onPress={() => {
            eventConfigStore.send({ type: "addMessage" });
          }}
        >
          <Text className="font-[Poppins] web:font-poppins">Add New Message</Text>
        </Button>
      </View>
    </View>
  );
};

function MessageRow({ message }: { message: Message }) {
  const actorRef = TimerContext.useActorRef();
  const activeMessageId = useMachineSelector(
    actorRef,
    (state) => state.context.messageId
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
        className="font-[Poppins] web:font-poppins"
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
        <View className="w-[50] items-start justify-center">
          <Move color="hsla(213, 5%, 57%, 1)" size={16} />
        </View>
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
              disabled={!canHideMessage || !isConnected}
              size="xs"
              onPress={() => {
                actorRef.send({ type: "hideMessage" });
              }}
              icon={Eye}
            >
              <Text className="font-[Poppins] web:font-poppins">Hide</Text>
            </Button>
          ) : (
            <Button
              disabled={message.content.trim().length === 0 || !canShowMessage || !isConnected}
              size="xs"
              onPress={() => {
                actorRef.send({
                  type: "showMessage",
                  data: { messageId: message.id },
                });
              }}
              icon={Eye}
            >
              <Text className="font-[Poppins] web:font-poppins">Show</Text>
            </Button>
          )}
        </View>
      </View>
    </View>
  );
}

export const MessageWidget = () => {
  const scrollViewRef = React.useContext(CardScrollRefContext);
  const messages = useSelector(
    eventConfigStore,
    (state) => state.context.messages
  );
  const listRef = useRef<HTMLDivElement>(null);

  if (messages.length === 0) {
    return (
      <View className="flex-1 h-auto items-center justify-center">
        <Text className="font-[Poppins] web:font-poppins">No Messages</Text>
      </View>
    );
  }

  useEffect(() => {
      if (Platform.OS === "web" && listRef.current && SortableJS) {
        const sortable = SortableJS.create(listRef.current, {
          animation: 150, // Smooth animation
          handle: ".drag-handle", // Class for the drag handle
          onEnd: (evt: any) => {
            const { oldIndex, newIndex } = evt;
  
            if (oldIndex !== undefined && newIndex !== undefined) {
              eventConfigStore.send({
                type: "changeEventOrder",
                fromIndex: oldIndex,
                toIndex: newIndex,
              });
            }
          },
        });
  
        return () => {
          sortable.destroy(); // Cleanup on unmount
        };
      }
    }, []);

  return (
    <View>
      {Platform.OS === "web" ? (
        <div ref={listRef} style={{ paddingBottom: "10px" }}>
          {messages.map((message, index) => (
            <div
              key={message.id}
              className="drag-handle cursor-move"
              style={{ marginBottom: 12 }}
            >

              {/* Message Row */}
              <MessageRow message={message} />
            </div>
          ))}
        </div>
      ) : (
        <Sortable.Grid
          onDragEnd={({ fromIndex, toIndex }) => {
            eventConfigStore.send({
              type: "changeMessageOrder",
              fromIndex,
              toIndex,
            });
          }}
          scrollableRef={scrollViewRef}
          rowGap={20}
          columns={1}
          dragActivationDelay={0}
          data={messages}
          activeItemScale={1.05}
          overDrag="vertical"
          customHandle
          renderItem={({ item: message }) => (
            <MessageRow key={message.id} message={message} />
          )}
        />
      )}
    </View>
  );
};