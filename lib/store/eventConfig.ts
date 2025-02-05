type Speaker = {
  name: string | null
  blinkingStartTime: number | null
  countDownTime: number | null
}

type WiFiConfig = {
  ssid: string,
  password: string
}

type State = {
  eventName: string | null
  eventDescription: string | null
  defaultBlinkingStartTime: number | null
  blinkLength: number | null
  speakers: Speaker[]
  screenWifiConfig: WiFiConfig[]
}

import AsyncStorage from '@react-native-async-storage/async-storage'
import { useSelector } from '@xstate/react'
import { createStore } from '@xstate/store';
import { useEffect } from 'react'
import { connectionActor } from './connectionStore'

const initialState: State = {
  eventName: null,
  eventDescription: null,
  defaultBlinkingStartTime: null,
  blinkLength: null,
  speakers: [],
  screenWifiConfig: [],
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
    setBlinkLength: (context, { blinkLength }: Pick<State, 'blinkLength'>) => {
      if (blinkLength)
        connectionActor.send({ type: "sendMessage", message: { type: "blink_length", data: blinkLength } })

      return {
        blinkLength
      }
    },
    addWifiConfig: (context, { ssid, password }: WiFiConfig) => {
      const existedConfigs = context.screenWifiConfig.find(config => config.ssid === ssid)
      if (existedConfigs && existedConfigs.password === password) return context
      return {
        screenWifiConfig: [
          ...context.screenWifiConfig.filter(config => config.ssid !== ssid),
          { ssid, password }
        ]
      }
    },
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
    },
    initialize: (context, state: State) => {
      return state
    },
    reset: (context) => {
      return {
        ...initialState,
        screenWifiConfig: context.screenWifiConfig
      }
    }
  }
});

const snapshotKey = 'configSnapshot-v1'

AsyncStorage.getItem(snapshotKey)
  .then(snapshot => {
    const parsedSnapshot = JSON.parse(snapshot ?? 'null') as State | null
    if (parsedSnapshot) {
      eventConfigStore.send({
        type: 'initialize',
        ...parsedSnapshot
      })
    }
  })

eventConfigStore.subscribe(snapshot => {
  AsyncStorage.setItem(snapshotKey, JSON.stringify(snapshot.context))
})

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
