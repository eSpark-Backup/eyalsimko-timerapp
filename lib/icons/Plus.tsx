/*
<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8 3.3335V12.6668" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M3.33301 8H12.6663" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

 */
import { createLucideIcon, LucideIcon } from "lucide-react-native";
import { iconWithClassName } from "./iconWithClassName";

const RawPlus = createLucideIcon("Plus", [
  [
    "path",
    {
      d: "M8 3.3335V12.6668",
      stroke: "white",
      strokeWidth: "1.5",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      key: "0",
    },
  ],
  [
    "path",
    {
      d: "M3.33301 8H12.6663",
      stroke: "white",
      strokeWidth: "1.5",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      key: "1",
    },
  ],
]);

iconWithClassName(RawPlus);

type Props = Omit<React.ComponentProps<LucideIcon>, "viewBox">;

const Plus = (props: Props) => <RawPlus viewBox="0 0 16 16" {...props} />;

export { Plus };
