import React, { useEffect } from "react";
import { useWindowDimensions, View, Platform } from "react-native";
import {
  Canvas,
  Circle,
  Group,
  vec,
  BlurMask,
  LinearGradient,
} from "@shopify/react-native-skia";

// Colors for dark theme
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

// Figma values for scaling
const BASE_WIDTH = 1194;
const BASE_HEIGHT = 834;

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
    </Circle>
  );
};

export default function Background() {
  const { width, height } = useWindowDimensions(); // Get screen size dynamically

  // Scale function for responsive design
  const scaleR = (value: number) => value * (width ** 2 / BASE_WIDTH ** 2);
  const scaleX = (value: number) => (value / BASE_WIDTH) * width;
  const scaleY = (value: number) => (value / BASE_HEIGHT) * height;

  const theme = "dark" as const;

  // Apply a global reset for the web to remove body and html padding/margin
  useEffect(() => {
    if (Platform.OS === "web") {
      const body = document.body;
      const html = document.documentElement;
      body.style.margin = "0";
      html.style.margin = "0";
      body.style.padding = "0";
      html.style.padding = "0";
      html.style.height = "100%";
      body.style.height = "100%";
    }
  }, []);

  // Ensure Canvas only renders in native environments, not in the web
  if (Platform.OS === "web") {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors[theme].background,
          margin: 0, // Remove default margin for web
          padding: 0, // Remove default padding for web
        }}
      />
    );
  }

  return (
    <Canvas
      style={{
        flex: 1, // Ensure full height and width without any gaps
        backgroundColor: colors[theme].background,
        position: "absolute",
        top: 0, // Remove any default margin/padding
        left: 0,
      }}
    >
      <Group>
        {/* Ellipsis 1 */}
        <Circle
          cx={scaleX(336.78) + scaleX(100)} // Center X
          cy={scaleY(764) + scaleY(100)} // Center Y
          r={scaleR(257.44921875 / 2)} // Radius
          color={colors[theme].ellipsis1} // Replace with your color
        />
        {/* Ellipsis 2 */}
        <Circle
          cx={scaleX(1153.14) + scaleX(31.495)}
          cy={scaleY(406.74) + scaleY(31.495)}
          r={scaleR(62.99384689331055 / 2)}
          color={colors[theme].ellipsis2}
        />
        {/* Ellipsis 3 */}
        <Circle
          cx={scaleX(1069.41) + scaleX(51.72)}
          cy={scaleY(334.8) + scaleY(51.72)}
          r={scaleR(103.43777465820312 / 2)}
          color={colors[theme].ellipsis3}
        />
        {/* Ellipsis 5 */}
        <GradientCircle
          cx={scaleX(-142.45) + scaleX(128.725)}
          cy={scaleY(357.97) + scaleY(128.725)}
          r={scaleR(257.44921875 / 2)}
          colors={colors[theme].gradient}
        />
        {/* Ellipsis 4 */}
        <Circle
          cx={scaleX(-44.33) + scaleX(72.4)}
          cy={scaleY(486.7) + scaleY(72.4)}
          r={scaleR(144.8009033203125 / 2)}
          color={colors[theme].ellipsis4}
        />
      </Group>
      <BlurMask blur={50} style="normal" />
    </Canvas>
  );
}