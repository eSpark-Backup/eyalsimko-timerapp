import { useWindowDimensions, View } from "react-native";
import {
  Canvas,
  Circle,
  Group,
  vec,
  BlurMask,
  LinearGradient,
} from "@shopify/react-native-skia";

const colors = {
  dark: {
    background: "hsla(210, 100%, 5%, 1)",
    ellipsis1: "hsla(213, 98%, 45%, 0.19)",
    ellipsis2: "hsla(245, 100%, 31%, 1)",
    ellipsis3: "hsla(259, 83%, 27%, 1)",
    ellipsis4: "hsla(147, 100%, 35%, 0.38)",
    gradient: ["hsla(224, 83%, 49%, 1)", "hsla(224, 83%, 27%, 0)"],
  },
};

/*
background: linear-gradient(360deg, rgba(12, 42, 127, 0) 14.65%, rgba(22, 76, 229, 0.6) 96.07%);

*/
const GradientCircle = ({
  cx,
  cy,
  r,
  colors,
}: {
  cx: number;
  cy: number;
  r: number;
  colors: string[];
}) => {
  return (
    <Circle cx={cx} cy={cy} r={r}>
      <LinearGradient
        start={vec(cx, cy - r / 2)}
        end={vec(cx, cy + r / 2)}
        colors={colors}
      />
      {/* <BlurMask blur={50} style="normal" /> */}
    </Circle>
  );
};

// numbers from figma
const BASE_WIDTH = 1194;
const BASE_HEIGHT = 834;

export default function Background() {
  const { width, height } = useWindowDimensions(); // Get screen size dynamically
  const scaleR = (value: number) => value * (width ** 2 / BASE_WIDTH ** 2);
  const scaleX = (value: number) => (value / BASE_WIDTH) * width;
  const scaleY = (value: number) => (value / BASE_HEIGHT) * height;

  const theme = "dark" as const;
  return (
    <Canvas
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        backgroundColor: colors[theme].background,
      }}
    >
      <Group>
        {/* Ellipsis 1 */}
        {/*
        width: 257.44921875;
        height: 257.44921875;
        top: 764px;
        left: 336.78px;
        */}
        <Circle
          cx={scaleX(336.78) + scaleX(100)} // Center X
          cy={scaleY(764) + scaleY(100)} // Center Y
          r={scaleR(257.44921875 / 2)} // Radius
          color={colors[theme].ellipsis1} // Replace with your color
        >
          {/* <BlurMask blur={50} style="normal" /> */}
        </Circle>
        {/* Ellipsis 2 */}
        {/**
        width: 62.99384689331055;
        height: 62.99384689331055;
        top: 406.74px;
        left: 1153.14px;
         */}
        <Circle
          cx={scaleX(1153.14) + scaleX(31.495)}
          cy={scaleY(406.74) + scaleY(31.495)}
          r={scaleR(62.99384689331055 / 2)}
          color={colors[theme].ellipsis2}
        >
          {/* <BlurMask blur={50} style="normal" /> */}
        </Circle>
        {/* Ellipsis 3
        width: 103.43777465820312;
        height: 103.43777465820312;
        top: 334.8px;
        left: 1069.41px;
        */}
        <Circle
          cx={scaleX(1069.41) + scaleX(51.72)}
          cy={scaleY(334.8) + scaleY(51.72)}
          r={scaleR(103.43777465820312 / 2)}
          color={colors[theme].ellipsis3}
        >
          {/* <BlurMask blur={50} style="normal" /> */}
        </Circle>
        {/* Ellipsis 5 
        width: 257.44921875;
        height: 257.44921875;
        top: 357.97px;
        left: -142.45px;
        */}
        <GradientCircle
          // cx={300}
          cx={scaleX(-142.45) + scaleX(128.725)}
          cy={scaleY(357.97) + scaleY(128.725)}
          r={scaleR(257.44921875 / 2)}
          colors={colors[theme].gradient}
        />

        {/* Ellipsis 4 
        width: 144.8009033203125;
        height: 144.8009033203125;
        top: 486.7px;
        left: -44.33px;
        */}
        <Circle
          cx={scaleX(-44.33) + scaleX(72.4)}
          cy={scaleY(486.7) + scaleY(72.4)}
          r={scaleR(144.8009033203125 / 2)}
          color={colors[theme].ellipsis4}
        >
          {/* <BlurMask blur={50} style="normal" /> */}
        </Circle>
      </Group>
      <BlurMask blur={50} style="normal" />
    </Canvas>
  );
}
