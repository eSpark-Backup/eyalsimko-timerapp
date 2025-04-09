import { Platform } from "react-native"; // To check platform (web vs mobile)
import { createLucideIcon, LucideIcon } from "lucide-react-native";

// Define the type for Props
type Props = Omit<React.ComponentProps<LucideIcon>, "viewBox">;

// Raw icon definition (Mobile version)
const RawWired = createLucideIcon("Wired", [
  [
    "rect",
    {
      x: "1.44473",
      y: "1.07998",
      width: "4.8",
      height: "4.8",
      rx: "0.9",
      stroke: "white",
      strokeOpacity: "0.6",
      strokeWidth: "1.2",
      key: "0",
    },
  ],
  [
    "rect",
    {
      x: "13.685",
      y: "14.4242",
      width: "4.8",
      height: "4.8",
      rx: "0.9",
      stroke: "white",
      strokeOpacity: "0.6",
      strokeWidth: "1.2",
      key: "1",
    },
  ],
  [
    "path",
    {
      d: "M3.84375 6.47998V8.61611C3.84375 9.44453 4.51532 10.1161 5.34375 10.1161H14.5845C15.413 10.1161 16.0845 10.7877 16.0845 11.6161V13.824",
      stroke: "white",
      strokeOpacity: "0.6",
      strokeWidth: "1.2",
      key: "2",
    },
  ],
]);

// Raw icon definition for web (adjusted sizes)
const RawWiredForWeb = (props: Props) => {
  return (
    <div
      style={{
        display: "inline-block",
        width: "50%",
        height: "50%",
        maxWidth: "100%",
        maxHeight: "100%",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        style={{
          width: "100%",
          height: "100%",
          maxWidth: "100%",
          maxHeight: "100%",
          objectFit: "contain",
        }}
        {...props} // Spread the props here
      >
        <rect
          x="1.44473"
          y="1.07998"
          width="4.8"
          height="4.8"
          rx="0.9"
          stroke="white"
          strokeOpacity="0.6"
          strokeWidth="1.2"
        />
        <rect
          x="13.685"
          y="14.4242"
          width="4.8"
          height="4.8"
          rx="0.9"
          stroke="white"
          strokeOpacity="0.6"
          strokeWidth="1.2"
        />
        <path
          d="M3.84375 6.47998V8.61611C3.84375 9.44453 4.51532 10.1161 5.34375 10.1161H14.5845C15.413 10.1161 16.0845 10.7877 16.0845 11.6161V13.824"
          stroke="white"
          strokeOpacity="0.6"
          strokeWidth="1.2"
        />
      </svg>
    </div>
  );
};

// Conditionally use different icon for web and mobile
const Wired = (props: any) => {
  if (Platform.OS === "web") {
    return <RawWiredForWeb {...props} />; // Return the web version
  }
  return <RawWired {...props} />; // Return the mobile version
};

export { Wired };
