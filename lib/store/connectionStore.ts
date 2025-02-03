import { assign, createActor, fromCallback, fromPromise, setup } from 'xstate';

const wsConfigs = [
  { url: "ws://192.168.0.109:8081", type: "LAN" },
  { url: "ws://192.168.0.109:8080", type: "WIFI" },
] as const

type Config = typeof wsConfigs[number]

type NonConnectedState = { ws: null, type: null, messageQueue: WsMessage[] }
type ConnectedState = { ws: WebSocket, type: Config["type"], messageQueue: [] }

type WsMessage = {
  type: "shutdown", // done
} | {
  type: "blink", // done
  data: number,
} | {
  type: "start", // done
} | {
  type: "pause", // done
} | {
  type: "resume", // done
} | {
  type: "stop", // done
} | {
  type: "reset", // done
  data: number,
} | {
  type: "msg", // done
  data: string,
} | {
  type: "hide", // done
} | {
  // TBD: do we need to send default zero blink length message?
  type: "blink_length", // done
  data: number,
} | {
  // TBD: used for default blink start time. Is it really needed as blink event gonna be sent anyway?
  type: "blink_start",
  data: number,
}

const queueableMessageTypes = ["blink_length"]

type State = NonConnectedState | ConnectedState
type Events =
  | { type: 'initialize' }
  | { type: 'reconnect' }
  | { type: 'connected' }
  | { type: 'failed' }
  | { type: 'disconnect' }
  | { type: 'connectionLost' }
  | { type: 'retry' }
  | { type: 'sendMessage', message: WsMessage | WsMessage[] }

const getConnection = (config: Config): Promise<ConnectedState> => {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(config.url);

    ws.onerror = reject

    const onOpen = () => {
      ws.send("init")
    }

    ws.onopen = onOpen

    const timeout = setTimeout(() => {
      ws.close()
      reject(new Error("Have not recienved hello message"))
    }, 1000)

    const onHelloMessage = ({ data }: { data: unknown }) => {
      if (data === "hello") {
        clearTimeout(timeout)
        ws.removeEventListener('open', onOpen)
        ws.removeEventListener('message', onHelloMessage)
        resolve({
          ws,
          type: config.type,
        })
      }
    }

    ws.onmessage = onHelloMessage
  })
}

const sendMessageOverWs = (ws: WebSocket, message: WsMessage) => {
  const serializedMessage = "data" in message ? `${message.type}:${message.data}` : message.type
  ws.send(serializedMessage)
}

