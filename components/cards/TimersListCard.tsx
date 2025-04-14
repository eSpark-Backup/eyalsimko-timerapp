import { useSelector } from "@xstate/store/react";
import Card from "../Card";
import { Text } from "~/components/ui/text";
import TimersList, { TimersListHeader } from "../widgets/TimersList";
import { eventConfigStore } from "~/lib/store/eventConfig";
import { View } from "react-native";
import { Button } from "../ui/button";
import { Plus } from "~/lib/icons/Plus";
import { useShowModal } from "~/lib/context/ModalContext";

export default function TimersListCard() {
  const events = useSelector(eventConfigStore, (state) => state.context.events);

  const showModal = useShowModal();

console.log("TimersListCard", events);

  if (events.length === 0) {
    return (
      <Card>
        <TimersListHeader events={events} />
        <View className="flex-1 items-center justify-center gap-[24]">
          <View className="gap-[12]">
            <Text className="font-poppins web:font-poppin text-xl font-semibold text-center">
              No Events Found
            </Text>
            <Text className="font-poppins web:font-poppin text-lg text-muted-foreground">
              It looks empty here! Start by adding a new event.
            </Text>
          </View>
          <Button
            variant="primary"
            size="sm"
            border="none"
            icon={Plus}
            onPress={() => {
              showModal({ type: "addEvent" });
            }}
          >
            <Text className="font-normal font-poppins web:font-poppin">Add Event</Text>
          </Button>
        </View>
      </Card>
    );
  }

  return (
    <Card scrollable={true} autoScrollToBottom header={<TimersListHeader events={events} />}>
      <TimersList />
    </Card>
  );
}
