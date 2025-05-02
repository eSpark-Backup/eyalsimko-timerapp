import { createLucideIcon, LucideIcon } from "lucide-react-native";
import { iconWithClassName } from "./iconWithClassName";

const RawZap = createLucideIcon("Zap", [
  [
    "path",
    {
      d: "M4.28458 0.4H8.14397L6.84663 3.85955L6.64396 4.4H7.22117H9.23241C9.38899 4.4001 9.54262 4.44262 9.67696 4.52305C9.8113 4.60348 9.92134 4.71881 9.99537 4.85678C10.0694 4.99475 10.1047 5.1502 10.0974 5.30661C10.0902 5.46298 10.0407 5.61447 9.95428 5.74497C9.95425 5.74501 9.95423 5.74504 9.95421 5.74508L6.06807 11.6H4.87148L5.74722 8.09701L5.87148 7.6H5.35917H3.29283C3.29278 7.6 3.29272 7.6 3.29267 7.6C3.1554 7.59992 3.02005 7.56774 2.89742 7.50604C2.77475 7.44431 2.66822 7.35475 2.58634 7.2445C2.50445 7.13426 2.44949 7.00639 2.42585 6.87112C2.40221 6.73588 2.41052 6.59699 2.45012 6.46554C2.45013 6.4655 2.45014 6.46546 2.45015 6.46542L4.28458 0.4Z",
      stroke: "white",
      strokeWidth: "0.8",
      key: "0",
    },
  ],
]);

iconWithClassName(RawZap);

type Props = Omit<React.ComponentProps<LucideIcon>, "viewBox">;

const Zap = (props: Props) => <RawZap viewBox="0 0 12 12" {...props} />;

export { Zap };
