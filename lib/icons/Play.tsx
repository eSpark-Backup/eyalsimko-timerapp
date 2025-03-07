/*
<svg width="10" height="14" viewBox="0 0 10 14" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0.248047 0.890625L9.75152 7L0.248047 13.1094V0.890625Z" fill="white"/>
</svg>
*/
import { createLucideIcon, LucideIcon } from "lucide-react-native";
import { iconWithClassName } from "./iconWithClassName";

const RawPlay = createLucideIcon("Play", [
  [
    "path",
    {
      d: "M0.248047 0.890625L9.75152 7L0.248047 13.1094V0.890625Z",
      fill: "white",
      key: "0",
    },
  ],
]);

iconWithClassName(RawPlay);

type Props = Omit<React.ComponentProps<LucideIcon>, "viewBox">;

const Play = (props: Props) => (
  <RawPlay strokeWidth={0} viewBox="0 0 10 14" {...props} />
);

export { Play };
