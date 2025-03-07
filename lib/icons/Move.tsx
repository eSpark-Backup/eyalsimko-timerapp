/*
<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<ellipse cx="2.66634" cy="5.99984" rx="1.33333" ry="1.33333" fill="#8B9096"/>
<ellipse cx="7.99935" cy="5.99984" rx="1.33333" ry="1.33333" fill="#8B9096"/>
<circle cx="13.3333" cy="5.99984" r="1.33333" fill="#8B9096"/>
<ellipse cx="2.66634" cy="9.99984" rx="1.33333" ry="1.33333" fill="#8B9096"/>
<ellipse cx="7.99935" cy="9.99984" rx="1.33333" ry="1.33333" fill="#8B9096"/>
<ellipse cx="13.3333" cy="9.99984" rx="1.33333" ry="1.33333" fill="#8B9096"/>
</svg>
*/

import { createLucideIcon, LucideIcon } from "lucide-react-native";
import { iconWithClassName } from "./iconWithClassName";

const RawMove = createLucideIcon("Move", [
  [
    "ellipse",
    {
      cx: "2.66634",
      cy: "5.99984",
      rx: "1.33333",
      ry: "1.33333",
      fill: "#8B9096",
      key: "0",
    },
  ],
  [
    "ellipse",
    {
      cx: "7.99935",
      cy: "5.99984",
      rx: "1.33333",
      ry: "1.33333",
      fill: "#8B9096",
      key: "1",
    },
  ],
  [
    "circle",
    {
      cx: "13.3333",
      cy: "5.99984",
      r: "1.33333",
      fill: "#8B9096",
      key: "2",
    },
  ],
  [
    "ellipse",
    {
      cx: "2.66634",
      cy: "9.99984",
      rx: "1.33333",
      ry: "1.33333",
      fill: "#8B9096",
      key: "3",
    },
  ],
  [
    "ellipse",
    {
      cx: "7.99935",
      cy: "9.99984",
      rx: "1.33333",
      ry: "1.33333",
      fill: "#8B9096",
      key: "4",
    },
  ],
  [
    "ellipse",
    {
      cx: "13.3333",
      cy: "9.99984",
      rx: "1.33333",
      ry: "1.33333",
      fill: "#8B9096",
      key: "5",
    },
  ],
]);

iconWithClassName(RawMove);

type Props = Omit<React.ComponentProps<LucideIcon>, "viewBox">;

const Move = (props: Props) => (
  <RawMove strokeWidth={0} viewBox="0 0 16 16" {...props} />
);

export { Move };
