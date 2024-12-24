import { useSelector } from "@xstate/store/react";
import { Link, useNavigation } from "expo-router";
import React from "react";
import { View, Text } from "react-native";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { eventConfigStore } from "~/lib/store/eventConfig";

const EventSettings: React.FC = () => {
  const initialEventName = useSelector(
    eventConfigStore,
    (state) => state.context.eventName
  );
  const initialEventDescription = useSelector(
    eventConfigStore,
    (state) => state.context.eventDescription
  );

  const [eventName, setEventName] = React.useState(initialEventName);
  const [eventDescription, setEventDescription] = React.useState(
    initialEventDescription
  );
  const navigation = useNavigation();

  return (
    <View className="flex flex-1 justify-between bg-background p-6 rounded-lg">
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
      <View className="flex-row justify-between mt-6 gap-4">
        <Link href="../" asChild>
          <Button variant="outline" className="flex-1">
            <Text className="text-primary">Cancel</Text>
          </Button>
        </Link>
        <Button
          onPress={() => {
            eventConfigStore.send({
              type: "setConfig",
              eventName,
              eventDescription,
            });
            navigation.goBack();
          }}
          className="flex-1 bg-brand"
        >
          <Text className="text-primary-foreground">Save</Text>
        </Button>
      </View>
    </View>
  );
};

export default EventSettings;
