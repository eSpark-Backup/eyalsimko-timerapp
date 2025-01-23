import { View } from "react-native";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Text } from "~/components/ui/text";
import { TimerPicker } from "react-native-timer-picker";
import { useSelector as useMachineSelector } from "@xstate/react";
import { useSelector } from "@xstate/store/react";
import { eventConfigStore } from "~/lib/store/eventConfig";
import { formatDuration, getDurationObject } from "~/lib/utils";
import * as Haptics from "expo-haptics"; // for haptic feedback
import { useColorScheme } from "~/lib/useColorScheme";
import { Button } from "~/components/ui/button";
import { useState } from "react";
import { Input } from "~/components/ui/input";
import { useLocalSearchParams } from "expo-router";
import { Sun } from "~/lib/icons/Sun";
import { MoonStar } from "~/lib/icons/MoonStar";
import { SunMoon } from "~/lib/icons/SunMoon";
import { connectionActor } from "~/lib/store/connectionStore";
import { Power } from "~/lib/icons/Power";
import { Unplug } from "~/lib/icons/Unplug";
import React from "react";
import { RotateCcw } from "~/lib/icons/RotateCcw";
import { TimerContext } from "~/lib/store/timer";
import { CircleAlert } from "~/lib/icons/CircleAlert";

function TimerPickerWithControls({
  initialValue,
  reset,
  submit,
}: {
  initialValue: number | null;
  reset: () => void;
  submit: (value: number) => void;
}) {
  const { colorScheme } = useColorScheme();
  const [state, setState] = useState(
    initialValue ? getDurationObject(initialValue) : undefined
  );
  return (
    <View className="items-center gap-4">
      <TimerPicker
        Haptics={Haptics}
        styles={{
          theme: colorScheme === "system" ? undefined : colorScheme,
          backgroundColor: "transparent",
        }}
        initialValue={state}
        onDurationChange={(duration) => {
          setState(duration);
        }}
      />
      <View className="flex flex-row gap-4">
        <Button
          disabled={!state}
          onPress={() => {
            state &&
              submit(state.hours * 3600 + state.minutes * 60 + state.seconds);
          }}
          className="flex-1"
        >
          <Text>Submit</Text>
        </Button>
        <Button onPress={reset} className="flex-1">
          <Text>Reset</Text>
        </Button>
      </View>
    </View>
  );
}

function EventNameSettings({
  onSubmit,
  onReset,
}: {
  onSubmit: () => void;
  onReset: () => void;
}) {
  const initialEventName = useSelector(
    eventConfigStore,
    (state) => state.context.eventName
  );
  const initialEventDescription = useSelector(
    eventConfigStore,
    (state) => state.context.eventDescription
  );

  const [eventName, setEventName] = useState(initialEventName ?? "");
  const [eventDescription, setEventDescription] = useState(
    initialEventDescription ?? ""
  );

  const disableSubmit = eventName.length === 0 || eventDescription.length === 0;

  return (
    <View className="flex gap-4">
      <View className="flex flex-col gap-4">
        <Input
          placeholder="Event Name"
          value={eventName}
          onChangeText={setEventName}
        />
        <Input
          placeholder="Event Description"
          value={eventDescription}
          onChangeText={setEventDescription}
          numberOfLines={4}
        />
      </View>
      <View className="flex-row gap-4">
        <Button
          onPress={() => {
            onSubmit();
            eventConfigStore.send({
              type: "setEventName",
              eventName,
              eventDescription,
            });
          }}
          disabled={disableSubmit}
          className="flex-1"
        >
          <Text className="text-primary-foreground">Submit</Text>
        </Button>
        <Button
          onPress={() => {
            setEventDescription("");
            setEventName("");
            onReset();
            eventConfigStore.send({
              type: "setEventName",
              eventName: null,
              eventDescription: null,
            });
          }}
          className="flex-1"
        >
          <Text>Reset</Text>
        </Button>
      </View>
    </View>
  );
}

function ThemeSettings() {
  const { colorScheme, setColorScheme } = useColorScheme();

  const themes = [
    { value: "dark", title: "Dark", Icon: MoonStar },
    { value: "light", title: "Light", Icon: Sun },
    { value: "system", title: "System", Icon: SunMoon },
  ] as const;

  return (
    <View className="flex justify-between md:flex-row gap-4">
      {themes.map((theme) => (
        <Button
          key={theme.value}
          variant={colorScheme === theme.value ? "default" : "secondary"}
          className="grow flex-row gap-2"
          onPress={() => setColorScheme(theme.value)}
        >
          <theme.Icon
            className={
              colorScheme === theme.value
                ? "text-background"
                : "text-foreground"
            }
            size={24}
            strokeWidth={1.25}
          />
          <Text>{theme.title}</Text>
        </Button>
      ))}
    </View>
  );
}

