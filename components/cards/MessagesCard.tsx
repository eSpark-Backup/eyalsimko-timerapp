import { useSelector } from "@xstate/store/react";
import Card from "../Card";
import { MessageWidget, MessageWidgetHeader } from "../widgets/Messages";
import { eventConfigStore } from "~/lib/store/eventConfig";
import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { Button } from "../ui/button";
import { Plus } from "~/lib/icons/Plus";

export default function MessagesCard() {
  const messages = useSelector(
    eventConfigStore,
    (state) => state.context.messages
  );

  if (messages.length === 0) {
    return (
      <Card>
        <MessageWidgetHeader />
        <View className="flex-1 items-center justify-center gap-[24]">
          <View className="gap-[12]">
            <Text className="text-xl font-semibold text-center font-poppins web:font-poppins">
              No Messages Yet
            </Text>
            <Text className="text-lg dark:text-muted-foreground font-poppins web:font-poppins">
              Want to display a message on the timer? Add now!
            </Text>
          </View>
          <Button
            variant="primary"
            size="sm"
            border="none"
            icon={Plus}
            onPress={() => {
              eventConfigStore.send({ type: "addMessage" });
            }}
          >
            <Text className="font-poppins web:font-poppins" style={{color: "#fff"}}>Add Message</Text>
          </Button>
        </View>
      </Card>
    );
  }

  return (
    <Card header={<MessageWidgetHeader />} autoScrollToBottom scrollable={true}>
      <MessageWidget />
  </Card>
  );
}
