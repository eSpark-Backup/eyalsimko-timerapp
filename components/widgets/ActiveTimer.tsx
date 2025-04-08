import React, { useRef, useState } from "react";
import { View, Platform, StyleSheet, Text as RNText } from "react-native";
import { Text } from "~/components/ui/text";
import { useSelector as useMachineSelector } from "@xstate/react";
import { CompanyLogo } from "~/lib/icons/CompanyLogo";
import { TimerContext } from "~/lib/store/timer";
import { useSelector } from "@xstate/store/react";
import { eventConfigStore } from "~/lib/store/eventConfig";
import { connectionActor } from "~/lib/store/connectionStore";
import { cn, formatCountdown } from "~/lib/utils";
import {
  Canvas,
  Mask,
  RoundedRect,
  LinearGradient as SkiaLinearGradient,
  vec,
} from "@shopify/react-native-skia";

// Component for the GradientProgressBar
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

  // Check if the platform is web
  if (Platform.OS === "web") {
    return (
      <div
        style={{
          width: width,
          height: height,
          background: `linear-gradient(90deg, hsla(349, 86%, 61%, 1) ${progress * 100}%, hsla(213, 100%, 61%, 1) 0%)`,
          borderRadius: radius,
          opacity: 0.4,
        }}
      />
    );
  }

  // Skia version for mobile
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
        mask={<RoundedRect x={0} y={0} width={width} height={height} r={radius} />}
      >
        <RoundedRect x={0} y={0} width={width * progress} height={height} r={height / 2}>
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

// ProgressBar Component
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
    return <View style={styles.progressBarOutOfTime}></View>;
  } else {
    return (
      <View
        style={styles.progressBar}
        onLayout={(event) => {
          event.nativeEvent.layout.width && setContainerWidth(event.nativeEvent.layout.width);
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

// ActiveTimerWidget Component
export const ActiveTimerWidget = () => {
  const actorRef = TimerContext.useActorRef();
  const timer = useMachineSelector(actorRef, (state) => state.context.timer);
  const event = useSelector(eventConfigStore, (state) =>
    state.context.events.find((event) => event.id === timer?.eventId)
  );

  if (!timer || !event) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <CompanyLogo height={20} width={89} strokeWidth={0} />
        <Text style={styles.speakerName}>{event.speakerName}</Text>
      </View>
      <View style={styles.timerContainer}>
        <RNText
          style={cn(
            "text-8xl font-cousine font-medium",
            timer.elapsed && timer.elapsed < 0 && "text-countdown-out-of-time",
            !timer.elapsed || (timer.elapsed >= 0 && "text-primary")
          )}
        >
          {formatCountdown({
            elapsedTime: timer.elapsed ?? timer.countdownTime,
            countdownTime: timer.countdownTime,
          })}
        </RNText>
        <View style={styles.eventDescription}>
          <Text style={styles.eventDescriptionText}>{event.description}</Text>
        </View>
      </View>
      <ProgressBar
        countdownTime={timer.countdownTime * 1000}
        elapsedTime={timer.elapsedInMs ?? timer.countdownTime * 1000}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  speakerName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  timerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventDescription: {
    position: 'absolute',
    bottom: 40,
  },
  eventDescriptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'lightgray',
  },
  progressBar: {
    height: 12,
    borderRadius: 9999,
  },
  progressBarOutOfTime: {
    height: 12,
    borderRadius: 9999,
    backgroundColor: 'gray',
  },
});

export default ActiveTimerWidget;