import React from "react";
import { Pressable, ScrollView, View } from "react-native";
import { Text } from "./ui/text";
import { CompanyLogo } from "~/lib/icons/CompanyLogo";
import { Button } from "./ui/button";
import { Wifi } from "~/lib/icons/Wifi";
import { Switch } from "./ui/theme-switch";
import { useState } from "react";
import { Wired } from "~/lib/icons/Wired";
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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Help } from "~/lib/icons/Help";
import { IconButton } from "./iconButton";
import { Close } from "~/lib/icons/Close";
import { TrashDanger } from "~/lib/icons/TrashDanger";
import { Settings } from "~/lib/icons/Settings";
import { Logs } from "~/lib/icons/Logs";
import { GreenDot, RedDot } from "~/lib/icons/LogDots";
import { getLocale } from "~/lib/locale";
import { TimeInput } from "./ui/time-input";

const GITHUB_AVATAR_URI = "https://github.com/mrzachnugent.png";

type Log = {
  type: "connectionLost" | "connectionRecovered";
  connectionType: "LAN" | "WIFI";
  date: Date;
};

const logs: Log[] = [
  {
    type: "connectionRecovered",
    connectionType: "LAN",
    date: new Date("2023-07-01T04:12:00.000Z"),
  },
  {
    type: "connectionLost",
    connectionType: "WIFI",
    date: new Date("2023-07-02T03:42:00.000Z"),
  },
  {
    type: "connectionRecovered",
    connectionType: "WIFI",
    date: new Date("2023-07-03T02:11:00.000Z"),
  },
];

type LogType = Log["type"];

const connectionTypeToText = (
  connectionType: Log["connectionType"]
): string => {
  if (connectionType === "LAN") return "wired";
  return "wireless";
};

const logToText = (log: Log) => {
  const map: Record<LogType, { title: string; description: string }> = {
    connectionLost: {
      title: "Connection lost",
      description:
        "App can not connect to the Timer module. Please check your connection.",
    },
    connectionRecovered: {
      title: "Connected",
      description: `Connection successful - ${connectionTypeToText(
        log.connectionType
      )} connection has been initiated.`,
    },
  };
  return map[log.type];
};

const timerFormatter = Intl.DateTimeFormat(getLocale(), {
  timeStyle: "medium",
});

type Modal =
  | { type: "settings" }
  | { type: "help" }
  | { type: "deleteData" }
  | { type: "logs" };

