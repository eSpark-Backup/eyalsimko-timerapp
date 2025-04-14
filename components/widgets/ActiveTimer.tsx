import React, { useRef, useState } from "react";
import { View, Platform, StyleSheet, Text as RNText } from "react-native";
import { Text } from "~/components/ui/text";
import { useSelector as useMachineSelector } from "@xstate/react";
import { CompanyLogo } from "~/lib/icons/CompanyLogo";
import { TimerContext } from "~/lib/store/timer";
import { useSelector } from "@xstate/store/react";
import { eventConfigStore } from "~/lib/store/eventConfig";
import { cn, formatCountdown } from "~/lib/utils";
import {
  Canvas,
  Mask,
  RoundedRect,
  LinearGradient as SkiaLinearGradient,
  vec,
} from "@shopify/react-native-skia";

// Gradient Progress Bar
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

  // Web version
  if (Platform.OS === "web") {
    return (
      <div
        style={{
          width,
          height,
          background: `linear-gradient(90deg, hsla(349, 86%, 61%, 1) ${progress * 100}%, hsla(213, 100%, 61%, 1) 0%)`,
          borderRadius: radius,
          opacity: 0.4,
        }}
      />
    );
  }

  // Mobile version with Skia
  return (
    <Canvas style={{ flex: 1 }}>
      <RoundedRect
        x={0}
        y={0}
        width={width}
        height={height}
        r={radius}
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
          <RoundedRect
            x={0}
            y={0}
            width={width}
            height={height}
            r={radius}
          />
        }
      >
        <RoundedRect
          x={0}
          y={0}
          width={width * progress}
          height={height}
          r={radius}
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

// ProgressBar component to show the progress
const ProgressBar = ({
  countdownTime,
  elapsedTime,
}: {
  countdownTime: number;
  elapsedTime: number;
}) => {
  const containerRef = useRef<View>(null);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);

  if (elapsedTime < 0) {
    return <View style={styles.progressBarOutOfTime} />;
  }

  return (
    <View
      style={styles.progressBar}
      onLayout={(event) => {
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
};

// Main ActiveTimerWidget component
export const ActiveTimerWidget = () => {
  const actorRef = TimerContext.useActorRef();
  const timer = useMachineSelector(actorRef, (state) => state.context.timer);
  const event = useSelector(eventConfigStore, (state) =>
    state.context.events.find((e) => e.id === timer?.eventId)
  );

  if (!timer || !event) return null;

  const isOutOfTime = timer.elapsed !== undefined && timer.elapsed < 0;
  const elapsedMs = timer.elapsedInMs ?? timer.countdownTime * 1000;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <CompanyLogo height={20} width={89} strokeWidth={0} />
        <Text style={styles.speakerName}>{event.speakerName}</Text>
      </View>

      <View style={styles.timerContainer}>
        <RNText
          style={[
            styles.timerText,
            isOutOfTime ? styles.timerOutOfTime : styles.timerNormal,
          ]}
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
        elapsedTime={elapsedMs}
      />
    </View>
  );
};

// Styles to match your original design
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  speakerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  timerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  timerText: {
    fontSize: 64,
    fontFamily: "Cousine",
    fontWeight: "500",
  },
  timerOutOfTime: {
    color: "#FF6B6B", // Out-of-time color (red-ish)
  },
  timerNormal: {
    color: "#FFFFFF", // Normal color (white)
  },
  eventDescription: {
    position: "absolute",
    bottom: 40,
  },
  eventDescriptionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "lightgray",
  },
  progressBar: {
    height: 12,
    borderRadius: 9999,
    overflow: "hidden",
    marginHorizontal: 16,
    marginBottom: 16,
  },
  progressBarOutOfTime: {
    height: 12,
    borderRadius: 9999,
    backgroundColor: "gray", // gray color for out-of-time state
    marginHorizontal: 16,
    marginBottom: 16,
  },
});
