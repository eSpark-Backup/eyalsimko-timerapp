import { NativeModules, Platform } from "react-native";

export const getLocale = () => {
  const deviceLanguage =
    Platform.OS === "ios"
      ? NativeModules.SettingsManager.settings.AppleLocale // iOS
      : NativeModules.I18nManager.localeIdentifier; // Android
  const locale = deviceLanguage ?? "en-US"
  try {
    new Intl.DateTimeFormat(locale, {
      timeStyle: "medium",
    });
    return locale
  } catch {
    return "en-US"
  }
}