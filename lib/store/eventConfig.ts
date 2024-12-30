type Speaker = {
  name: string | null
  blinkingStartTime: number | null
  countDownTime: number | null
}

type State = {
  eventName: string | null
  eventDescription: string | null
  defaultBlinkingStartTime: number | null
  blinkLength: number | null
  speakers: Speaker[]
}

import { useSelector } from '@xstate/react'
import { createStore } from '@xstate/store';
import { useEffect } from 'react'

const initialState: State = {
  eventName: null,
  eventDescription: null,
  defaultBlinkingStartTime: null,
  blinkLength: null,
  speakers: [],
}

export const eventConfigStore = createStore({
  context: initialState,
  on: {
    setEventName: (context, { eventName, eventDescription }: Pick<State, 'eventDescription' | 'eventName'>) => ({
      eventDescription,
      eventName
    }),
    setDefaultBlinkingStartTime: (context, { defaultBlinkingStartTime }: Pick<State, 'defaultBlinkingStartTime'>) => ({
      defaultBlinkingStartTime
    }),
    setBlinkLength: (context, { blinkLength }: Pick<State, 'blinkLength'>) => ({
      blinkLength
    }),
    addSpeaker: (context) => {
      return {
        speakers: [...context.speakers, {
          name: null,
          blinkingStartTime: null,
          countDownTime: null
        }]
      }
    },
    setSpeakerName: (context, { speakerIndex, name }: { speakerIndex: number } & Pick<Speaker, 'name'>) => {
      const speakers = context.speakers.map((speaker, index) => index === speakerIndex ? {
        ...speaker,
        name,
      } : speaker);
      return {
        speakers
      }
    },
    setSpeakerContDownTime: (context, { speakerIndex, countDownTime }: { speakerIndex: number } & Pick<Speaker, 'countDownTime'>) => {
      const speakers = context.speakers.map((speaker, index) => index === speakerIndex ? {
        ...speaker,
        countDownTime,
      } : speaker);
      return {
        speakers
      }
    },
    setSpeakerBlinkingStartTime: (context, { speakerIndex, blinkingStartTime }: { speakerIndex: number } & Pick<Speaker, 'blinkingStartTime'>) => {
      const speakers = context.speakers.map((speaker, index) => index === speakerIndex ? {
        ...speaker,
        blinkingStartTime,
      } : speaker);
      return {
        speakers
      }
    }
  }
});

export const useSpeaker = (speakerIndex: number): Speaker | undefined => {
  const speaker = useSelector(
    eventConfigStore,
    (state) => state.context.speakers[speakerIndex]
  );
  useEffect(() => {
    if (!speaker) {
      eventConfigStore.send({ type: "addSpeaker" });
    }
  }, [speaker, speakerIndex]);

  return speaker
}

export const useIsLastSpeaker = (speakerIndex: number): boolean => {
  const speakers = useSelector(
    eventConfigStore,
    (state) => state.context.speakers
  );
  return speakers.length - 1 === speakerIndex;
}
