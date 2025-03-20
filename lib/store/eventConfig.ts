import { nanoid } from 'nanoid/non-secure'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createStore } from '@xstate/store';
import { connectionActor } from './connectionStore'

export type Message = {
  id: string,
  content: string,
}

export type Event = {
  id: string
  name: string
  description: string,
  speakerName: string,
  countdownTime: number
  blinkingStartTime: number
  blinkLength: number
  startedAt: Date | null
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

const initialState: State = {
  blinkingStartTime: null,
  blinkLength: null,
  events: [],
  screenWifiConfig: [],
  messages: [],
}

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
          id: nanoid(),
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
    addEvent: (context, { event }: { event: Omit<Event, 'id' | 'startedAt'> }) => {
      const id = nanoid(10)
      console.log("add event after id", id)
      return {
        events: [...context.events, {
          id: id,
          startedAt: null,
          ...event
        }]
      }
    },
    updateEvent: (context, { event }: { event: Omit<Event, 'startedAt'> }) => {
      const index = context.events.findIndex(event => event.id === event.id)
      if (index === -1) return context
      return {
        events: [
          ...context.events.slice(0, index),
          {
            startedAt: context.events[index].startedAt,
            ...event
          },
          ...context.events.slice(index + 1)
        ]
      }
    },
    deleteEvent: (context, { event: deletedEvent }: { event: Event }) => {
      return {
        events: context.events.filter(event => event.id !== deletedEvent.id)
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