function HeaderModals({
  modal,
  setModal,
}: {
  modal: Modal | null;
  setModal: React.Dispatch<React.SetStateAction<Modal | null>>;
}) {
  const helpContent = [
    {
      title: "Event Description",
      text: [
        "To set the event and room description, click on the text next to the logo in the top left corner.",
      ],
    },
    {
      title: "Setup Timer",
      text: [
        "To set the label for each timer, click the text box with the hint Speaker Name. Change the name and press submit on the keyboard to save.",
        "Click Enter Time to set the countdown timer and the blink start time.",
        "To set a global blink start time, press the 3 dots in the top right corner and click Default blink start time sub-menu.",
      ],
    },
    {
      title: "Select A Timer",
      text: [
        "With the desired timer selected in the top half of the screen, press the Reset button.",
        "You now have control of that timer in the bottom half of the screen.",
      ],
    },
    {
      title: "Settings Menu",
      text: [
        "The settings menu can be opened by pressing the 3 dots in the top-right corner. \n\u2022 Default blink start time – This sets the blink start time for all timers. If all timers should blink with 30 seconds left, set 30 seconds as the default start time.\n\u2022 After setting the default time, you can still edit each timer individually.\n\u2022 Blink length – This sets the amount of time that the screen should blink when it reaches the blink start time.\n\u2022 Clear Timers – This clears all saved data including all timers, event, and description.",
      ],
    },
  ];
  const [length, setLength] = React.useState(60);
  return (
    <>
      <Dialog
        open={modal?.type === "settings"}
        onOpenChange={() => setModal(null)}
      >
        <DialogContent className="w-[464]">
          <View className="gap-[40]">
            <DialogHeader>
              <Text className="text-xl text-center font-semibold">
                General Settings
              </Text>
            </DialogHeader>
            <View className="gap-[40]">
              <View className="gap-[12]">
                <Text className="text-lg font-semibold">Flash Settings</Text>
                <View className="flex-row gap-[20]">
                  <View className="flex-1">
                    <TimeInput
                      value={0}
                      onChange={() => {}}
                      size="default"
                      label="Start Time"
                      background="modal"
                    />
                  </View>
                  <View className="flex-1">
                    <TimeInput
                      size="default"
                      background="modal"
                      value={length}
                      onChange={setLength}
                      label="Length"
                    />
                  </View>
                </View>
              </View>
              <View className="gap-[20]">
                <View className="gap-[4]">
                  <Text className="text-lg font-semibold">
                    Connection Settings
                  </Text>
                  <Text className="text-md">
                    No wired of WiFi connection detected.
                  </Text>
                  <Text>
                    Please connect to the WiFi network using SSID and password
                    from the screen.
                  </Text>
                </View>
                <View className="gap-[12]">
                  <Button size="lg" border="none">
                    <Text>Open WiFi settings to change the network</Text>
                  </Button>
                  <Button size="lg" border="none">
                    <Text>Scan the QR code from the screen</Text>
                  </Button>
                </View>
              </View>
              <View className="gap-[20]">
                <Button
                  variant="destructive-muted"
                  size="lg"
                  border="none"
                  onPress={() => setModal({ type: "deleteData" })}
                >
                  <Text>Delete all timers</Text>
                </Button>
              </View>
            </View>
            <DialogFooter>
              <View className="flex-row justify-between">
                <Button size="lg" border="none" onPress={() => setModal(null)}>
                  <Text>Cancel</Text>
                </Button>
                <Button
                  size="lg"
                  border="none"
                  variant="primary"
                  onPress={() => setModal(null)}
                >
                  <Text>Save Changes</Text>
                </Button>
              </View>
            </DialogFooter>
          </View>
        </DialogContent>
      </Dialog>
      <Dialog open={modal?.type === "help"} onOpenChange={() => setModal(null)}>
        <DialogContent
          scrollable
          height={744}
          style={{ width: 718 }}
          header={
            <DialogHeader className="flex-row justify-center relative">
              <Text className="text-3xl text-center font-semibold">Help</Text>
              <Help size={32} className="text-primary-foreground" />
              <View className="absolute right-0 top-1">
                <IconButton
                  variant="outline"
                  size="xl"
                  icon={Close}
                  onPress={() => setModal(null)}
                />
              </View>
            </DialogHeader>
          }
        >
          <View className="gap-[32] pt-[30]">
            {helpContent.map(({ title, text }, index) => (
              <View key={index} className="gap-[12]">
                <Text className="text-xl leading-[1.5] font-semibold">
                  {title}
                </Text>
                <Text className="text-md leading-[1.5] text-muted-foreground">
                  {text.join("\n\n")}
                </Text>
              </View>
            ))}
          </View>
        </DialogContent>
      </Dialog>
      <Dialog
        open={modal?.type === "deleteData"}
        onOpenChange={() => setModal(null)}
      >
        <DialogContent className="w-[400]">
          <View className="gap-[40]">
            <DialogHeader>
              <View className="justify-center items-center gap-[20]">
                <TrashDanger className="text-transparent" size={60} />
                <View className="items-center gap-[12]">
                  <Text className="text-2xl text-primary font-semibold">
                    Delete All Timers?
                  </Text>
                  <Text className="text-lg text-primary/60">
                    Are you sure you want to delete all timers?
                  </Text>
                </View>
              </View>
            </DialogHeader>
            <DialogFooter>
              <View className="flex-row justify-between">
                <DialogClose asChild>
                  <Button size="lg" border="none">
                    <Text>Cancel</Text>
                  </Button>
                </DialogClose>
                <Button
                  onPress={() => setModal(null)}
                  size="lg"
                  variant="destructive"
                >
                  <Text>Delete</Text>
                </Button>
              </View>
            </DialogFooter>
          </View>
        </DialogContent>
      </Dialog>
      <Dialog open={modal?.type === "logs"} onOpenChange={() => setModal(null)}>
        <DialogContent
          className="w-[464]"
          scrollable
          height={744}
          header={
            <DialogHeader className="flex-row justify-center relative">
              <Text className="text-xl text-center font-semibold">Logs</Text>
              <View className="absolute right-0 top-1">
                <IconButton
                  variant="outline"
                  size="xl"
                  icon={Close}
                  onPress={() => setModal(null)}
                />
              </View>
            </DialogHeader>
          }
        >
          <View className="pt-[40]">
            {logs.map((log, index) => (
              <View key={index} className="flex-row">
                <View className="w-[65] mr-[6] items-center">
                  <Text className="text-sm font-semibold leading-none">
                    {timerFormatter.format(log.date)}
                  </Text>
                </View>
                <View className="w-[21] mr-[16] items-center relative">
                  <View className="w-[3] flex-1 bg-buttonDefaultBorderColor" />
                  <View className="absolute top-[-2]">
                    {log.type === "connectionLost" && <RedDot size={16} />}
                    {log.type === "connectionRecovered" && (
                      <GreenDot size={16} />
                    )}
                  </View>
                </View>
                <View
                  className={cn(
                    "flex-1 gap-[4]",
                    index !== logs.length - 1 && "mb-[24]"
                  )}
                >
                  <Text className="font-semibold leading-none">
                    {logToText(log).title}
                  </Text>
                  <Text className="text-sm text-muted-foreground">
                    {logToText(log).description}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </DialogContent>
      </Dialog>
    </>
  );
}

export const Header = () => {
  const [isSettingsDropdownOpen, setIsSettingsDropdownOpen] = useState(false);
  const insets = useSafeAreaInsets();

  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 12,
    right: 12,
  };

  const [isDarkColorScheme, setIsDarkColorScheme] = useState(true);
  const [modal, setModal] = useState<Modal | null>(null);

  return (
    <View className="h-[60] px-[32] pt-[20]">
      <HeaderModals modal={modal} setModal={setModal} />
      <View className="flex-1 flex-row justify-between items-center">
        <CompanyLogo
          viewBox="0 0 95 20"
          height={28}
          width={132.57}
          strokeWidth={0}
        />
        <View className="flex-row gap-[24] items-center">
          <View className="flex-row gap-[8]">
            <Button border="none" variant="secondary" icon={Wired}>
              <Text>Wired</Text>
            </Button>
            <Button border="none" variant="secondary" icon={Wifi}>
              <Text>WiFi</Text>
            </Button>
          </View>
          <Switch
            checked={isDarkColorScheme}
            onCheckedChange={setIsDarkColorScheme}
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
                  onPress={() => setModal({ type: "settings" })}
                >
                  <View className="flex-1 flex-row justify-between items-center">
                    <Text className="text-sm font-normal">
                      General Settings
                    </Text>
                    <Settings size={20} />
                  </View>
                </DropdownMenuItem>
                <DropdownMenuItem onPress={() => setModal({ type: "logs" })}>
                  <View className="flex-1 flex-row justify-between items-center">
                    <Text className="text-sm font-normal">Logs</Text>
                    <Logs size={20} />
                  </View>
                </DropdownMenuItem>
                <DropdownMenuItem onPress={() => setModal({ type: "help" })}>
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
