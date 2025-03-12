import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { CompanyLogo } from "~/lib/icons/CompanyLogo";
import {
  Canvas,
  Mask,
  RoundedRect,
  LinearGradient as SkiaLinearGradient,
  vec,
} from "@shopify/react-native-skia";
import { useEffect, useRef, useState } from "react";
import { cn, formatCountdown } from "~/lib/utils";

/*
position: absolute;
width: 197px;
height: 80px;
left: calc(50% - 197px/2);
top: calc(50% - 80px/2 - 9.66px);

font-family: 'Poppins';
font-style: normal;
font-weight: 500;
font-size: 80px;
line-height: 80px;
text-align: center;

color: #FFFFFF;


*/

const GradientProgressBar = ({
  width,
  height,
  progress,
}: {
  width: number;
  height: number;
  progress: number;
}) => {
  const radius = height / 2;
  return (
    <Canvas style={{ flex: 1 }}>
      <RoundedRect
        x={0}
        y={0}
        width={width}
        height={height}
        r={height / 2}
        opacity={0.4}
      >
        <SkiaLinearGradient
          start={vec(0, 0)}
          end={vec(width, 0)}
          colors={[
            "hsla(349, 86%, 61%, 1)",
            "hsla(213, 100%, 61%, 1)",
            "hsla(213, 100%, 61%, 1)",
          ]}
          positions={[0, 0.358, 1]}
        />
      </RoundedRect>
      <Mask
        mask={
          <RoundedRect x={0} y={0} width={width} height={height} r={radius} />
        }
      >
        <RoundedRect
          x={0}
          y={0}
          width={width * progress}
          height={height}
          r={height / 2}
        >
          <SkiaLinearGradient
            start={vec(0, 0)}
            end={vec(width, 0)}
            colors={[
              "hsla(349, 86%, 61%, 1)",
              "hsla(213, 100%, 61%, 1)",
              "hsla(213, 100%, 61%, 1)",
            ]}
            positions={[0, 0.358, 1]}
          />
        </RoundedRect>
      </Mask>
    </Canvas>
  );
};

function ProgressBar({
  countdownTime,
  elapsedTime,
}: {
  countdownTime: number;
  elapsedTime: number;
}) {
  const containerRef = useRef<View>(null);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);

  if (elapsedTime < 0) {
    return <View className="h-[12] rounded-full bg-timer-out-of-time"></View>;
  } else {
    return (
      <View
        className="h-[12] rounded-full"
        onLayout={(event) => {
          event.nativeEvent.layout.width &&
            setContainerWidth(event.nativeEvent.layout.width);
        }}
        ref={containerRef}
      >
        {containerWidth && (
          <GradientProgressBar
            progress={elapsedTime / countdownTime}
            height={12}
            width={containerWidth}
          />
        )}
      </View>
    );
  }
}

export const ActiveTimerWidget = () => {
  const timer = {
    speakerName: "David",
    countdownTime: 1000,
    elapsedTime: 1000,
    timerName: "Goals of the evening",
  };

  if (!timer) return null;

  return (
    <View className="flex-col flex-1 justify-between">
      <View className="flex-row justify-between">
        <CompanyLogo
          viewBox="0 0 95 20"
          height={20}
          width={94.7}
          strokeWidth={0}
        />
        <Text className="text-lg font-semibold text-main-light">
          {timer.speakerName}
        </Text>
      </View>
      <View className="flex-1 items-center justify-center">
        <Text
          // style={{ fontFamily: "Poppins" }}
          className={cn(
            "text-8xl font-poppins font-medium",
            timer.elapsedTime < 0 && "text-countdown-out-of-time",
            timer.elapsedTime >= 0 && "text-primary"
          )}
        >
          {formatCountdown({
            elapsedTime: timer.elapsedTime,
            countdownTime: timer.countdownTime,
          })}
        </Text>
        <View className="absolute bottom-[40]">
          <Text className="text-lg font-semibold text-main-light">
            {timer.timerName}
          </Text>
        </View>
      </View>
      <ProgressBar
        countdownTime={timer.countdownTime}
        elapsedTime={timer.elapsedTime}
      />
    </View>
  );
};
