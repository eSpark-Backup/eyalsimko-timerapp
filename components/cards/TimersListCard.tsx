import { useSelector } from "@xstate/store/react";
import Card from "../Card";
import { Text } from "~/components/ui/text";
import TimersList, {
  TimersListHeader,
  TimersListHeaderRef,
} from "../widgets/TimersList";
import { eventConfigStore } from "~/lib/store/eventConfig";
import { View } from "react-native";
import { Button } from "../ui/button";
import { Plus } from "~/lib/icons/Plus";
import { useRef } from "react";

export default function TimersListCard() {
  const events = useSelector(eventConfigStore, (state) => state.context.events);
  const ref = useRef<TimersListHeaderRef>(null);

  if (events.length === 0) {
    return (
      <Card>
        <TimersListHeader ref={ref} />
        <View className="flex-1 items-center justify-center gap-[24]">
          <View className="gap-[12]">
            <Text className="text-xl font-semibold text-center">
              No Events Found
            </Text>
            <Text className="text-lg text-muted-foreground">
              It looks empty here! Start by adding a new event.
            </Text>
          </View>
          <Button
            variant="primary"
            size="sm"
            border="none"
            icon={Plus}
            onPress={() => {
              ref.current?.addEvent();
            }}
          >
            <Text>Add Event</Text>
          </Button>
        </View>
      </Card>
    );
  }

  return (
    <Card scrollable={true} header={<TimersListHeader />}>
      <TimersList />
    </Card>
  );
}
