/*
<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="1.44473" y="1.07998" width="4.8" height="4.8" rx="0.9" stroke="white" stroke-opacity="0.6" stroke-width="1.2"/>
<rect x="13.685" y="14.4242" width="4.8" height="4.8" rx="0.9" stroke="white" stroke-opacity="0.6" stroke-width="1.2"/>
<path d="M3.84375 6.47998V8.61611C3.84375 9.44453 4.51532 10.1161 5.34375 10.1161H14.5845C15.413 10.1161 16.0845 10.7877 16.0845 11.6161V13.824" stroke="white" stroke-opacity="0.6" stroke-width="1.2"/>
</svg>
*/

import { createLucideIcon, LucideIcon } from "lucide-react-native";
import { iconWithClassName } from "./iconWithClassName";

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

iconWithClassName(RawWired);

type Props = Omit<React.ComponentProps<LucideIcon>, "viewBox">;

const Wired = (props: Props) => (
  <RawWired strokeWidth={0} viewBox="0 0 20 20" {...props} />
);

export { Wired };
