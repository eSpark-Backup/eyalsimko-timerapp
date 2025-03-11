/*
<svg xmlns="http://www.w3.org/2000/svg" width="60" height="61" fill="none">
  <path fill="#F14766" d="M39.675 55.275 20.8 55.5a6.4 6.4 0 0 1-6.476-5.95L12.5 23.45a2.751 2.751 0 0 1 2.8-2.95h29.4a2.75 2.75 0 0 1 2.8 2.925l-1.474 25.8a6.4 6.4 0 0 1-6.35 6.05Z" opacity=".4"/>
  <path fill="#F14766" d="M35.575 34.5h-11.15a1.875 1.875 0 1 1 0-3.75h11.15a1.875 1.875 0 1 1 0 3.75ZM33.625 43.75h-7.25a1.875 1.875 0 1 1 0-3.75h7.25a1.875 1.875 0 1 1 0 3.75ZM50.624 18.4h-.275a149.296 149.296 0 0 0-40.674 0 1.875 1.875 0 0 1-.6-3.7 150.003 150.003 0 0 1 41.825 0 1.875 1.875 0 0 1-.276 3.725V18.4Z"/>
  <path fill="#F14766" d="M40 15.1H20l1.125-5.8a4.675 4.675 0 0 1 4.5-3.8h8.825a4.7 4.7 0 0 1 4.6 3.825L40 15.1Z"/>
</svg>
*/

import { createLucideIcon, LucideIcon } from "lucide-react-native";
import { iconWithClassName } from "./iconWithClassName";

const RawTrashDanger = createLucideIcon("TrashDanger", [
  [
    "path",
    {
      fill: "#F14766",
      d: "M39.675 55.275 20.8 55.5a6.4 6.4 0 0 1-6.476-5.95L12.5 23.45a2.751 2.751 0 0 1 2.8-2.95h29.4a2.75 2.75 0 0 1 2.8 2.925l-1.474 25.8a6.4 6.4 0 0 1-6.35 6.05Z",
      opacity: ".4",
      key: "0",
    },
  ],
  [
    "path",
    {
      fill: "#F14766",
      d: "M35.575 34.5h-11.15a1.875 1.875 0 1 1 0-3.75h11.15a1.875 1.875 0 1 1 0 3.75ZM33.625 43.75h-7.25a1.875 1.875 0 1 1 0-3.75h7.25a1.875 1.875 0 1 1 0 3.75ZM50.624 18.4h-.275a149.296 149.296 0 0 0-40.674 0 1.875 1.875 0 0 1-.6-3.7 150.003 150.003 0 0 1 41.825 0 1.875 1.875 0 0 1-.276 3.725V18.4Z",
      key: "1",
    },
  ],
  [
    "path",
    {
      fill: "#F14766",
      d: "M40 15.1H20l1.125-5.8a4.675 4.675 0 0 1 4.5-3.8h8.825a4.7 4.7 0 0 1 4.6 3.825L40 15.1Z",
      key: "2",
    },
  ],
]);

iconWithClassName(RawTrashDanger);

type Props = Omit<React.ComponentProps<LucideIcon>, "viewBox">;

const TrashDanger = (props: Props) => (
  <RawTrashDanger strokeWidth={1} viewBox="0 0 60 61" {...props} />
);

export { TrashDanger };
