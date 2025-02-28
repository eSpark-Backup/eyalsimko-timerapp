import type React from "react";
import { ScrollView, View } from "react-native";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { Eye } from "~/lib/icons/Eye";
import { Zap } from "~/lib/icons/Zap";
import { Plus } from "~/lib/icons/Plus";
import { Input } from "../ui/input";

interface Message {
  id: string;
  text: string;
  type: "action" | "info";
  showAction?: boolean;
}

interface MessageWidgetProps {
  messages?: Message[];
  onShowPress?: () => void;
}

export const MessageWidgetHeader = () => {
  return (
    <View className="flex-row items-baseline justify-between">
      <Text className="text-lg font-semibold">Messages</Text>
      <View className="flex-row gap-[12]">
        <Button size="sm" icon={Zap}>
          <Text>Flash</Text>
        </Button>
        <Button size="sm" icon={Plus}>
          <Text>Add New Message</Text>
        </Button>
      </View>
    </View>
  );
};

export const MessageWidget: React.FC<MessageWidgetProps> = ({
  messages = [
    { id: "1", text: "WRAP UP!!!", type: "action", showAction: true },
    { id: "2", text: "Hold Mic closer to mouth", type: "info" },
    { id: "3", text: "VIDEO PLAYING!!", type: "info" },
  ],
  onShowPress,
}) => {
  return (
    <View className="gap-[20]">
      {messages.map((message) => (
        <View
          key={message.id}
          className={`rounded-[12] p-[12] gap-[8] ${
            message.type === "action" ? "bg-item-highlight" : "bg-item"
          }`}
        >
          <Input size="small" value={message.text} />
          <View className="items-end">
            <Button size="sm" onPress={onShowPress} icon={Eye}>
              <Text>Show</Text>
            </Button>
          </View>
        </View>
      ))}
    </View>
  );
};
