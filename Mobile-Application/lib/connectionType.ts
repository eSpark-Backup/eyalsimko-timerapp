import { Platform } from "react-native"
import WifiManager from "react-native-wifi-reborn";
import NetInfo, {
  NetInfoState,
  NetInfoStateType,
} from "@react-native-community/netinfo";
import Toast from "react-native-toast-message";
import { useSelector } from "@xstate/store/react";
import { eventConfigStore } from "./store/eventConfig";

export type ConnectionType = "LAN" | "SCREEN_WIFI" | "NONE"

export const getConnectionType = async (): Promise<ConnectionType> => {
  const knownWifiNetworks = useSelector(
    eventConfigStore,
    (state) => state.context.screenWifiConfig
  );

  if (Platform.OS === "android") {
    const ssid = await WifiManager.getCurrentWifiSSID()
    if (knownWifiNetworks.map(network => network.ssid).includes(ssid)) {
      return "SCREEN_WIFI"
    }
    const netInfo = await NetInfo.fetch()
    if (netInfo.type === NetInfoStateType.ethernet) {
      return "LAN"
    }
    return "NONE"
  }

  else if (Platform.OS === "ios") {
    const ssid = await WifiManager.getCurrentWifiSSID()
    if (knownWifiNetworks.map(network => network.ssid).includes(ssid)) {
      return "SCREEN_WIFI"
    }

    const netInfo = await NetInfo.fetch()
    if (netInfo.type === NetInfoStateType.wifi) {
      if (netInfo.details.ssid?.startsWith("TOUG")) {
        return "SCREEN_WIFI"
      }
      return "NONE"
    }

    if (netInfo.type !== NetInfoStateType.none && netInfo.type !== NetInfoStateType.cellular) {
      return "LAN"
    }

    Toast.show({
      type: "error",
      text1: "Can't get connection type",
      text2: "Unknown platform.",
    })
  }

  return "NONE"
}