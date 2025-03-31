import { nanoid } from 'nanoid/non-secure'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createStore } from '@xstate/store';

export type Log = {
  type: "connectionLost" | "connectionRecovered";
  connectionType: "LAN" | "WIFI";
  date: Date;
};

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
  messages: Message[],
  logs: Log[],
}

const initialState: State = {
  blinkingStartTime: null,
  blinkLength: null,
  events: [],
  screenWifiConfig: [],
  messages: [],
  logs: [],
}

export const eventConfigStore = createStore({
  context: initialState,
  on: {
    addLog: (context, { log }: { log: Log }) => {
      return {
        logs: [log, ...context.logs]
      }
    },
    setBlinkLength: (context, { blinkLength }: Pick<State, 'blinkLength'>) => {
      return {
        blinkLength
      }
    },
    setBlinkingStartTime: (context, { blinkingStartTime }: Pick<State, 'blinkingStartTime'>) => {
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
    changeMessageOrder: (context, { fromIndex, toIndex }: { fromIndex: number, toIndex: number }) => {
      const messages = context.messages
      if (fromIndex < 0 || fromIndex >= messages.length || toIndex < 0 || toIndex >= messages.length) {
        return { messages }
      }

      const message = messages[fromIndex];
      const newMessages = messages.slice();
      newMessages.splice(fromIndex, 1);
      newMessages.splice(toIndex, 0, message);

      return {
        messages: newMessages
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
      return {
        events: [...context.events, {
          id: id,
          startedAt: null,
          ...event
        }]
      }
    },
    updateEvent: (context, { eventId, event }: { eventId: string, event: Omit<Event, 'startedAt' | 'id'> }) => {
      const index = context.events.findIndex(event => event.id === eventId)
      if (index === -1) return context
      return {
        events: [
          ...context.events.slice(0, index),
          {
            ...context.events[index],
            ...event,
          },
          ...context.events.slice(index + 1)
        ]
      }
    },
    changeEventOrder: (context, { fromIndex, toIndex }: { fromIndex: number, toIndex: number }) => {
      const events = context.events
      if (fromIndex < 0 || fromIndex >= events.length || toIndex < 0 || toIndex >= events.length) {
        return { events }
      }

      const event = events[fromIndex];
      const newEvents = events.slice();
      newEvents.splice(fromIndex, 1);
      newEvents.splice(toIndex, 0, event);

      return {
        events: newEvents
      }
    },
    setEventStartedAt: (context, { eventId }: { eventId: string }) => {
      const index = context.events.findIndex(event => event.id === eventId)
      if (index === -1) return context
      return {
        events: [
          ...context.events.slice(0, index),
          {
            ...context.events[index],
            startedAt: new Date(),
          },
          ...context.events.slice(index + 1)
        ]
      }
    },
    resetStartedAt: (context) => ({
      events: context.events.map(event => {
        return {
          ...event,
          startedAt: null
        }
      })
    }),
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
    const parsedSnapshot = (() => {
      const parsed = JSON.parse(snapshot ?? 'null')

      return {
        ...parsed,
        events: parsed.events.map((event: any) => {
          return {
            ...event,
            startedAt: event.startedAt ? new Date(event.startedAt) : null
            // startedAt: null
          }
        }),
        logs: [],
      }
    })() as State | null
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
