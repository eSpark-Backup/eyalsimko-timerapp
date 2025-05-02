import { createLucideIcon, LucideIcon } from "lucide-react-native";
import { iconWithClassName } from "./iconWithClassName";
import { opacity } from "react-native-reanimated/lib/typescript/Colors";

/*
<svg xmlns="http://www.w3.org/2000/svg" width="80" height="81" fill="none">
  <path fill="#FF4572" d="m33.9 72.266-18.333-10.6a12.167 12.167 0 0 1-6.1-10.566V29.9a12.167 12.167 0 0 1 6.1-10.567L33.9 8.733a12.267 12.267 0 0 1 12.2 0l18.333 10.6a12.167 12.167 0 0 1 6.1 10.567v21.2a12.167 12.167 0 0 1-6.1 10.566L46.1 72.266a12.266 12.266 0 0 1-12.2 0Z" opacity=".3"/>
  <path fill="#FF4572" d="M40 45.166a3.334 3.334 0 0 0 3.333-3.333V26.3a3.333 3.333 0 0 0-6.667 0v15.533a3.333 3.333 0 0 0 3.333 3.333ZM40 58.033a4.167 4.167 0 1 0 0-8.333 4.167 4.167 0 0 0 0 8.333Z"/>
</svg>
*/

const RawWarning = createLucideIcon("Warning", [
  [
    "path",
    {
      d: "m33.9 72.266-18.333-10.6a12.167 12.167 0 0 1-6.1-10.566V29.9a12.167 12.167 0 0 1 6.1-10.567L33.9 8.733a12.267 12.267 0 0 1 12.2 0l18.333 10.6a12.167 12.167 0 0 1 6.1 10.567v21.2a12.167 12.167 0 0 1-6.1 10.566L46.1 72.266a12.266 12.266 0 0 1-12.2 0Z",
      fill: "#FF4572",
      opacity: "0.3",
      key: "0",
    },
  ],
  [
    "path",
    {
      d: "M40 45.166a3.334 3.334 0 0 0 3.333-3.333V26.3a3.333 3.333 0 0 0-6.667 0v15.533a3.333 3.333 0 0 0 3.333 3.333ZM40 58.033a4.167 4.167 0 1 0 0-8.333 4.167 4.167 0 0 0 0 8.333Z",
      fill: "#FF4572",
      key: "1",
    },
  ],
]);

iconWithClassName(RawWarning);

type Props = Omit<React.ComponentProps<LucideIcon>, "viewBox">;

const Warning = (props: Props) => (
  <RawWarning strokeWidth={0} viewBox="0 0 80 81" {...props} />
);

export { Warning };
