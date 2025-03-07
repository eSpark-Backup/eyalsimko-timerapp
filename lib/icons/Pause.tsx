import { createLucideIcon, LucideIcon } from "lucide-react-native";
import { iconWithClassName } from "./iconWithClassName";

const RawPause = createLucideIcon("Pause", [
  [
    "path",
    {
      d: "M4.81445 0.919434H0.220703V18.9194H4.81445V0.919434Z",
      fill: "white",
      key: "0",
    },
  ],
  [
    "path",
    {
      d: "M14 0.919434H9.40625V18.9194H14V0.919434Z",
      fill: "white",
      key: "1",
    },
  ],
]);

iconWithClassName(RawPause);

type Props = Omit<React.ComponentProps<LucideIcon>, "viewBox">;

const Pause = (props: Props) => (
  <RawPause strokeWidth={0} viewBox="0 0 14 19" {...props} />
);

export { Pause };
