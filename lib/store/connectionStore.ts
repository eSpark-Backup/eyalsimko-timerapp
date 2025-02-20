import * as Sentry from "@sentry/react-native";
import { assign, createActor, fromCallback, fromPromise, setup } from 'xstate';
import NetInfo from '@react-native-community/netinfo';
import Toast from 'react-native-toast-message';
import { Alert, AppState } from "react-native";
import { sendUpdate } from "../timerModuleFirmware";

// const wsConfigs = [
//   { url: "ws://192.168.0.1:8001/ws", type: "LAN" },
//   { url: "ws://192.168.4.1:8001/ws", type: "WIFI" },
// ] as const

const wsConfigs = [
  { url: "ws://192.168.0.108:8000/ws", type: "LAN" },
  { url: "ws://192.168.0.108:8001/ws", type: "WIFI" },
] as const

const connectToServer = async () => {
  return getConnection(wsConfigs[0]).catch(() => getConnection(wsConfigs[1]))
}

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
} | {
  type: "disconnect",
} | {
  type: "init"
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
  | { type: 'updateFirmware' }

const getConnection = (config: Config): Promise<ConnectedState> => {
  const attemptId = Math.random().toString(36).substring(2, 15)
  return new Promise((resolve, reject) => {
    try {
      Sentry.captureMessage(`Trying to connect to ${config.url} via ${config.type}. Attempt id: ${attemptId}`, "debug")
      const ws = new WebSocket(config.url);

      const onOpen = () => {
        Sentry.captureMessage(`Connection ${attemptId}: ws.onopen call`, "debug")
        // send reset and stop to set screen to blank state
        const initMessages = [{ type: "init" }, { type: "reset", data: 0 }, { type: "stop" }] as const
        initMessages.forEach(message => sendMessageOverWs(ws, message))
      }

      ws.onopen = onOpen

      const timeout = setTimeout(() => {
        ws.close()
        Sentry.captureMessage(`Connection ${attemptId}: timed out`, "error")
        reject(new Error("Have not recienved hello message"))
      }, 1000)

      ws.onerror = (err: Event) => {
        clearTimeout(timeout)
        const errWithCorrectType = err as unknown as WebSocketErrorEvent
        Sentry.captureMessage(`Connection ${attemptId}: ws.onerror call ${errWithCorrectType.message}`, "error")
        reject(err)
      }

      const onHelloMessage = ({ data }: { data: unknown }) => {
        if (data === "hello") {
          Sentry.captureMessage(`Connection ${attemptId}: "hello" received; Connection established`, "debug")
          clearTimeout(timeout)
          ws.removeEventListener('open', onOpen)
          ws.removeEventListener('message', onHelloMessage)
          resolve({
            ws,
            type: config.type,
            messageQueue: []
          })
        } else {
          Sentry.captureMessage(`Connection ${attemptId}: ${data} received`, "debug")
        }
      }

      ws.onmessage = onHelloMessage
    } catch (e) {
      Sentry.captureMessage(`Connection ${attemptId}: exception received ${e}`, "error")
    }
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
    connect: fromPromise(connectToServer),
    tryToReconnect: fromPromise(() => {
      return new Promise((resolve, reject) => {
        AppState.addEventListener('change', (newState) => {
          if (newState === "active") {
            NetInfo.fetch().then(connection => {
              if (connection.type !== "none") {
                resolve(undefined)
              }
            })
          }
        })

        NetInfo.addEventListener((connection) => {
          if (connection.type === "none") {
            setTimeout(() => reject(), 10000)
          } else {
            resolve(undefined)
          }
        })
      })
    })
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
          actions: assign(({ context, event }) => {
            context.messageQueue.forEach(message => sendMessageOverWs(event.output.ws, message))
            if (!context.messageQueue.some(message => message.type === "blink_length")) {
              sendMessageOverWs(event.output.ws, {
                type: "blink_length",
                data: 0,
              })
            }
            return {
              ws: event.output.ws,
              type: event.output.type,
              messageQueue: []
            } as const
          })
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
      exit: assign(({ context }) => {
        if (context.ws) {
          // send stop to hide timer to prevent the bug when timer is running while screen shows QR code
          const messages = [{ type: "stop" }, { type: "disconnect" }] as const
          messages.forEach(message => sendMessageOverWs(context.ws, message))
        }
        context.ws?.send("disconnect")
        context.ws?.close()
        return {
          ws: null,
          type: null,
        }
      }),
      on: {
        updateFirmware: {
          actions: ({ context }) => {
            context.ws && sendUpdate(context.ws)
          }
        },
        disconnect: {
          target: 'DISCONNECTED',
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
          actions: () => {
            Toast.show({
              type: "error",
              text1: 'Connection lost',
              text2: 'Connection with the module has been lost.\nCheck your lan/WiFi connection or does the module is running.',
            })

          }
        }
      }
    },
    DISCONNECTED: {
      on: {
        reconnect: 'CONNECTING',
      }
    },
    ERROR: {
      invoke: {
        src: 'tryToReconnect',
        onDone: {
          target: 'CONNECTING',
        },
        onError: {
          target: 'ERROR',
          reenter: true,
        }
      },
      on: {
        retry: 'CONNECTING',
      }
    },
  }
})

export const connectionActor = createActor(connectionStore)
connectionActor.start()
