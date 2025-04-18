/*
<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M4.16699 10.4582C5.81413 9.08625 7.89 8.33496 10.0337 8.33496C12.1773 8.33496 14.2532 9.08625 15.9003 10.4582" stroke="white" stroke-opacity="0.6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M1.18359 7.50007C3.61895 5.35338 6.75384 4.16895 10.0003 4.16895C13.2467 4.16895 16.3816 5.35338 18.8169 7.50007" stroke="white" stroke-opacity="0.6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M7.1084 13.4249C7.9544 12.8239 8.96646 12.501 10.0042 12.501C11.042 12.501 12.0541 12.8239 12.9001 13.4249" stroke="white" stroke-opacity="0.6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M10 16.6665H10.0083" stroke="white" stroke-opacity="0.6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

*/

import { createLucideIcon, LucideIcon } from "lucide-react-native";
import { iconWithClassName } from "./iconWithClassName";

const RawWifi = createLucideIcon("Wifi", [
  [
    "path",
    {
      d: "M4.16699 10.4582C5.81413 9.08625 7.89 8.33496 10.0337 8.33496C12.1773 8.33496 14.2532 9.08625 15.9003 10.4582",
      stroke: "currentColor",
      strokeOpacity: "0.6",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      key: "0",
    },
  ],
  [
    "path",
    {
      d: "M1.18359 7.50007C3.61895 5.35338 6.75384 4.16895 10.0003 4.16895C13.2467 4.16895 16.3816 5.35338 18.8169 7.50007",
      stroke: "currentColor",
      strokeOpacity: "0.6",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      key: "1",
    },
  ],
  [
    "path",
    {
      d: "M7.1084 13.4249C7.9544 12.8239 8.96646 12.501 10.0042 12.501C11.042 12.501 12.0541 12.8239 12.9001 13.4249",
      stroke: "currentColor",
      strokeOpacity: "0.6",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      key: "2",
    },
  ],
  [
    "path",
    {
      d: "M10 16.6665H10.0083",
      stroke: "currentColor",
      strokeOpacity: "0.6",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      key: "3",
    },
  ],
]);

iconWithClassName(RawWifi);

type Props = Omit<React.ComponentProps<LucideIcon>, "viewBox">;

const Wifi = (props: Props) => (
  <RawWifi strokeWidth={0} viewBox="0 0 20 20" {...props} />
);

export { Wifi };
