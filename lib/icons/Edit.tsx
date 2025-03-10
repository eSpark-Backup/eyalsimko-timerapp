/*
<svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M7.43176 3.89941H3.41138C3.10673 3.89941 2.81456 4.02044 2.59914 4.23585C2.38372 4.45127 2.2627 4.74345 2.2627 5.04809V13.0889C2.2627 13.3935 2.38372 13.6857 2.59914 13.9011C2.81456 14.1165 3.10673 14.2375 3.41138 14.2375H11.4521C11.7568 14.2375 12.049 14.1165 12.2644 13.9011C12.4798 13.6857 12.6008 13.3935 12.6008 13.0889V9.06848" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M11.7396 3.038C11.968 2.80951 12.2779 2.68115 12.6011 2.68115C12.9242 2.68115 13.2341 2.80951 13.4626 3.038C13.6911 3.26649 13.8194 3.57638 13.8194 3.89951C13.8194 4.22264 13.6911 4.53254 13.4626 4.76102L8.00635 10.2173L5.70898 10.7916L6.28332 8.49424L11.7396 3.038Z" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

*/

import { createLucideIcon, LucideIcon } from "lucide-react-native";
import { iconWithClassName } from "./iconWithClassName";

const RawEdit = createLucideIcon("Edit", [
  [
    "path",
    {
      d: "M7.43176 3.89941H3.41138C3.10673 3.89941 2.81456 4.02044 2.59914 4.23585C2.38372 4.45127 2.2627 4.74345 2.2627 5.04809V13.0889C2.2627 13.3935 2.38372 13.6857 2.59914 13.9011C2.81456 14.1165 3.10673 14.2375 3.41138 14.2375H11.4521C11.7568 14.2375 12.049 14.1165 12.2644 13.9011C12.4798 13.6857 12.6008 13.3935 12.6008 13.0889V9.06848",
      stroke: "white",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      key: "0",
    },
  ],
  [
    "path",
    {
      d: "M11.7396 3.038C11.968 2.80951 12.2779 2.68115 12.6011 2.68115C12.9242 2.68115 13.2341 2.80951 13.4626 3.038C13.6911 3.26649 13.8194 3.57638 13.8194 3.89951C13.8194 4.22264 13.6911 4.53254 13.4626 4.76102L8.00635 10.2173L5.70898 10.7916L6.28332 8.49424L11.7396 3.038Z",
      stroke: "white",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      key: "1",
    },
  ],
]);

iconWithClassName(RawEdit);

type Props = Omit<React.ComponentProps<LucideIcon>, "viewBox">;

const Edit = (props: Props) => (
  <RawEdit strokeWidth={1} viewBox="0 0 16 17" {...props} />
);

export { Edit };
