import * as React from "react";
import {
  Alert,
  Linking,
  PermissionsAndroid,
  Platform,
  Pressable,
  View,
} from "react-native";
import {
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "./ui/dialog";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector as useMachineSelector } from "@xstate/react";
import NetInfo from "@react-native-community/netinfo";
import * as IntentLauncher from "expo-intent-launcher";
import { connectionActor } from "~/lib/store/connectionStore";
import WifiManager from "react-native-wifi-reborn";
import { TimeInput } from "./ui/time-input";
import { TimerContext } from "~/lib/store/timer";
import { useEffect, useState } from "react";
import { useSelector } from "@xstate/store/react";
import { eventConfigStore } from "~/lib/store/eventConfig";
import { Text } from "./ui/text";
import { Button } from "./ui/button";
import * as Application from "expo-application";
import Toast from "react-native-toast-message";
import { ConnectionType, getConnectionType } from "~/lib/connectionType";
import { Link, useRouter } from "expo-router";
import { QrCode } from "~/lib/icons/QrCode";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Unplug } from "~/lib/icons/Unplug";
import { Power } from "~/lib/icons/Power";
import { RotateCcw } from "~/lib/icons/RotateCcw";
import { useCloseModal, useShowModal } from "~/lib/context/ModalContext";
import {
  connectToWifi,
  FailedToConnectError,
  PermissionDeniedError,
} from "~/lib/connectToWifi";

function VersionInfo() {
  const appVersion = Application.nativeApplicationVersion;
  const buildVersion = Application.nativeBuildVersion;

  return (
    <Text className="text-center pt-[12] font-poppins web:font-poppin">
      Version: {appVersion} ({buildVersion})
    </Text>
  );
}

type WifiNetwork = Awaited<ReturnType<typeof WifiManager.loadWifiList>>[number];