const connectionStore = setup({
  types: {
    context: {} as State,
    events: {} as Events,
  },
  actors: {
    subscribeConnection: fromCallback(({ input, sendBack }: { input: WebSocket, sendBack: (event: Events) => void }) => {
      return input.addEventListener('close', () => {
        sendBack({ type: 'connectionLost' })
      })
    }),
    initialize: fromCallback(({ sendBack }) => {
      sendBack({ type: 'initialize' })
    }),
    connect: fromPromise(() => getConnection(wsConfigs[0]).catch(() => getConnection(wsConfigs[1]))),
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QGMD2A7dZkBcCWGAdAJIAiAMgKIDEe6e+AhgDZ4BeYA2gAwC6ioAA6pYDAugEgAHogCssgByEAzLICMANgBMahbI2KA7IYA0IAJ6IALN1mFuD7mq2HlTw1oUBfL2bSZsfCIAYQB5ADlwymCAFWJwgHFqCAwwQjoAN1QAazT-LFxxQjDI6LjEhEzUZEYg9B5eBslhUTrJGQQAWjU3QitDeUUtWS1uPWUNM0sEWW5lPo0FZwUFQwBONbU1jR8-DAK64oio2PiksAAnC9QLwkFmWoAzG4BbQnzAopKT8oTK9CyNTqDSaSBALTEGHaiDUsK0fVUVjWxnUqy0U0QnXUhAUyIMahGGgGVjUVh2vhAH0KIWOZTO1CpOEgoKEIkhEjBHQ03DW9jWqm0Sw0Gk26IsiFG8K0SORaxlujl5L2AWp6COpVOiWoj0YeGYzL4zTZbU5iD0vMWAx6-LU3A0yjWGIQykM3D6mgMVmUowUw0Mu0p+0+NI1MUopGSeFgjJZ4ON4mhCFJakII0MBjt3GGJOcTuGdm4hj0rhcS02mgDjK+tNi4eosDA6AgAFk4LBGDBYxCTaAOmp04Qix4Bi7lBN+wond1lCmXB4icoFA67ZWg6r1T861WMOQRDgu-GoaaECSrIQRboPWNlF6b07tIRpeMtA6x9LhUrAyrDqRiABlb4yjrOgxBYdguENMFuwTY95CUVRNB0PQDFWUxxWdF97EcNxZkWKxvApbc1UoAAlEjQhI6gLjAHALnMA9Whg3szQcQcPEvdQrC9WQrDzRcVA0W0xi0OUrE8NYfApdBUAgOBJCIo1GKPZiugnPoBjg4YfVkCYpyQtiPCXNNZGRRRV2-IoyCoRT2UTF87AUOZuH6NYeP7HjePQmwz19Fwxg0LiTKWcyDmrUMzhsntpEQRY3SsEzdCLXEuNWJ1FxTWYHAJfDSSWWR-UItdDkA2tSEipjopPMVpjWeFViRQxSRnODvRC4M1V-ACazDMqoMPDkVMXKVYQcG9FAmO1JnQ715hlDZ9BveL+za9dSPIkjyuUyrkSlLQ9ttGwMwdJ13MIftGs2G9atGKxJK8IA */
  id: 'connection',
  initial: 'IDLE',
  context: {
    ws: null,
    type: null,
    messageQueue: [],
  },
  on: {
    sendMessage: {
      guard: ({ event }) => {
        const messages = Array.isArray(event.message) ? event.message : [event.message]
        return messages.every(message => queueableMessageTypes.includes(message.type))
      },
      actions: assign(({ event, context }) => {
        const prevMessages = context.messageQueue
        const newMessages = Array.isArray(event.message) ? event.message : [event.message]
        return {
          messageQueue: [
            ...prevMessages.filter(message => !newMessages.map(message => message.type).includes(message.type)),
            ...newMessages,
          ]
        }
      })
    }
  },
  states: {
    IDLE: {
      invoke: {
        src: 'initialize'
      },
      on: {
        initialize: 'CONNECTING'
      }
    },
    CONNECTING: {
      invoke: {
        src: 'connect',
        onDone: {
          target: 'CONNECTED',
          actions: assign(({ context, system, event }) => {
            context.messageQueue.forEach(message => sendMessageOverWs(event.output.ws, message))
            return {
              ws: event.output.ws,
              type: event.output.type,
              messageQueue: []
            } as const
          })
        },
        input: {
          url: 'ws://192.168.0.112:8080',
        },
        onError: {
          target: 'ERROR',
        }
      },
      on: {
        connected: 'CONNECTED',
        failed: 'ERROR',
      },
    },
    CONNECTED: {
      invoke: {
        src: 'subscribeConnection',
        input: ({ context }) => context.ws as WebSocket,
      },
      exit: assign(({ context }) => ({
        ws: null,
        type: null,
      })),
      on: {
        disconnect: {
          target: 'DISCONNECTED',
          actions: ({ context }) => {
            context.ws?.send("disconnect")
            context.ws?.close()
          },
        },
        sendMessage: {
          actions: ({ event, context }) => {
            const connectedContext = context as ConnectedState
            const sendMessage = (message: WsMessage) => sendMessageOverWs(connectedContext.ws, message)
            if (Array.isArray(event.message)) event.message.forEach(sendMessage)
            else sendMessage(event.message)
          },
        },
        connectionLost: {
          target: 'ERROR',
        }
      }
    },
    DISCONNECTED: {
      on: {
        reconnect: 'CONNECTING',
      }
    },
    ERROR: {
      on: {
        retry: 'CONNECTING',
      }
    },
  }
})

export const connectionActor = createActor(connectionStore)
connectionActor.start()
