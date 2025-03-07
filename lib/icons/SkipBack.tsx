import { createLucideIcon, LucideIcon } from "lucide-react-native";
import { iconWithClassName } from "./iconWithClassName";

const RawSkipBack = createLucideIcon("SkipBack", [
  [
    "path",
    {
      d: "M9.6167 0.182284C9.0557 -0.101716 8.4177 -0.0497161 7.91069 0.322284L2.83469 4.68028C2.71169 4.77078 2.60369 4.87528 2.51219 4.99078V0.182279C2.51219 -0.0937207 1.28869 -0.00121605 1.01219 -0.00121605C0.735695 -0.00121605 0.512195 0.222784 0.512195 0.498784V11.4988C0.512195 11.7748 0.735695 11.9988 1.01219 11.9988C1.28869 11.9988 2.51219 12.0958 2.51219 11.8198V7.00678C2.60319 7.12228 2.71119 7.22728 2.83469 7.31728L7.91069 11.6798C8.20119 11.8933 8.53469 12.0013 8.8722 12.0013C9.1237 12.0013 9.3772 11.9413 9.6167 11.8198C10.1777 11.5353 10.5127 10.9903 10.5127 10.3613V1.64078C10.5127 1.01178 10.1777 0.466784 9.6167 0.182284Z",
      fill: "white",
      key: "0",
    },
  ],
]);

iconWithClassName(RawSkipBack);

type Props = Omit<React.ComponentProps<LucideIcon>, "viewBox">;

const SkipBack = (props: Props) => (
  <RawSkipBack strokeWidth={0} viewBox="0 0 12 12" {...props} />
);

export { SkipBack };
