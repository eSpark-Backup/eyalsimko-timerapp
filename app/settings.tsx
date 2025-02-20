import {
  Linking,
  PermissionsAndroid,
  Platform,
  ScrollView,
  View,
  Alert,
} from "react-native";
import WifiManager from "react-native-wifi-reborn";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Text } from "~/components/ui/text";
import { TimerPicker } from "react-native-timer-picker";
import { useSelector as useMachineSelector } from "@xstate/react";
import { useSelector } from "@xstate/store/react";
import { eventConfigStore } from "~/lib/store/eventConfig";
import { formatDuration, getDurationObject } from "~/lib/utils";
import * as Haptics from "expo-haptics"; // for haptic feedback
import { useColorScheme } from "~/lib/useColorScheme";
import { Button } from "~/components/ui/button";
import { useEffect, useState } from "react";
import { Input } from "~/components/ui/input";
import { Link, useLocalSearchParams } from "expo-router";
import { Sun } from "~/lib/icons/Sun";
import { MoonStar } from "~/lib/icons/MoonStar";
import { SunMoon } from "~/lib/icons/SunMoon";
import { connectionActor } from "~/lib/store/connectionStore";
import { Power } from "~/lib/icons/Power";
import { Unplug } from "~/lib/icons/Unplug";
import React from "react";
import { RotateCcw } from "~/lib/icons/RotateCcw";
import { TimerContext } from "~/lib/store/timer";
import { CircleAlert } from "~/lib/icons/CircleAlert";
import NetInfo from "@react-native-community/netinfo";
import { QrCode } from "~/lib/icons/QrCode";
import * as IntentLauncher from "expo-intent-launcher";
import { ConnectionType, getConnectionType } from "~/lib/connectionType";
import Toast from "react-native-toast-message";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useSafeAreaInsets } from "react-native-safe-area-context";
// import * as Application from "expo-application";
import { ErrorBoundary } from "~/components/ErrorBoundary";

function TimerPickerWithControls({
  initialValue,
  reset,
  submit,
}: {
  initialValue: number | null;
  reset: () => void;
  submit: (value: number) => void;
}) {
  const { colorScheme } = useColorScheme();
  const [state, setState] = useState(
    initialValue ? getDurationObject(initialValue) : undefined
  );
  return (
    <View className="items-center gap-4">
      <TimerPicker
        Haptics={Haptics}
        styles={{
          theme: colorScheme === "system" ? undefined : colorScheme,
          backgroundColor: "transparent",
        }}
        initialValue={state}
        onDurationChange={(duration) => {
          setState(duration);
        }}
      />
      <View className="flex flex-row gap-4">
        <Button
          disabled={!state}
          onPress={() => {
            state &&
              submit(state.hours * 3600 + state.minutes * 60 + state.seconds);
          }}
          className="flex-1"
        >
          <Text>Submit</Text>
        </Button>
        <Button onPress={reset} className="flex-1">
          <Text>Reset</Text>
        </Button>
      </View>
    </View>
  );
}

function EventNameSettings({
  onSubmit,
  onReset,
}: {
  onSubmit: () => void;
  onReset: () => void;
}) {
  const initialEventName = useSelector(
    eventConfigStore,
    (state) => state.context.eventName
  );
  const initialEventDescription = useSelector(
    eventConfigStore,
    (state) => state.context.eventDescription
  );

  const [eventName, setEventName] = useState(initialEventName ?? "");
  const [eventDescription, setEventDescription] = useState(
    initialEventDescription ?? ""
  );

  const disableSubmit = eventName.length === 0;

  return (
    <View className="flex gap-4">
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
      <View className="flex-row gap-4">
        <Button
          onPress={() => {
            onSubmit();
            eventConfigStore.send({
              type: "setEventName",
              eventName,
              eventDescription,
            });
          }}
          disabled={disableSubmit}
          className="flex-1"
        >
          <Text className="text-primary-foreground">Submit</Text>
        </Button>
        <Button
          onPress={() => {
            setEventDescription("");
            setEventName("");
            onReset();
            eventConfigStore.send({
              type: "setEventName",
              eventName: null,
              eventDescription: null,
            });
          }}
          className="flex-1"
        >
          <Text>Reset</Text>
        </Button>
      </View>
    </View>
  );
}

