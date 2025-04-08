import { NativeModules, Platform } from "react-native";

export const getLocale = () => {
  let locale: string;

  if (Platform.OS === "ios") {
    // iOS
    locale = NativeModules.SettingsManager.settings.AppleLocale ?? "en-US";
  } else if (Platform.OS === "android") {
    // Android
    locale = NativeModules.I18nManager.localeIdentifier ?? "en-US";
  } else if (Platform.OS === "web") {
    // Web
    locale = navigator.language ?? "en-US"; 
  } else {
    locale = "en-US";
  }

  try {
    new Intl.DateTimeFormat(locale, { timeStyle: "medium" });
    return locale;
  } catch {
    return "en-US";
  }
};
