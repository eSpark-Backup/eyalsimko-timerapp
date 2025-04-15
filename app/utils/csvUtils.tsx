import { Platform, PermissionsAndroid } from "react-native";
import Toast from "react-native-toast-message";
import { Event } from "~/lib/store/eventConfig";
import { formatCountdown } from "~/lib/utils";
import Papa from "papaparse"; // For parsing CSV files
import Share from 'react-native-share';

let RNFS: any;
let saveAs: any;
if (Platform.OS !== "web") {
  RNFS = require("react-native-fs");
}
else{
  saveAs = require("file-saver");
}

export const exportEventsToCSV = async (events: Event[]) => {
  console.log("Exporting events to CSV:", events);
  if (!events || events.length === 0) {
    Toast.show({ type: "error", text1: "No events to export." });
    return;
  }

  const csvHeaders = [
    "Event Name",
    "Event Description",
    "Speaker Name",
    "Duration",
    "Flash Time",
    "Flash Length",
  ];
  const csvRows = events.map((event) => [
    event.name.trim(),
    event.description?.trim() || "",
    event.speakerName.trim(),
    formatCountdown({
      countdownTime: event.countdownTime,
      elapsedTime: event.countdownTime,
    }).toString(),
    event.blinkingStartTime?.toString() || "",
    event.blinkLength?.toString() || "",
  ]);

  const csvContent = [csvHeaders, ...csvRows]
    .map((row) =>
      row.map((value) => `"${value.replace(/"/g, '""').trim()}"`).join(",")
    )
    .join("\n");

  const fileName = `events_${Date.now()}.csv`;

  if (Platform.OS === "web") {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, fileName);
  } else {
    let downloadPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

    if (Platform.OS === "android") {
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        Toast.show({
          type: "error",
          text1: "Storage permission is required to save the file.",
        });
        return;
      }

      if (Platform.Version >= 29) {
        downloadPath = `${RNFS.DownloadDirectoryPath}/${fileName}`;
      } else {
        downloadPath = `${RNFS.ExternalStorageDirectoryPath}/Download/${fileName}`;
      }
    }

    try {
      await RNFS.writeFile(downloadPath, csvContent.trim(), "utf8");
      if(Platform.OS == "ios") {
        await Share.open({
          url: `file://${downloadPath}`,
          type: 'text/csv',
          filename: fileName,
        });
      }
      Toast.show({ type: "success", text1: `CSV saved to: ${downloadPath}` });
    } catch (error) {
      console.error("Error saving CSV file:", error);
      Toast.show({ type: "error", text1: `Failed to save CSV file.` });
    }
  }
};

const requestStoragePermission = async (): Promise<boolean> => {
  if (Platform.OS !== "android") {
    return true;
  }

  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        title: "Storage Permission Required",
        message:
          "This app needs access to your storage to save CSV files.",
        buttonNeutral: "Ask Me Later",
        buttonNegative: "Cancel",
        buttonPositive: "OK",
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.warn(err);
    return false;
  }
};

export const importEventsFromCSV = async (): Promise<Event[] | null> => {
  if (Platform.OS === "web") {
    return new Promise((resolve, reject) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".csv";
      input.onchange = (e: any) => {
        const file = e.target.files[0];
        if (!file) {
          reject("No file selected");
          return;
        }

        const reader = new FileReader();
        reader.onload = () => {
          const csvContent = reader.result as string;
          const parsedData = parseCSVContent(csvContent);
          resolve(parsedData);
        };
        reader.onerror = (error) => {
          console.error("Error reading file:", error);
          Toast.show({ type: "error", text1: "Failed to read CSV file." });
          reject(error);
        };
        reader.readAsText(file);
      };
      input.click();
    });
  } else {
    try {
      const filePath = await pickCSVFile();
      if (!filePath) {
        Toast.show({ type: "error", text1: "No file selected." });
        return null;
      }

      const csvContent = await RNFS.readFile(filePath, "utf8");
      const parsedData = parseCSVContent(csvContent);
      return parsedData;
    } catch (error) {
      console.error("Error importing CSV file:", error);
      Toast.show({ type: "error", text1: "Failed to import CSV file." });
      return null;
    }
  }
};

const parseCSVContent = (csvContent: string): Event[] => {
  const result = Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: true,
  });

  if (result.errors.length > 0) {
    console.error("CSV Parsing Errors:", result.errors);
    Toast.show({ type: "error", text1: "Invalid CSV format." });
    return [];
  }

  return result.data.map((row: any) => ({
    id: `${Date.now()}_${Math.random()}`,
    name: row["Event Name"]?.trim() || "Untitled Event",
    description: row["Event Description"]?.trim() || "",
    speakerName: row["Speaker Name"]?.trim() || "",
    countdownTime: parseInt(row["Duration"] || "0", 10),
    blinkingStartTime: parseInt(row["Flash Time"] || "0", 10),
    blinkLength: parseInt(row["Flash Length"] || "0", 10),
    startedAt: null,
  }));
};

const pickCSVFile = async (): Promise<string | null> => {
  const DocumentPicker = require("react-native-document-picker");
  try {
    const res = await DocumentPicker.pick({
      type: [DocumentPicker.types.plainText],
    });
    return res[0]?.uri || null;
  } catch (err) {
    if (DocumentPicker.isCancel(err)) {
      console.log("User canceled file picker");
    } else {
      console.error("Unknown error:", err);
    }
    return null;
  }
};