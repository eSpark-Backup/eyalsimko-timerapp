import { PermissionsAndroid, Platform } from "react-native";
import * as Location from "expo-location";
import WifiManager from "react-native-wifi-reborn";

export class PermissionDeniedError extends Error { }

export class FailedToConnectError extends Error { }

export class UnknownConnectionError extends Error { }

const internalConnectToWifi = async ({
  ssid,
  password,
}: {
  ssid: string;
  password: string;
}) => {
  try {
    await WifiManager.connectToProtectedWifiSSID({
      ssid,
      password,
    });
  } catch (e) {
    if (
      typeof e === "object" &&
      e !== null &&
      "message" in e &&
      e.message === "internal error."
    )
      throw new UnknownConnectionError();
    throw new FailedToConnectError()
  }
};


export const connectToWifi = async ({ ssid, password }: { ssid: string, password: string }) => {

  if (Platform.OS === "android") {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title:
          "Location permission is required for WiFi connections",
        message:
          "This app needs location permission as this is required automatically connect to WiFi network.",
        buttonNegative: "DENY",
        buttonPositive: "ALLOW",
      }
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      internalConnectToWifi({
        ssid,
        password,
      });
    } else {
      throw new PermissionDeniedError();
    }
  }
  if (Platform.OS === "ios") {
    const { status } =
      await Location.requestForegroundPermissionsAsync();
    if (status === "granted") {
      internalConnectToWifi({
        ssid,
        password,
      });
    } else {
      throw new PermissionDeniedError();
    }
  }

} 