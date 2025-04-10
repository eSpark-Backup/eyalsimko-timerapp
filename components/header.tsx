import React, { useEffect } from "react";
import { View } from "react-native";
import { Text } from "./ui/text";
import { CompanyLogo } from "~/lib/icons/CompanyLogo";
import { Button } from "./ui/button";
import { Wifi } from "~/lib/icons/Wifi";
import { Switch } from "./ui/theme-switch";
import { useState } from "react";
import { Wired } from "~/lib/icons/Wired";
import { useSelector as useMachineSelector } from "@xstate/react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { cn } from "~/lib/utils";
import { Help } from "~/lib/icons/Help";
import { Settings } from "~/lib/icons/Settings";
import { Logs } from "~/lib/icons/Logs";
import { connectionActor } from "~/lib/store/connectionStore";
import { useShowModal } from "~/lib/context/ModalContext";
import { useColorScheme } from '~/lib/useColorScheme';
import { setAndroidNavigationBar } from "~/lib/android-navigation-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";

const GITHUB_AVATAR_URI = "https://github.com/mrzachnugent.png";

export const Header = () => {
  const [isSettingsDropdownOpen, setIsSettingsDropdownOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const { isDarkColorScheme, setColorScheme } = useColorScheme();

  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 12,
    right: 12,
  };


  const isConnected = useMachineSelector(connectionActor, (state) =>
    state.matches("CONNECTED")
  );

  const connectionType = useMachineSelector(connectionActor, (state) => {
    if (isConnected) return state.context.type;
    return null;
  });

  const showModal = useShowModal();

  useEffect(() => {
    const newTheme = 'dark'
    setColorScheme(newTheme);
    setAndroidNavigationBar(newTheme);
    AsyncStorage.setItem('theme', newTheme);
  }, [])
  
  const onThemeChange = () => {
    const newTheme = isDarkColorScheme ? 'light' : 'dark';
    setColorScheme(newTheme);
    setAndroidNavigationBar(newTheme);
    AsyncStorage.setItem('theme', newTheme);
  }

  return (
    <View className="h-[60] px-[32] pt-[20]">
      <View className="flex-1 flex-row justify-between items-center">
        <CompanyLogo size={124} strokeWidth={0} />
        <View className="flex-row gap-[24] items-center">
          <View className="flex-row gap-[8]">
            <Button
              border="none"
              variant={connectionType === "LAN" ? "primary-muted" : "secondary"}
              icon={Wired}
            >
              <Text>Wired</Text>
            </Button>
            <Button
              border="none"
              variant={
                connectionType === "WIFI" ? "primary-muted" : "secondary"
              }
              icon={Wifi}
            >
              <Text>WiFi</Text>
            </Button>
          </View>
          <Switch
            checked={isDarkColorScheme}
            onCheckedChange={onThemeChange}
          />
          <DropdownMenu onOpenChange={setIsSettingsDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary">
                <Avatar
                  alt="Settings"
                  className={cn(
                    "border-2",
                    isSettingsDropdownOpen && "border-highlight"
                  )}
                >
                  <AvatarImage source={{ uri: GITHUB_AVATAR_URI }} />
                  <AvatarFallback>
                    <Text className="text-primary">ZN</Text>
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              sideOffset={8}
              alignOffset={12}
              avoidCollisions={true}
              align="end"
              side="bottom"
              insets={contentInsets}
              className="w-[209] border border-cardBorder"
            >
              <DropdownMenuGroup className="gap-[8]">
                <DropdownMenuItem
                  onPress={() => showModal({ type: "settings" })}
                >
                  <View className="flex-1 flex-row justify-between items-center">
                    <Text className="text-sm font-normal">
                      General Settings
                    </Text>
                    <Settings size={20} />
                  </View>
                </DropdownMenuItem>
                <DropdownMenuItem onPress={() => showModal({ type: "logs" })}>
                  <View className="flex-1 flex-row justify-between items-center">
                    <Text className="text-sm font-normal">Logs</Text>
                    <Logs size={20} />
                  </View>
                </DropdownMenuItem>
                <DropdownMenuItem onPress={() => showModal({ type: "help" })}>
                  <View className="flex-1 flex-row justify-between items-center">
                    <Text className="text-sm font-normal">Help</Text>
                    <Help size={20} />
                  </View>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </View>
      </View>
    </View>
  );
};
