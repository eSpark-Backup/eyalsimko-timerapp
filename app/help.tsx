import { ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { Text, TextClassContext } from "~/components/ui/text";

function Section({ title, lines }: { title: ReactNode; lines: ReactNode[] }) {
  return (
    <View className="gap-2">
      <TextClassContext.Provider value="text-3xl font-bold">
        {title}
      </TextClassContext.Provider>
      <TextClassContext.Provider value="text-lg">
        {lines.map((line, index) => (
          <View key={index}>{line}</View>
        ))}
      </TextClassContext.Provider>
    </View>
  );
}

export default function HelpScreen() {
  return (
    <ScrollView>
      <View className="flex flex-1 gap-5 p-6 pb-safe bg-secondary/30">
        <Section
          title={<Text>Event Description</Text>}
          lines={[
            <Text>
              To set the event and room description click on the text next to
              the logo in the top left corner.
            </Text>,
          ]}
        />
        <Section
          title={<Text>Setup Timer</Text>}
          lines={[
            <Text>
              To set the label for each timer, click the text box with the hint{" "}
              <Text className="font-bold">Speaker Name</Text>. Change the name
              and press submit on keyboard to save.
            </Text>,
            <Text>
              Click <Text className="font-bold">Enter Time</Text> to set the
              countdown timer and the blink start time.
            </Text>,
            <Text>
              To set a global blink start time, press the 3 dots in the top
              right corner and click{" "}
              <Text className="font-bold">Default blink start time</Text>{" "}
              sub-menu.
            </Text>,
          ]}
        />
        <Section
          title={<Text>Select A Timer</Text>}
          lines={[
            <Text>
              With the desired timer selected in the top half of the screen,
              press the <Text className="font-bold">Reset</Text> button.
            </Text>,
            <Text>
              You now have control of that timer in the bottom half of the
              screen.
            </Text>,
          ]}
        />
        <Section
          title={<Text>Settings Menu</Text>}
          lines={[
            <Text>
              The settings menu can be opened by pressing the 3 dots in the top
              right corner.
            </Text>,
            <Text>
              <Text className="font-bold">Default blink start time</Text> - This
              sets the blink start time for all timers. If all timers should
              blink with 30 seconds left, set 30 seconds as the default start
              time.
            </Text>,
            <Text>
              After setting the default time, you can still edit each timer
              individually.
            </Text>,
            <Text>
              <Text className="font-bold">Blink length</Text> - This sets the
              amount of time that the screen should blink when it reaches the
              blink start time.
            </Text>,
            <Text>
              <Text className="font-bold">Clear Timers</Text> - This clears all
              saved data including all timers, event and description.
            </Text>,
          ]}
        />
        <Section
          title={<Text>Custom Message</Text>}
          lines={[
            <Text>
              The text box at the bottom of the screen allows you to show a
              custom message to the speaker.
            </Text>,
            <Text>
              Press the <Text className="font-bold">Show Message</Text> button
              to show the message on the screen. The textbox will turn orange to
              let you know it is being shown.
            </Text>,
            <Text>
              Press the <Text className="font-bold">Hide Message</Text> button
              to hide the message.
            </Text>,
            <Text>
              <Text className="font-extrabold">Note: </Text>
              There is a maximum message size of 40 characters.
            </Text>,
          ]}
        />
      </View>
    </ScrollView>
  );
}
