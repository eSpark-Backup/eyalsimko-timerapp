import { CameraView, useCameraPermissions } from "expo-camera";
import { useNavigation } from "expo-router";
import { View, StyleSheet, PermissionsAndroid, Platform } from "react-native";
import Toast from "react-native-toast-message";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import WifiManager from "react-native-wifi-reborn";
import { useState } from "react";
import * as Sentry from "@sentry/react-native";
import { connectionActor } from "~/lib/store/connectionStore";
import { eventConfigStore } from "~/lib/store/eventConfig";
import * as Location from "expo-location";

const connectToWifi = async ({
  ssid,
  password,
  onFinally,
}: {
  ssid: string;
  password: string;
  onFinally: () => void;
}) => {
  try {
    Toast.show({
      type: "info",
      text1: "Trying to connect to the network",
      text2: `${ssid}; ${password}`,
    });
    await WifiManager.connectToProtectedWifiSSID({
      ssid,
      password,
    });
    eventConfigStore.send({
      type: "addWifiConfig",
      ssid,
      password,
    });
    connectionActor.send({ type: "retry" });
  } catch {
    Toast.show({
      type: "error",
      text1: `Unable to connect to ${ssid} WIFI`,
      text2: "Connection failed",
    });
  } finally {
    onFinally();
  }
  Toast.show({
    type: "success",
    text1: `Connected to ${ssid} WIFI`,
  });
};

export default function ScanCodeScreen() {
  const [isTryingToConnect, setIsTryingToConnect] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const navigation = useNavigation();

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission}>
          <Text>grant permission</Text>
        </Button>
      </View>
    );
  }
  return (
    <View className="flex-1">
      <CameraView
        style={{ flex: 1 }}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        onBarcodeScanned={async (result) => {
          if (isTryingToConnect) return;
          try {
            if (
              result.data.split(",")[0].startsWith("WIFI:") &&
              result.data.split(",")[1].startsWith("PSS:")
            ) {
              setIsTryingToConnect(true);
              const ssid = result.data.split(",")[0].split(":")[1];
              const password = result.data.split(",")[1].split(":")[1];
              Toast.show({
                type: "info",
                text1: "Trying to connect to the network",
                text2: `${ssid}; ${password}`,
              });
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
                  connectToWifi({
                    ssid,
                    password,
                    onFinally: () => {
                      navigation.goBack();
                    },
                  });
                }
              }
              if (Platform.OS === "ios") {
                const { status } =
                  await Location.requestForegroundPermissionsAsync();
                if (status === "granted") {
                  connectToWifi({
                    ssid,
                    password,
                    onFinally: () => {
                      navigation.goBack();
                    },
                  });
                } else {
                  Toast.show({
                    type: "error",
                    text1: `Unable to connect to ${ssid} WIFI`,
                    text2: "Permission to access location was denied",
                  });
                }
              }
            }
          } catch (e) {
            Sentry.captureException(e);
            Toast.show({
              type: "error",
              text1: `Unable to automatically connect to WIFI, ${result.data}`,
              text2: e instanceof Error ? e.message : "UNKNOWN ERROR",
            });
          } finally {
            setIsTryingToConnect(false);
          }
        }}
      >
        <Button
          className="absolute bottom-2 right-2"
          onPress={() => navigation.goBack()}
        >
          <Text>Cancel</Text>
        </Button>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "transparent",
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: "flex-end",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
});
