import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Card from "~/components/Card";
import { Text } from "~/components/ui/text";
import {
  MessageWidget,
  MessageWidgetHeader,
} from "~/components/widgets/Messages";

export default function TimerScreen() {
  // return null;
  return (
    <View className="flex-1 gap-[24] pt-[20] px-[32] pb-[34]">
      <View className="flex-1 bg-green-300/10" />
      <View className="flex-1 flex-row gap-[24]">
        <View className="flex-1">
          <Card header={<MessageWidgetHeader />} scrollable={true}>
            <MessageWidget />
          </Card>
        </View>
        <View className="flex-1 bg-green-300/10"></View>
      </View>
    </View>
  );
}
