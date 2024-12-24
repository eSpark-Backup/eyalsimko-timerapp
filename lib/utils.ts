import { clsx, type ClassValue } from 'clsx';
import { ComponentProps } from 'react';
import { TimerPickerModal } from 'react-native-timer-picker';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Duration = Parameters<
  ComponentProps<typeof TimerPickerModal>["onConfirm"]
>[0];

export const getDurationObject = (duration: number): Duration => {
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration - hours * 3600) / 60);
  const seconds = duration - hours * 3600 - minutes * 60;

  return {
    hours,
    minutes,
    seconds,
  }
}

export const formatDuration = (duration: number) => {
  const timeParts = [];
  const {
    hours, minutes, seconds
  } = getDurationObject(duration)

  if (hours !== undefined) {
    timeParts.push(hours.toString().padStart(2, "0"));
  }
  if (minutes !== undefined) {
    timeParts.push(minutes.toString().padStart(2, "0"));
  }
  if (seconds !== undefined) {
    timeParts.push(seconds.toString().padStart(2, "0"));
  }

  return timeParts.join(":");
};