function ConnectionSettings() {
  const closeModal = useCloseModal();
  const [availableNetworks, setAvailableNetworks] = useState<WifiNetwork[]>([]);
  const [isConnectingToWifi, setIsConnectingToWifi] = useState(false);
  const knownWifiNetworks = useSelector(
    eventConfigStore,
    (state) => state.context.screenWifiConfig
  );
  const knownLifeWifiNetworks = knownWifiNetworks.filter((network) =>
    Platform.OS === "android"
      ? availableNetworks.find((wifi) => wifi.SSID === network.ssid)
      : true
  );

  useEffect(() => {
    if (Platform.OS !== "android") return;
    WifiManager.loadWifiList().then(setAvailableNetworks);
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

  const connectToWifiWithToasts = async (
    wifi: (typeof knownLifeWifiNetworks)[number]
  ) => {
    setIsConnectingToWifi(true);
    try {
      await connectToWifi(wifi);
    } catch (e) {
      if (e instanceof PermissionDeniedError) {
        Toast.show({
          type: "error",
          text1: "Permission denied",
          text2:
            "Please grant location permission to connect to WiFi networks.",
        });
      }
      if (e instanceof FailedToConnectError) {
        Toast.show({
          type: "error",
          text1: `Unable to connect to ${wifi.ssid} WIFI`,
          text2: "Connection failed",
        });
      }
    } finally {
      setIsConnectingToWifi(false);
    }
  };
  const isConnectionErrorOrConnecting = isConnectionError || isConnecting;

  const canUpdateFirmware = useMachineSelector(connectionActor, (state) =>
    state.can({ type: "updateFirmware" })
  );

  return (
    <View className="flex gap-4">
      <Text className="text-lg font-semibold font-poppins web:font-poppin">Connection Settings</Text>
      {isConnectionErrorOrConnecting && (
        <View className="gap-[20]">
          {knownLifeWifiNetworks.length !== 0 && (
            <View className="gap-1">
              {Platform.OS === "android" ? (
                <Text className="text-md font-poppins web:font-poppin">Screen WIFI is available.</Text>
              ) : (
                <Text className="text-md font-poppins web:font-poppin">Known WiFi networks:</Text>
              )}
              {knownLifeWifiNetworks.length === 1 ? (
                <Button
                  size="lg"
                  border="none"
                  disabled={isConnectingToWifi}
                  onPress={() => {
                    connectToWifiWithToasts(knownLifeWifiNetworks[0]);
                  }}
                >
                  <Text className="font-normal font-poppins web:font-poppin">
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
                      connectToWifiWithToasts(wifiNetwork);
                    }
                  }}
                >
                  <SelectTrigger className="w-[250px]">
                    <SelectValue
                      className="text-foreground text-sm native:text-lg"
                      placeholder={
                        isConnecting ? "Connecting..." : "Connect to TOUG Wifi"
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
                        <SelectItem key={ssid} label={ssid} value={ssid}>
                          {ssid}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            </View>
          )}
          {knownLifeWifiNetworks.length === 0 && (
            <Text className="text-md font-poppins web:font-poppin">There's no known WiFi networks.</Text>
          )}
          <View className="gap-[4]">
            <Text className="text-md font-poppins web:font-poppin">
              No wired of WiFi connection detected.
            </Text>
            <Text className="text-md font-poppins web:font-poppin">
              Please connect to the WiFi network using SSID and password from
              the screen.
            </Text>
          </View>
          <Button
            size="lg"
            border="none"
            onPress={() => {
              openWifiSettings();
            }}
          >
            <Text className="font-normal font-poppins web:font-poppin">Open WiFi settings to change the network</Text>
          </Button>
          <Link href="/scanCode" asChild>
            <Button size="lg" border="none" onPress={closeModal}>
              <Text className="font-normal font-poppins web:font-poppin">Scan the QR code from the screen</Text>
            </Button>
          </Link>
        </View>
      )}
      {isConnected && (
        <View className="gap-4">
          <Text className="text-md font-poppins web:font-poppin">
            Connection with the screen is established.
          </Text>
          <View className="flex flex-row gap-4">
            <Button
              size="lg"
              variant="default"
              className="flex-1 flex-row gap-2"
              border="none"
              disabled={!canDisconnect}
              icon={Unplug}
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
              <Text className="font-normal font-poppins web:font-poppin">Disconnect</Text>
            </Button>
            <Button
              size="lg"
              className="flex-1 flex-row gap-2"
              variant="destructive"
              disabled={!canShutDown}
              icon={Power}
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
              <Text className="font-normal font-poppins web:font-poppin">Shutdown</Text>
            </Button>
          </View>
          <Button
            disabled={!canUpdateFirmware}
            variant="primary"
            size="lg"
            border="none"
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
                      closeModal();
                    },
                  },
                ]
              );
            }}
          >
            <Text className="font-normal font-poppins web:font-poppin">Update Timer module firmware</Text>
          </Button>
        </View>
      )}
      {isDisconnected && (
        <View className="gap-4">
          <Text className="text-md font-poppins web:font-poppin">
            You manually disconnected from the Screen.
          </Text>
          <View className="flex flex-row gap-2">
            {canReconnect && (
              <Button
                className="flex-1 flex-row gap-2"
                disabled={!canReconnect}
                onPress={() => connectionActor.send(reconnectEvent)}
                size="lg"
                icon={RotateCcw}
              >
                <Text className="font-normal font-poppins web:font-poppin">Reconnect</Text>
              </Button>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

export function SettingsModal() {
  const showModal = useShowModal();
  const closeModal = useCloseModal();

  const initialBlinkLength = useSelector(
    eventConfigStore,
    (state) => state.context.blinkLength
  );
  const initialBlinkingStartTime = useSelector(
    eventConfigStore,
    (state) => state.context.blinkingStartTime
  );

  const [blinkLength, setBlinkLength] = useState(initialBlinkLength);
  const [blinkingStartTime, setBlinkingStartTime] = useState(
    initialBlinkingStartTime
  );
  useEffect(() => {
    setBlinkLength(initialBlinkLength);
    setBlinkingStartTime(initialBlinkingStartTime);
  }, [initialBlinkLength, initialBlinkingStartTime]);

  return (
    <DialogContent className="w-[464]">
      <View className="gap-[40]">
        <DialogHeader>
          <Text className="text-xl text-center font-semibold font-poppins web:font-poppin">
            General Settings
          </Text>
        </DialogHeader>
        <View className="gap-[40]">
          <View className="gap-[12]">
            <Text className="text-lg font-semibold font-poppins web:font-poppin">Flash Settings</Text>
            <View className="flex-row gap-[20]">
              <View className="flex-1">
                <TimeInput
                  value={blinkingStartTime}
                  onChange={setBlinkingStartTime}
                  size="default"
                  label="Start Time"
                  background="modal"
                />
              </View>
              <View className="flex-1">
                <TimeInput
                  size="default"
                  background="modal"
                  value={blinkLength}
                  onChange={setBlinkLength}
                  label="Length"
                />
              </View>
            </View>
          </View>
          <View className="gap-[20]">
            <ConnectionSettings />
          </View>
          <View className="gap-[20]">
            <Button
              variant="destructive"
              size="lg"
              border="none"
              onPress={() => showModal({ type: "deleteData" })}
            >
              <Text className="font-normal font-poppins web:font-poppin">Delete all timers</Text>
            </Button>
          </View>
        </View>
        <DialogFooter>
          <View className="flex-row justify-between">
            <DialogClose asChild>
              <Button size="lg" border="none">
                <Text className="font-normal font-poppins web:font-poppin">Cancel</Text>
              </Button>
            </DialogClose>
            <Button
              size="lg"
              border="none"
              variant="primary"
              onPress={() => {
                eventConfigStore.send({
                  type: "setBlinkingStartTime",
                  blinkingStartTime,
                });
                eventConfigStore.send({
                  type: "setBlinkLength",
                  blinkLength,
                });
                closeModal();
              }}
            >
              <Text className="font-normal font-poppins web:font-poppin">Save Changes</Text>
            </Button>
          </View>
          <VersionInfo />
        </DialogFooter>
      </View>
    </DialogContent>
  );
}