function ThemeSettings() {
  const { colorScheme, setColorScheme } = useColorScheme();

  const themes = [
    { value: "dark", title: "Dark", Icon: MoonStar },
    { value: "light", title: "Light", Icon: Sun },
    { value: "system", title: "System", Icon: SunMoon },
  ] as const;

  return (
    <View className="flex justify-between md:flex-row gap-4">
      {themes.map((theme) => (
        <Button
          key={theme.value}
          variant={colorScheme === theme.value ? "default" : "secondary"}
          className="grow flex-row gap-2"
          onPress={() => setColorScheme(theme.value)}
        >
          <theme.Icon
            className={
              colorScheme === theme.value
                ? "text-background"
                : "text-foreground"
            }
            size={24}
            strokeWidth={1.25}
          />
          <Text>{theme.title}</Text>
        </Button>
      ))}
    </View>
  );
}

type WifiNetwork = Awaited<ReturnType<typeof WifiManager.loadWifiList>>[number];

function ConnectionSettings() {
  const [connectionType, setConnectionType] = useState<ConnectionType>("NONE");
  const [availableNetworks, setAvailableNetworks] = useState<WifiNetwork[]>([]);
  const [isConnectingToWifi, setIsConnectingToWifi] = useState(false);
  const knownWifiNetworks = useSelector(
    eventConfigStore,
    (state) => state.context.screenWifiConfig
  );
  const knownLifeWifiNetworks = knownWifiNetworks.filter((network) =>
    availableNetworks.find((wifi) => wifi.SSID === network.ssid)
  );

  useEffect(() => {
    if (Platform.OS !== "android") return;
    WifiManager.loadWifiList().then(setAvailableNetworks);
  }, []);

  useEffect(() => {
    return NetInfo.addEventListener(() => {
      getConnectionType().then(setConnectionType);
    });
  }, []);

  useEffect(() => {
    if (Platform.OS === "android") {
      WifiManager.isEnabled().then((enabled) => {
        if (!enabled) {
          WifiManager.setEnabled(true);
        }
      });
    }
  }, []);

  const isConnected = useMachineSelector(connectionActor, (state) =>
    state.matches("CONNECTED")
  );
  const isDisconnected = useMachineSelector(connectionActor, (state) =>
    state.matches("DISCONNECTED")
  );
  const isConnecting = useMachineSelector(connectionActor, (state) =>
    state.matches("CONNECTING")
  );
  const isConnectionError = useMachineSelector(connectionActor, (state) =>
    state.matches("ERROR")
  );

  const disconnectEvent = { type: "disconnect" } as const;
  const canDisconnect = useMachineSelector(connectionActor, (state) =>
    state.can(disconnectEvent)
  );

  const shutDownEvent = {
    type: "sendMessage",
    message: { type: "shutdown" },
  } as const;
  const canShutDown = useMachineSelector(connectionActor, (state) =>
    state.can(shutDownEvent)
  );

  const retryEvent = { type: "retry" } as const;
  const canRetry = useMachineSelector(connectionActor, (state) =>
    state.can(retryEvent)
  );

  const reconnectEvent = { type: "reconnect" } as const;
  const canReconnect = useMachineSelector(connectionActor, (state) =>
    state.can(reconnectEvent)
  );

  const openWifiSettings = () => {
    if (Platform.OS === "ios") {
      Linking.canOpenURL("App-Prefs:root=WIFI").then((supported) => {
        if (supported) {
          Linking.openURL("App-Prefs:root=WIFI");
        } else {
          Linking.openSettings();
        }
      });
    }
    if (Platform.OS === "android") {
      IntentLauncher.startActivityAsync(
        IntentLauncher.ActivityAction.WIFI_SETTINGS
      );
    }
  };

  const insets = useSafeAreaInsets();

  const connectToWifi = async (
    wifi: (typeof knownLifeWifiNetworks)[number]
  ) => {
    setIsConnectingToWifi(true);
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: "Location permission is required for WiFi connections",
        message:
          "This app needs location permission as this is required automatically connect to WiFi network.",
        buttonNegative: "DENY",
        buttonPositive: "ALLOW",
      }
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      try {
        await WifiManager.connectToProtectedWifiSSID({
          ssid: wifi.ssid,
          password: wifi.password,
        });
        connectionActor.send({ type: "retry" });
      } catch {
        Toast.show({
          type: "error",
          text1: `Unable to connect to ${wifi.ssid} WIFI`,
          text2: "Connection failed",
        });
      } finally {
        setIsConnectingToWifi(false);
      }
    } else {
      Toast.show({
        type: "error",
        text1: `Unable to automatically connect to ${wifi.ssid} WIFI`,
        text2: "User denied location permission",
      });
      setIsConnectingToWifi(false);
    }
  };

  return (
    <View className="flex gap-4">
      {isConnectionError && (
        <>
          {connectionType === "SCREEN_WIFI" && (
            <View>
              <Text>You connected to the wrong wifi network.</Text>
              <View className="flex gap-1">
                <Text>
                  {" "}
                  Please connect to the WiFi network using SSID and password
                  from the screen or
                </Text>
                <Link href="/scanCode" asChild>
                  <Button className="flex-row gap-2">
                    <QrCode className="h-4 w-4 text-primary-foreground" />
                    <Text>Scan the QR code from the screen</Text>
                  </Button>
                </Link>
                <Text>
                  To connect to the screen via a wired connection, please turn
                  off the WiFi
                </Text>
                <Button onPress={openWifiSettings}>
                  <Text>Open WIFI settings to turn WiFi off</Text>
                </Button>
              </View>
            </View>
          )}
          {connectionType === "LAN" && (
            <Text>
              You used a wired connection, but the app can't reach the screen.
              Please make sure you've connected to the screen by wire.
            </Text>
          )}
          {connectionType === "NONE" && (
            <>
              {Platform.OS === "android" && (
                <>
                  {knownLifeWifiNetworks.length !== 0 && (
                    <View className="gap-1">
                      <Text>Screen WIFI is available.</Text>
                      {knownLifeWifiNetworks.length === 1 ? (
                        <Button
                          disabled={isConnectingToWifi}
                          onPress={() => {
                            connectToWifi(knownLifeWifiNetworks[0]);
                          }}
                        >
                          <Text>
                            {isConnectingToWifi
                              ? "Connecting..."
                              : `Connect to the ${knownLifeWifiNetworks[0].ssid}`}
                          </Text>
                        </Button>
                      ) : (
                        <Select
                          disabled={isConnectingToWifi}
                          onValueChange={(option) => {
                            const wifiNetwork = knownLifeWifiNetworks.find(
                              (network) => network.ssid === option?.value
                            );
                            if (wifiNetwork && !isConnectingToWifi) {
                              connectToWifi(wifiNetwork);
                            }
                          }}
                        >
                          <SelectTrigger className="w-[250px]">
                            <SelectValue
                              className="text-foreground text-sm native:text-lg"
                              placeholder={
                                isConnecting
                                  ? "Connecting..."
                                  : "Connect to TOUG Wifi"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent
                            insets={{
                              top: insets.top,
                              bottom: insets.bottom,
                              left: 12,
                              right: 12,
                            }}
                            className="w-[250px]"
                          >
                            <SelectGroup>
                              {knownLifeWifiNetworks.map(({ ssid }) => (
                                <SelectItem
                                  key={ssid}
                                  label={ssid}
                                  value={ssid}
                                >
                                  {ssid}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      )}
                    </View>
                  )}
                </>
              )}
              <Text>No wired of WiFi connection available.</Text>
              <Text>
                Please connect to the WiFi network using SSID and password from
                the screen or
              </Text>
              <Button onPress={openWifiSettings}>
                <Text>Open WIFI settings to change the network</Text>
              </Button>
              <Link href="/scanCode" asChild>
                <Button className="flex-row gap-2">
                  <QrCode className="h-4 w-4 text-primary-foreground" />
                  <Text>Scan the QR code from the screen</Text>
                </Button>
              </Link>
            </>
          )}
        </>
      )}
      {isConnected && (
        <View className="flex flex-row gap-4">
          <Button
            className="flex-1 flex-row gap-2"
            disabled={!canDisconnect}
            onPress={() => {
              Alert.alert(
                "Disconnect",
                "Disconnecting from the timer module will stop active timer and turn the timer in connection screen. Do you want to disconnect?",
                [
                  {
                    text: "Cancel",
                    style: "cancel",
                    onPress: () => {},
                  },
                  {
                    text: "Disconnect",
                    style: "destructive",
                    onPress: () => connectionActor.send(disconnectEvent),
                  },
                ]
              );
            }}
          >
            <Unplug className="h-4 w-4 text-primary-foreground" />
            <Text>Disconnect</Text>
          </Button>
          <Button
            className="flex-1 flex-row gap-2"
            variant="destructive"
            disabled={!canShutDown}
            onPress={() => {
              Alert.alert(
                "Shutdown",
                "Shutting down the timer module will shut down the timer module. To continue using the timer module afterward, it has to be turned on again. Do you want to shutdown?",
                [
                  {
                    text: "Cancel",
                    style: "cancel",
                    onPress: () => {},
                  },
                  {
                    text: "Shutdown",
                    style: "destructive",
                    onPress: () => connectionActor.send(shutDownEvent),
                  },
                ]
              );
            }}
          >
            <Power className="h-4 w-4 text-destructive-foreground" />
            <Text>Shutdown</Text>
          </Button>
        </View>
      )}
      {isConnecting && <Text>Connecting...</Text>}
      {isDisconnected && (
        <View className="flex flex-row gap-2">
          {canReconnect && (
            <Button
              className="flex-1 flex-row gap-2"
              disabled={!canReconnect}
              onPress={() => connectionActor.send(reconnectEvent)}
            >
              <RotateCcw className="h-4 w-4 text-primary-foreground" />
              <Text>Reconnect</Text>
            </Button>
          )}
        </View>
      )}
    </View>
  );
}

function VersionInfo() {
  const Application = require("expo-application"); // TODO: remove this, uncomment the import
  const appVersion = Application.nativeApplicationVersion;
  const buildVersion = Application.nativeBuildVersion;

  return (
    <View className="pb-safe pt-safe items-center">
      <Text>
        Version: {appVersion} ({buildVersion})
      </Text>
    </View>
  );
}

export default function SettingsScreen() {
  const initialAccordionTab = useLocalSearchParams<{ tab?: string }>().tab;
  const [currentTab, setCurrentTab] = useState<string | undefined>(
    initialAccordionTab
  );
  const toggleTab = (tab: string) => {
    setCurrentTab((currentState) => (currentState === tab ? "" : tab));
  };
  const defaultBlinkingStartTime = useSelector(
    eventConfigStore,
    (state) => state.context.defaultBlinkingStartTime
  );
  const blinkLength = useSelector(
    eventConfigStore,
    (state) => state.context.blinkLength
  );
  const { colorScheme } = useColorScheme();

  const connectionMode = useMachineSelector(
    connectionActor,
    (state) => state.context.type
  );

  const timerActorRef = TimerContext.useActorRef();
  const canUpdateFirmware = useMachineSelector(connectionActor, (state) =>
    state.can({ type: "updateFirmware" })
  );

  return (
    <ScrollView
      className="flex flex-1  bg-secondary/30"
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View className="flex-1 items-center justify-center gap-5 p-6">
        <Accordion
          value={currentTab}
          type="single"
          collapsible
          className="w-full max-w-sm native:max-w-md"
        >
          <AccordionItem value="eventNameAndDescription">
            <AccordionTrigger
              onPress={() => toggleTab("eventNameAndDescription")}
            >
              <Text>Event name & description</Text>
            </AccordionTrigger>
            <AccordionContent>
              <EventNameSettings
                onSubmit={() => setCurrentTab("")}
                onReset={() => setCurrentTab("")}
              />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="defaultBlinkingStartTime">
            <AccordionTrigger
              onPress={() => toggleTab("defaultBlinkingStartTime")}
            >
              <Text>
                Default blink start time:{" "}
                {defaultBlinkingStartTime
                  ? formatDuration(defaultBlinkingStartTime)
                  : "None"}
              </Text>
            </AccordionTrigger>
            <AccordionContent>
              <TimerPickerWithControls
                initialValue={defaultBlinkingStartTime}
                reset={() => {
                  setCurrentTab("");
                  eventConfigStore.send({
                    type: "setDefaultBlinkingStartTime",
                    defaultBlinkingStartTime: null,
                  });
                }}
                submit={(value) => {
                  setCurrentTab("");
                  eventConfigStore.send({
                    type: "setDefaultBlinkingStartTime",
                    defaultBlinkingStartTime: value,
                  });
                }}
              />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="blinkLength">
            <AccordionTrigger onPress={() => toggleTab("blinkLength")}>
              <Text>
                Blink length:{" "}
                {blinkLength ? formatDuration(blinkLength) : "None"}
              </Text>
            </AccordionTrigger>
            <AccordionContent>
              <TimerPickerWithControls
                initialValue={blinkLength}
                reset={() => {
                  setCurrentTab("");
                  eventConfigStore.send({
                    type: "setBlinkLength",
                    blinkLength: null,
                  });
                }}
                submit={(value) => {
                  setCurrentTab("");
                  eventConfigStore.send({
                    type: "setBlinkLength",
                    blinkLength: value,
                  });
                }}
              />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="theme">
            <AccordionTrigger onPress={() => toggleTab("theme")}>
              <Text>Theme: {colorScheme}</Text>
            </AccordionTrigger>
            <AccordionContent>
              <ThemeSettings />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="connection">
            <AccordionTrigger onPress={() => toggleTab("connection")}>
              <Text>
                Connection settings:{" "}
                {connectionMode
                  ? `Connected over ${connectionMode}`
                  : "Not connected"}
              </Text>
            </AccordionTrigger>
            <AccordionContent>
              <ConnectionSettings />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="reset">
            <AccordionTrigger onPress={() => toggleTab("reset")}>
              <Text>Clear Timers</Text>
            </AccordionTrigger>
            <AccordionContent>
              <Button
                variant={"destructive"}
                className="flex-row gap-2"
                onPress={() => {
                  eventConfigStore.send({
                    type: "reset",
                  });
                  timerActorRef.send({ type: "reset" });
                }}
              >
                <CircleAlert className="h-4 w-4 text-destructive-foreground" />
                <Text>Clear event data</Text>
              </Button>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="OTA-update">
            <AccordionTrigger onPress={() => toggleTab("OTA-update")}>
              <Text>OTA update</Text>
            </AccordionTrigger>
            <AccordionContent>
              <Button
                disabled={!canUpdateFirmware}
                variant={"destructive"}
                className="flex-row gap-2"
                onPress={() => {
                  Alert.alert(
                    "Update Timer module firmware",
                    "Updating the timer module will reboot the device. Do you want to update?",
                    [
                      {
                        text: "Cancel",
                        style: "cancel",
                        onPress: () => {},
                      },
                      {
                        text: "Update",
                        style: "destructive",
                        onPress: () => {
                          connectionActor.send({ type: "updateFirmware" });
                        },
                      },
                    ]
                  );
                }}
              >
                <Text>Update Timer module firmware</Text>
              </Button>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </View>
      <ErrorBoundary fallback={null}>
        <VersionInfo />
      </ErrorBoundary>
    </ScrollView>
  );
}
