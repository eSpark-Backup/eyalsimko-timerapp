import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { useSelector as useMachineSelector } from "@xstate/react";
import { CompanyLogo } from "~/lib/icons/CompanyLogo";
import {
  Canvas,
  Mask,
  RoundedRect,
  LinearGradient as SkiaLinearGradient,
  vec,
} from "@shopify/react-native-skia";
import { useRef, useState } from "react";
import { cn, formatCountdown } from "~/lib/utils";
import { TimerContext } from "~/lib/store/timer";
import { useSelector } from "@xstate/store/react";
import { eventConfigStore } from "~/lib/store/eventConfig";
import { connectionActor } from "~/lib/store/connectionStore";

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
  const actorRef = TimerContext.useActorRef();
  const timer = useMachineSelector(actorRef, (state) => state.context.timer);
  const event = useSelector(eventConfigStore, (state) =>
    state.context.events.find((event) => event.id === timer?.eventId)
  );

  if (!timer || !event) return null;

  return (
    <View className="flex-col flex-1 justify-between">
      <View className="flex-row justify-between">
        <CompanyLogo height={20} width={89} strokeWidth={0} />
        <Text className="text-lg font-semibold text-main-light">
          {event.speakerName}
        </Text>
      </View>
      <View className="flex-1 items-center justify-center">
        <Text
          className={cn(
            "text-8xl font-poppins font-medium",
            timer.elapsed && timer.elapsed < 0 && "text-countdown-out-of-time",
            !timer.elapsed || (timer.elapsed >= 0 && "text-primary")
          )}
        >
          {formatCountdown({
            elapsedTime: timer.elapsed ?? timer.countdownTime,
            countdownTime: timer.countdownTime,
          })}
        </Text>
        <View className="absolute bottom-[40]">
          <Text className="text-lg font-semibold text-main-light">
            {event.description}
          </Text>
        </View>
      </View>
      <ProgressBar
        countdownTime={timer.countdownTime * 1000}
        elapsedTime={timer.elapsedInMs ?? timer.countdownTime * 1000}
      />
    </View>
  );
};
