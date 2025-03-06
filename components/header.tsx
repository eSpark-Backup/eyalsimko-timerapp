import { View } from "react-native";
import { Text } from "./ui/text";
import { CompanyLogo } from "~/lib/icons/CompanyLogo";
import { Button } from "./ui/button";
import { Wifi } from "~/lib/icons/Wifi";
import { Switch } from "./ui/theme-switch";
import { useState } from "react";

export const Header = () => {
  const [isDarkColorScheme, setIsDarkColorScheme] = useState(true);
  return (
    <View className="h-[40] px-[32] pt-[20]">
      <View className="flex-1 flex-row justify-between items-center">
        <CompanyLogo
          viewBox="0 0 95 20"
          height={28}
          width={132.57}
          strokeWidth={0}
        />
        <View className="flex-row gap-[24] items-center">
          <View className="flex-row gap-[8]">
            <Button variant="secondary" icon={Wifi}>
              <Text>Wired</Text>
            </Button>
            <Button variant="secondary" icon={Wifi}>
              <Text>WiFi</Text>
            </Button>
          </View>
          <Switch
            checked={isDarkColorScheme}
            onCheckedChange={setIsDarkColorScheme}
          />
        </View>
      </View>
    </View>
  );
};
