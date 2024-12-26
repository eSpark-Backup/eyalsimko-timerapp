import "~/global.css";

import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DarkTheme,
  DefaultTheme,
  Theme,
  ThemeProvider,
} from "@react-navigation/native";
import { Link, SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as React from "react";
import { Platform, View } from "react-native";
import { NAV_THEME } from "~/lib/constants";
import { useColorScheme } from "~/lib/useColorScheme";
import { PortalHost } from "@rn-primitives/portal";
import { ThemeToggle } from "~/components/ThemeToggle";
import { setAndroidNavigationBar } from "~/lib/android-navigation-bar";
import { Text } from "~/components/ui/text";
import { CompanyLogo } from "~/lib/icons/CompanyLogo";
import { Button } from "~/components/ui/button";
import { MoreVertical, Wifi, WifiOff } from "lucide-react-native";
import { eventConfigStore } from "~/lib/store/eventConfig";
import { useSelector } from "@xstate/store/react";
import { TimerContext } from "~/lib/store/timer";

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

  const eventName =
    useSelector(eventConfigStore, (state) => state.context.eventName) ??
    "Event";
  const eventDescription =
    useSelector(eventConfigStore, (state) => state.context.eventDescription) ??
    "Description";

  if (!isColorSchemeLoaded) {
    return null;
  }

  return (
    <TimerContext.Provider>
      <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
        <StatusBar
          style={isDarkColorScheme ? "light" : "dark"}
          networkActivityIndicatorVisible
        />
        <Stack>
          <Stack.Screen
            name="index"
            options={{
              title: "",
              headerLeft: () => (
                <View className="flex flex-row gap-12 items-center">
                  <CompanyLogo
                    width={117}
                    height={36.4}
                    strokeWidth={1}
                    viewBox="0 0 180 56"
                  />
                  <Link
                    href={{
                      pathname: "/settings",
                      params: {
                        tab: "eventNameAndDescription",
                      },
                    }}
                  >
                    <Text className="text-2xl font-semibold">
                      {`${eventName}: ${eventDescription}`}
                    </Text>
                  </Link>
                </View>
              ),
              headerRight: () => (
                <>
                  <View className="flex flex-row items-center gap-6">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex flex-row gap-2"
                    >
                      <Wifi className="h-4 w-4 mr-2" />
                      <Text>WIRELESS</Text>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex flex-row gap-2"
                    >
                      <WifiOff className="h-4 w-4 mr-2" />
                      <Text>WIRED</Text>
                    </Button>
                    <ThemeToggle />
                    <Link href="/settings" asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-primary-foreground"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </Link>
                  </View>
                </>
              ),
            }}
          />
          <Stack.Screen
            name="settings"
            options={{
              title: "Event settings",
            }}
          />
        </Stack>
        <PortalHost />
      </ThemeProvider>
    </TimerContext.Provider>
  );
}
