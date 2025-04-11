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
          title={<Text className="font-normal font-poppins web:font-poppins">Event Description</Text>}
          lines={[
            <Text className="font-normal font-poppins web:font-poppins">
              To set the event and room description click on the text next to
              the logo in the top left corner.
            </Text>,
          ]}
        />
        <Section
          title={<Text className="font-normal font-poppins web:font-poppins">Setup Timer</Text>}
          lines={[
            <Text className="font-normal font-poppins web:font-poppins">
              To set the label for each timer, click the text box with the hint{" "}
              <Text className="font-bold font-poppins web:font-poppins">Speaker Name</Text>. Change the name
              and press submit on keyboard to save.
            </Text>,
            <Text className="font-normal font-poppins web:font-poppins">
              Click <Text className="font-bold font-poppins web:font-poppins">Enter Time</Text> to set the
              countdown timer and the blink start time.
            </Text>,
            <Text className="font-normal font-poppins web:font-poppins">
              To set a global blink start time, press the 3 dots in the top
              right corner and click{" "}
              <Text className="font-bold font-poppins web:font-poppins">Default blink start time</Text>{" "}
              sub-menu.
            </Text>,
          ]}
        />
        <Section
          title={<Text className="font-normal font-poppins web:font-poppins">Select A Timer</Text>}
          lines={[
            <Text className="font-normal font-poppins web:font-poppins">
              With the desired timer selected in the top half of the screen,
              press the <Text className="font-bold font-poppins web:font-poppins">Reset</Text> button.
            </Text>,
            <Text className="font-normal font-poppins web:font-poppins">
              You now have control of that timer in the bottom half of the
              screen.
            </Text>,
          ]}
        />
        <Section
          title={<Text className="font-normal font-poppins web:font-poppins">Settings Menu</Text>}
          lines={[
            <Text className="font-normal font-poppins web:font-poppins">
              The settings menu can be opened by pressing the 3 dots in the top
              right corner.
            </Text>,
            <Text className="font-normal font-poppins web:font-poppins">
              <Text className="font-bold font-poppins web:font-poppins">Default blink start time</Text> - This
              sets the blink start time for all timers. If all timers should
              blink with 30 seconds left, set 30 seconds as the default start
              time.
            </Text>,
            <Text className="font-normal font-poppins web:font-poppins">
              After setting the default time, you can still edit each timer
              individually.
            </Text>,
            <Text className="font-normal font-poppins web:font-poppins">
              <Text className="font-bold font-poppins web:font-poppins">Blink length</Text> - This sets the
              amount of time that the screen should blink when it reaches the
              blink start time.
            </Text>,
            <Text className="font-normal font-poppins web:font-poppins">
              <Text className="font-bold font-poppins web:font-poppins">Clear Timers</Text> - This clears all
              saved data including all timers, event and description.
            </Text>,
          ]}
        />
        <Section
          title={<Text className="font-bold font-poppins web:font-poppins">Custom Message</Text>}
          lines={[
            <Text className="font-bold font-poppins web:font-poppins">
              The text box at the bottom of the screen allows you to show a
              custom message to the speaker.
            </Text>,
            <Text className="font-bold font-poppins web:font-poppins">
              Press the <Text className="font-bold font-poppins web:font-poppins">Show Message</Text> button
              to show the message on the screen. The textbox will turn orange to
              let you know it is being shown.
            </Text>,
            <Text className="font-bold font-poppins web:font-poppins">
              Press the <Text className="font-bold font-poppins web:font-poppins">Hide Message</Text> button
              to hide the message.
            </Text>,
            <Text className="font-bold font-poppins web:font-poppins">
              <Text className="font-extrabold font-poppins web:font-poppins">Note: </Text>
              There is a maximum message size of 40 characters.
            </Text>,
          ]}
        />
      </View>
    </ScrollView>
  );
}
