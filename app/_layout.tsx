import "~/global.css";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DarkTheme,
  DefaultTheme,
  Theme,
  ThemeProvider,
} from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { Link, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as React from "react";
import { Platform, View, StyleSheet, SafeAreaView } from "react-native";
import { NAV_THEME } from "~/lib/constants";
import { useColorScheme } from "~/lib/useColorScheme";
import { PortalHost } from "@rn-primitives/portal";
import { ThemeToggle } from "~/components/ThemeToggle";
import { setAndroidNavigationBar } from "~/lib/android-navigation-bar";
import { Text } from "~/components/ui/text";
import { CompanyLogo } from "~/lib/icons/CompanyLogo";
import { Button } from "~/components/ui/button";
import { MoreVertical } from "~/lib/icons/MoreVertical";
import { Wifi } from "~/lib/icons/Wifi";
import { WifiOff } from "~/lib/icons/WifiOff";
import { eventConfigStore } from "~/lib/store/eventConfig";
import { useSelector as useMachineSelector } from "@xstate/react";
import { useSelector } from "@xstate/store/react";
import { TimerContext, TimerSync } from "~/lib/store/timer";
import { CircleHelp } from "~/lib/icons/CircleHelp";
import { connectionActor } from "~/lib/store/connectionStore";
import { cn } from "~/lib/utils";
import { ToastProvider } from "~/components/ui/toast";
import { LinearGradient } from "expo-linear-gradient";
import Background from "~/components/Background";
import { Header } from "~/components/header";

const LIGHT_THEME: Theme = {
  ...DefaultTheme,
  colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
  ...DarkTheme,
  colors: NAV_THEME.dark,
};

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

// Prevent the splash screen from auto-hiding before getting the color scheme.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { colorScheme, setColorScheme, isDarkColorScheme } = useColorScheme();
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = React.useState(false);
  const [loaded, error] = useFonts({
    "Poppins-Black": require("../assets/fonts/Poppins-Black.ttf"),
    "Poppins-BlackItalic": require("../assets/fonts/Poppins-BlackItalic.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-BoldItalic": require("../assets/fonts/Poppins-BoldItalic.ttf"),
    "Poppins-ExtraBold": require("../assets/fonts/Poppins-ExtraBold.ttf"),
    "Poppins-ExtraBoldItalic": require("../assets/fonts/Poppins-ExtraBoldItalic.ttf"),
    "Poppins-ExtraLight": require("../assets/fonts/Poppins-ExtraLight.ttf"),
    "Poppins-ExtraLightItalic": require("../assets/fonts/Poppins-ExtraLightItalic.ttf"),
    "Poppins-Italic": require("../assets/fonts/Poppins-Italic.ttf"),
    "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
    "Poppins-LightItalic": require("../assets/fonts/Poppins-LightItalic.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-MediumItalic": require("../assets/fonts/Poppins-MediumItalic.ttf"),
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Thin": require("../assets/fonts/Poppins-Thin.ttf"),
    "Poppins-ThinItalic": require("../assets/fonts/Poppins-ThinItalic.ttf"),
  });

  React.useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  React.useEffect(() => {
    (async () => {
      const theme = await AsyncStorage.getItem("theme");
      if (Platform.OS === "web") {
        // Adds the background color to the html element to prevent white background on overscroll.
        document.documentElement.classList.add("bg-background");
      }
      if (!theme) {
        AsyncStorage.setItem("theme", colorScheme);
        setIsColorSchemeLoaded(true);
        return;
      }
      const colorTheme = theme === "dark" ? "dark" : "light";
      if (colorTheme !== colorScheme) {
        setColorScheme(colorTheme);
        setAndroidNavigationBar(colorTheme);
        setIsColorSchemeLoaded(true);
        return;
      }
      setAndroidNavigationBar(colorTheme);
      setIsColorSchemeLoaded(true);
    })().finally(() => {
      SplashScreen.hideAsync();
    });
  }, []);

  const eventName = "Event";
  const eventDescription = "Description";

  const isConnected = useMachineSelector(connectionActor, (state) =>
    state.matches("CONNECTED")
  );
  const isDisconnectedOrIDLE = useMachineSelector(
    connectionActor,
    (state) => state.matches("DISCONNECTED") || state.matches("IDLE")
  );
  const isConnectionErrorOrConnecting = useMachineSelector(
    connectionActor,
    (state) => state.matches("ERROR") || state.matches("CONNECTING")
  );

  const connectionType = useMachineSelector(connectionActor, (state) => {
    if (isConnected) return state.context.type;
    return null;
  });

  if (!isColorSchemeLoaded || !TimerContext.isResolved) {
    return null;
  }

  if (!loaded && !error) {
    return null;
  }

  const oldLayout = (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "",
          header: () => (
            <View className="pt-safe w-full">
              <View className="p-4 flex-row gap-2 md:gap-12">
                <View className="flex-1 flex-row gap-2 md:gap-12 items-center">
                  <CompanyLogo
                    className="text-primary"
                    width={117}
                    height={36.4}
                    strokeWidth={1}
                    viewBox="0 0 180 56"
                  />
                  <View className="flex-1">
                    <Link
                      href={{
                        pathname: "/settings",
                        params: {
                          tab: "eventNameAndDescription",
                        },
                      }}
                    >
                      <View>
                        <Text
                          numberOfLines={1}
                          ellipsizeMode="tail"
                          className="text-lg md:text-2xl font-semibold"
                        >
                          {eventName}
                          {eventDescription ? `: ${eventDescription}` : ""}
                        </Text>
                      </View>
                    </Link>
                  </View>
                </View>
                <View className="flex flex-row items-center sm:gap-4 md:gap-6">
                  <View
                    className={cn(
                      "h-2 w-2 rounded-full",
                      isDisconnectedOrIDLE && "bg-gray-300",
                      isConnected && "bg-green-500",
                      // isConnecting && "bg-gray-500",
                      isConnectionErrorOrConnecting && "bg-red-500"
                    )}
                  />
                  <Link
                    href={{
                      pathname: "/settings",
                      params: {
                        tab: "connection",
                      },
                    }}
                    asChild
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hidden md:flex flex-row gap-2"
                    >
                      <Wifi
                        className={cn(
                          "h-4 w-4 text-primary",
                          connectionType === "WIFI" && "text-green-500"
                        )}
                      />
                      <Text
                        className={cn(
                          connectionType === "WIFI" && "text-green-500"
                        )}
                      >
                        WIRELESS
                      </Text>
                    </Button>
                  </Link>
                  <Link
                    href={{
                      pathname: "/settings",
                      params: {
                        tab: "connection",
                      },
                    }}
                    asChild
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hidden md:flex flex-row gap-2"
                    >
                      <WifiOff
                        className={cn(
                          "h-4 w-4 text-primary",
                          connectionType === "LAN" && "text-green-500"
                        )}
                      />
                      <Text
                        className={cn(
                          connectionType === "LAN" && "text-green-500"
                        )}
                      >
                        WIRED
                      </Text>
                    </Button>
                  </Link>
                  <View className="hidden md:flex">
                    <ThemeToggle />
                  </View>
                  <Link href="/help">
                    <Text>Help</Text>
                  </Link>
                  <Link href="/settings">
                    <Text>Settings</Text>
                  </Link>
                </View>
              </View>
            </View>
          ),
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          title: "Event settings",
          headerRight: () => (
            <Link href="/help" asChild>
              <Button variant="ghost" className="flex flex-row gap-2">
                <CircleHelp className="h-4 w-4 text-foreground" />
                <Text>Help</Text>
              </Button>
            </Link>
          ),
        }}
      />
      <Stack.Screen
        name="scanCode"
        options={{
          header: () => null,
        }}
      />
      <Stack.Screen
        name="help"
        options={{
          title: "Help",
          presentation: "modal",
        }}
      />
    </Stack>
  );

  return (
    <TimerContext.Provider>
      <GestureHandlerRootView>
        <TimerSync />
        <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
          <StatusBar
            hidden={true}
            style={isDarkColorScheme ? "light" : "dark"}
            networkActivityIndicatorVisible
          />
          <View className="flex-1 bg-screenBackground">
            <Background />
            <View className="flex-1">
              <Stack
                screenOptions={{
                  contentStyle: { backgroundColor: "transparent" },
                }}
              >
                <Stack.Screen
                  options={{
                    header: () => <Header />,
                  }}
                  name="index"
                />
              </Stack>
            </View>
          </View>
          <PortalHost />
          <ToastProvider />
        </ThemeProvider>
      </GestureHandlerRootView>
    </TimerContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  blurContainer: {
    flex: 1,
    padding: 20,
    margin: 16,
    textAlign: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderRadius: 20,
  },
  background: {
    flex: 1,
    flexWrap: "wrap",
    // ...StyleSheet.absoluteFill,
  },
  box: {
    width: "25%",
    height: "20%",
  },
  boxEven: {
    backgroundColor: "orangered",
  },
  boxOdd: {
    backgroundColor: "gold",
  },
  text: {
    fontSize: 24,
    fontWeight: "600",
  },
});
