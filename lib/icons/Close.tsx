/*
<svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M18 6.45215L6 18.4521" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M6 6.45215L18 18.4521" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

*/

import { createLucideIcon, LucideIcon } from "lucide-react-native";
import { iconWithClassName } from "./iconWithClassName";

const RawClose = createLucideIcon("Close", [
  [
    "path",
    {
      d: "M18 6.45215L6 18.4521",
      stroke: "white",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      key: "1",
    },
  ],
  [
    "path",
    {
      d: "M6 6.45215L18 18.4521",
      stroke: "white",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      key: "2",
    },
  ],
]);

iconWithClassName(RawClose);

type Props = Omit<React.ComponentProps<LucideIcon>, "viewBox">;

const Close = (props: Props) => (
  <RawClose strokeWidth={0} viewBox="0 0 24 25" {...props} />
);

export { Close };
