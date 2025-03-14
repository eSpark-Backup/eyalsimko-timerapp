/*
<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="8.07538" cy="7.93768" r="6.31499" fill="#09141F" stroke="#F1416C" stroke-width="3.1575"/>
</svg>

*/

/*
<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="8.07538" cy="7.98016" r="6.31499" fill="#09141F" stroke="#E0B108" stroke-width="3.1575"/>
</svg>
*/

import { createLucideIcon, LucideIcon } from "lucide-react-native";
import { iconWithClassName } from "./iconWithClassName";

const RawRedDot = createLucideIcon("RedDot", [
  [
    "circle",
    {
      cx: "8.07538",
      cy: "7.93768",
      r: "6.31499",
      fill: "#09141F",
      stroke: "#F1416C",
      strokeWidth: "3.1575",
      key: "0",
    },
  ],
]);

iconWithClassName(RawRedDot);

type Props = Omit<React.ComponentProps<LucideIcon>, "viewBox">;

export const RedDot = (props: Props) => (
  <RawRedDot viewBox="0 0 16 16" {...props} />
);

const RawGreenDot = createLucideIcon("GreenDot", [
  [
    "circle",
    {
      cx: "8.07538",
      cy: "7.93768",
      r: "6.31499",
      fill: "#09141F",
      stroke: "hsla(147, 100%, 35%, 1)",
      strokeWidth: "3.1575",
      key: "0",
    },
  ],
]);

export const GreenDot = (props: Props) => (
  <RawGreenDot viewBox="0 0 16 16" {...props} />
);
