import { LinearGradient } from "expo-linear-gradient";
import { useWindowDimensions, View } from "react-native";

const gradients = {
  dark: ["hsla(224, 83%, 27%, 0)", "hsla(224, 83%, 49%, 1)"] as const,
};

// iPad Pro 11" (Landscape)
const BASE_WIDTH = 1180;
const BASE_HEIGHT = 820;

export default function Background() {
  const { width, height } = useWindowDimensions(); // Get screen size dynamically
  const scaleX = (value: number) => (value / BASE_WIDTH) * width;
  const scaleY = (value: number) => (value / BASE_HEIGHT) * height;

  const theme = "dark" as const;
  return (
    <View>
      <View
        className="z-1 absolute bg-backgroundEllipsis1"
        style={{
          borderRadius: 20000,
          top: scaleY(764),
          left: scaleX(336.78),
          height: 200,
          width: 200,
        }}
      />
      <View
        className="z-1 absolute bg-backgroundEllipsis2"
        style={{
          borderRadius: 20000,
          top: scaleY(406.74),
          left: scaleX(1153.14),
          height: 62.99,
          width: 62.99,
        }}
      />
      <View
        className="z-1 absolute bg-backgroundEllipsis3"
        style={{
          borderRadius: 20000,
          top: scaleY(334.8),
          left: scaleX(1069.41),
          height: 103.44,
          width: 103.44,
        }}
      />
      <View
        className="z-1 absolute bg-backgroundEllipsis4"
        style={{
          borderRadius: 20000,
          top: scaleY(486.7),
          left: scaleX(-44.33),
          height: 144.8,
          width: 144.8,
        }}
      />
      <View
        className="z-1 absolute"
        style={{
          top: scaleY(357.97),
          left: scaleX(-142.45),
          height: 257.45,
          width: 257.45,
        }}
      >
        <LinearGradient
          style={{ flex: 1, borderRadius: 20000 }}
          colors={gradients[theme]}
        />
      </View>
    </View>
  );
}
