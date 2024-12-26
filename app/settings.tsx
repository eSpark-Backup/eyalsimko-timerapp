import { View } from "react-native";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Text } from "~/components/ui/text";
import { TimerPicker } from "react-native-timer-picker";
import { useSelector } from "@xstate/store/react";
import { eventConfigStore } from "~/lib/store/eventConfig";
import { formatDuration, getDurationObject } from "~/lib/utils";
import * as Haptics from "expo-haptics"; // for haptic feedback
import { useColorScheme } from "~/lib/useColorScheme";
import { NAV_THEME } from "~/lib/constants";
import { Button } from "~/components/ui/button";
import { useState } from "react";
import { Input } from "~/components/ui/input";
import { useLocalSearchParams } from "expo-router";

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
          theme: colorScheme,
          backgroundColor: NAV_THEME[colorScheme].background,
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

function EventNameSettings() {
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

export default function SettingsScreen() {
  const defaultBlinkingStartTime = useSelector(
    eventConfigStore,
    (state) => state.context.defaultBlinkingStartTime
  );
  const blinkLength = useSelector(
    eventConfigStore,
    (state) => state.context.blinkLength
  );
  const initialAccordionTab = useLocalSearchParams<{ tab: string }>().tab;
  return (
    <View className="flex flex-1 justify-center items-center gap-5 p-6">
      <Accordion
        defaultValue={initialAccordionTab}
        type="single"
        collapsible
        className="w-full max-w-sm native:max-w-md"
      >
        <AccordionItem value="eventNameAndDescription">
          <AccordionTrigger>
            <Text>Event name & description</Text>
          </AccordionTrigger>
          <AccordionContent>
            <EventNameSettings />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="defaultBlinkingStartTime">
          <AccordionTrigger>
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
                eventConfigStore.send({
                  type: "setDefaultBlinkingStartTime",
                  defaultBlinkingStartTime: null,
                });
              }}
              submit={(value) => {
                eventConfigStore.send({
                  type: "setDefaultBlinkingStartTime",
                  defaultBlinkingStartTime: value,
                });
              }}
            />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="blinkLength">
          <AccordionTrigger>
            <Text>
              Blink length: {blinkLength ? formatDuration(blinkLength) : "None"}
            </Text>
          </AccordionTrigger>
          <AccordionContent>
            <TimerPickerWithControls
              initialValue={blinkLength}
              reset={() => {
                eventConfigStore.send({
                  type: "setBlinkLength",
                  blinkLength: null,
                });
              }}
              submit={(value) => {
                eventConfigStore.send({
                  type: "setBlinkLength",
                  blinkLength: value,
                });
              }}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </View>
  );
}
