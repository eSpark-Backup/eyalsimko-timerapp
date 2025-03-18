type Message = {
  id: string,
  content: string,
}

type Event = {
  id: string
  name: string
  blinkingStartTime: number | null
  countDownTime: number | null
}

type WiFiConfig = {
  ssid: string,
  password: string
}

type State = {
  blinkingStartTime: number | null
  blinkLength: number | null
  events: Event[]
  screenWifiConfig: WiFiConfig[],
  messages: Message[]
}

import AsyncStorage from '@react-native-async-storage/async-storage'
import { createStore } from '@xstate/store';
import { connectionActor } from './connectionStore'

const initialState: State = {
  blinkingStartTime: null,
  blinkLength: null,
  events: [],
  screenWifiConfig: [],
  messages: [],
}

const generateId = () => Math.random().toString(36)

export const eventConfigStore = createStore({
  context: initialState,
  on: {
    setBlinkLength: (context, { blinkLength }: Pick<State, 'blinkLength'>) => {
      if (blinkLength)
        connectionActor.send({ type: "sendMessage", message: { type: "blink_length", data: blinkLength } })

      return {
        blinkLength
      }
    },
    setBlinkingStartTime: (context, { blinkingStartTime }: Pick<State, 'blinkingStartTime'>) => {
      if (blinkingStartTime)
        connectionActor.send({ type: "sendMessage", message: { type: "blink_length", data: blinkingStartTime } })

      return {
        blinkingStartTime
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
    addMessage: (context) => {
      return {
        messages: [...context.messages, {
          id: generateId(),
          content: '',
        }]
      }
    },
    removeMessage: (context, { message }: { message: Message }) => {
      return {
        messages: context.messages.filter(msg => msg.id !== message.id)
      }
    },
    editMessage: (context, { updatedMessage }: { updatedMessage: Message }) => {
      const index = context.messages.findIndex(message => message.id === updatedMessage.id)
      if (index === -1) return context
      return {
        messages: [
          ...context.messages.slice(0, index),
          updatedMessage,
          ...context.messages.slice(index + 1)
        ]
      }
    },
    addEvent: (context, event: Event) => {
      return {
        events: [...context.events, event]
      }
    },
    updateEvent: (context, event: Event) => {
      const index = context.events.findIndex(event => event.id === event.id)
      if (index === -1) return context
      return {
        events: [
          ...context.events.slice(0, index),
          event,
          ...context.events.slice(index + 1)
        ]
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