function ConnectionSettings() {
  const isConnected = useMachineSelector(connectionActor, (state) =>
    state.matches("CONNECTED")
  );
  const isDisconnected = useMachineSelector(connectionActor, (state) =>
    state.matches("DISCONNECTED")
  );
  const isConnecting = useMachineSelector(connectionActor, (state) =>
    state.matches("CONNECTING")
  );
  const isConnectionError = useMachineSelector(connectionActor, (state) =>
    state.matches("ERROR")
  );

  const disconnectEvent = { type: "disconnect" } as const;
  const canDisconnect = useMachineSelector(connectionActor, (state) =>
    state.can(disconnectEvent)
  );

  const shutDownEvent = {
    type: "sendMessage",
    message: { type: "shutdown" },
  } as const;
  const canShutDown = useMachineSelector(connectionActor, (state) =>
    state.can(shutDownEvent)
  );

  const retryEvent = { type: "retry" } as const;
  const canRetry = useMachineSelector(connectionActor, (state) =>
    state.can(retryEvent)
  );

  const reconnectEvent = { type: "reconnect" } as const;
  const canReconnect = useMachineSelector(connectionActor, (state) =>
    state.can(reconnectEvent)
  );

  return (
    <View className="flex gap-4">
      {isConnected && (
        <View className="flex flex-row gap-4">
          <Button
            className="flex-1 flex-row gap-2"
            disabled={!canDisconnect}
            onPress={() => connectionActor.send(disconnectEvent)}
          >
            <Unplug className="h-4 w-4 text-primary-foreground" />
            <Text>Disconnect</Text>
          </Button>
          <Button
            className="flex-1 flex-row gap-2"
            variant="destructive"
            disabled={!canShutDown}
            onPress={() => connectionActor.send(shutDownEvent)}
          >
            <Power className="h-4 w-4 text-destructive-foreground" />
            <Text>Shutdown</Text>
          </Button>
        </View>
      )}
      {isConnecting && <Text>Connecting...</Text>}
      {(isConnectionError || isDisconnected) && (
        <View className="flex flex-row gap-2">
          {canRetry && (
            <Button
              className="flex-1 flex-row gap-2"
              disabled={!canRetry}
              onPress={() => connectionActor.send(retryEvent)}
            >
              <RotateCcw className="h-4 w-4 text-primary-foreground" />
              <Text>Retry</Text>
            </Button>
          )}
          {canReconnect && (
            <Button
              className="flex-1 flex-row gap-2"
              disabled={!canReconnect}
              onPress={() => connectionActor.send(reconnectEvent)}
            >
              <RotateCcw className="h-4 w-4 text-primary-foreground" />
              <Text>Reconnect</Text>
            </Button>
          )}
        </View>
      )}
    </View>
  );
}

export default function SettingsScreen() {
  const initialAccordionTab = useLocalSearchParams<{ tab?: string }>().tab;
  const [currentTab, setCurrentTab] = useState<string | undefined>(
    initialAccordionTab
  );
  const toggleTab = (tab: string) => {
    setCurrentTab((currentState) => (currentState === tab ? "" : tab));
  };
  const defaultBlinkingStartTime = useSelector(
    eventConfigStore,
    (state) => state.context.defaultBlinkingStartTime
  );
  const blinkLength = useSelector(
    eventConfigStore,
    (state) => state.context.blinkLength
  );
  const { colorScheme } = useColorScheme();

  const connectionMode = useMachineSelector(
    connectionActor,
    (state) => state.context.type
  );

  const timerActorRef = TimerContext.useActorRef();

  return (
    <View className="flex flex-1 justify-center items-center gap-5 p-6 bg-secondary/30">
      <Accordion
        value={currentTab}
        type="single"
        collapsible
        className="w-full max-w-sm native:max-w-md"
      >
        <AccordionItem value="eventNameAndDescription">
          <AccordionTrigger
            onPress={() => toggleTab("eventNameAndDescription")}
          >
            <Text>Event name & description</Text>
          </AccordionTrigger>
          <AccordionContent>
            <EventNameSettings
              onSubmit={() => setCurrentTab("")}
              onReset={() => setCurrentTab("")}
            />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="defaultBlinkingStartTime">
          <AccordionTrigger
            onPress={() => toggleTab("defaultBlinkingStartTime")}
          >
            <Text>
              Default blink start time:{" "}
              {defaultBlinkingStartTime
                ? formatDuration(defaultBlinkingStartTime)
                : "None"}
            </Text>
          </AccordionTrigger>
          <AccordionContent>
            <TimerPickerWithControls
              initialValue={defaultBlinkingStartTime}
              reset={() => {
                setCurrentTab("");
                eventConfigStore.send({
                  type: "setDefaultBlinkingStartTime",
                  defaultBlinkingStartTime: null,
                });
              }}
              submit={(value) => {
                setCurrentTab("");
                eventConfigStore.send({
                  type: "setDefaultBlinkingStartTime",
                  defaultBlinkingStartTime: value,
                });
              }}
            />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="blinkLength">
          <AccordionTrigger onPress={() => toggleTab("blinkLength")}>
            <Text>
              Blink length: {blinkLength ? formatDuration(blinkLength) : "None"}
            </Text>
          </AccordionTrigger>
          <AccordionContent>
            <TimerPickerWithControls
              initialValue={blinkLength}
              reset={() => {
                setCurrentTab("");
                eventConfigStore.send({
                  type: "setBlinkLength",
                  blinkLength: null,
                });
              }}
              submit={(value) => {
                setCurrentTab("");
                eventConfigStore.send({
                  type: "setBlinkLength",
                  blinkLength: value,
                });
              }}
            />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="theme">
          <AccordionTrigger onPress={() => toggleTab("theme")}>
            <Text>Theme: {colorScheme}</Text>
          </AccordionTrigger>
          <AccordionContent>
            <ThemeSettings />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="connection">
          <AccordionTrigger onPress={() => toggleTab("connection")}>
            <Text>
              Connection settings:{" "}
              {connectionMode
                ? `Connected over ${connectionMode}`
                : "Not connected"}
            </Text>
          </AccordionTrigger>
          <AccordionContent>
            <ConnectionSettings />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="reset">
          <AccordionTrigger onPress={() => toggleTab("reset")}>
            <Text>Clear Timers</Text>
          </AccordionTrigger>
          <AccordionContent>
            <Button
              variant={"destructive"}
              className="flex-row gap-2"
              onPress={() => {
                eventConfigStore.send({
                  type: "reset",
                });
                timerActorRef.send({ type: "reset" });
              }}
            >
              <CircleAlert className="h-4 w-4 text-destructive-foreground" />
              <Text>Clear event data</Text>
            </Button>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </View>
  );
}
