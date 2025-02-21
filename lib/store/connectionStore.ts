import { assign, createActor, fromCallback, fromPromise, setup } from 'xstate';
import NetInfo from '@react-native-community/netinfo';
import Toast from 'react-native-toast-message';
import { Alert, AppState } from "react-native";
import { sendUpdate } from "../timerModuleFirmware";

const wsConfigs = [
  { url: "ws://192.168.0.1:8001/ws", type: "LAN" },
  { url: "ws://192.168.4.1:8001/ws", type: "WIFI" },
] as const

// const wsConfigs = [
//   { url: "ws://192.168.0.112:8000/ws", type: "LAN" },
//   { url: "ws://192.168.0.112:8001/ws", type: "WIFI" },
// ] as const

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
      const ws = new WebSocket(config.url);

      const onOpen = () => {
        // send reset and stop to set screen to blank state
        const initMessages = [{ type: "init" }, { type: "reset", data: 0 }, { type: "stop" }] as const
        initMessages.forEach(message => sendMessageOverWs(ws, message))
      }

      ws.onopen = onOpen

      const timeout = setTimeout(() => {
        ws.close()
        reject(new Error("Have not recienved hello message"))
      }, 1000)

      ws.onerror = (err: Event) => {
        clearTimeout(timeout)
        const errWithCorrectType = err as unknown as WebSocketErrorEvent
        reject(err)
      }

      const onHelloMessage = ({ data }: { data: unknown }) => {
        if (data === "hello") {
          clearTimeout(timeout)
          ws.removeEventListener('open', onOpen)
          ws.removeEventListener('message', onHelloMessage)
          resolve({
            ws,
            type: config.type,
            messageQueue: []
          })
        }
      }

      ws.onmessage = onHelloMessage
    } catch (e) {
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
      return input.addEventListener('close', (e) => {
        if (e.code === 1001)
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
    }),
    updateFirmware: fromPromise(({ input }: { input: WebSocket }) => sendUpdate(input)),
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QGMD2A7dZkBcCWGAxLGOhALJywCGMA2gAwC6ioADqrHvhqyAB6IAjAFYGADgB0ooQxHixQgEwBmJSIA0IAJ6IAtAHYALAckBOCwDYl4gzbMGHAXyda0mbD3SSAkgBEAGQBRQjx0bjxqABs8AC8wRhYkEA4uLz5BBD0VSyFJAxUjMwlLMxEhS1zNHURrS0klMyN5BgYlJRlLFzcMLFwCbwBhAHkAOVGgwYAVH1GAcUIIDDBJMIA3VABrFfc+r0kR8cmZ+YR11GRqL0TEvlSI3mTMvSMjJUlxHPa5ByUDO2qugQahUkgYojMsgURiEKk+3RAu08AwOYwm01mCzAACdsahsZI2FErgAzfEAW0kSP6GFRRwxp3Ol2uzFuyXu6SewhUckkhSE-x51iE4jMKi0QL0NhEkiMlgMolKIkqKnkCOp+0O6JOCw1kDZ7E4D3QGX06hlIgVBlKCjFopFEuEYkkIka4iM4gYHpFHpE6t6yNpWuOmMIJOoeCi+uYdyNnNAmXEqnMbSTctdrSEjoQb1M6nEsMVhSUliM-o8NKGaOOQT8hAArmwIFcwAAxPDY8kAd2o2ISMfZcYGpqyeQU8oVbTlQgcDpqo5UY5LShMpQMDBUZXLexRwemtcWeFgGoNKSHjwTiB5UiTBaMqpERXEllV2YUfOK8iKsJMZnl28DKt6SmA8SDIShYBoegB0NNJhy5YFSkkUoHwYSxPnlMwlGzbJSw+OV-hsWEDFsSw-VcREA0rOltQPDUBgCTgcFPDl4MvBARBEMwwTaOQUILcQFBwhVQUhIRxLFBgClLLoKPooNq33PxJAAVQABT8ABBECAH1Wx8AAlcgAHVNIMkIliwVZ0A2bYqSozVFJA5T1K03T9KM0zzLOGyLiuAYbhgs84IvAR9HXKQmlnUolDkeQs3nKVN3MUoZ1sBhISfJQAOovwfAAZT3ZzCD7E8gtY0LnkKWVijeGFckzEjszleocjMZ9LQLFQvhy-YggMgzhgMxZlms2ydgclF+sGgyfI2ZkAtZcrzxNBChCKd5uoqWQFXQjojBw+QP1UdaJDQ3IV16qaBqGwgcTxAkiVJCl7IrPqbtmpl-IwQKklg40R3E-5pHaddrX+STAX0MR3lEd13XKJo5CEK7aWm26+xwbFtBYlaRwsUF5QRvaTFdMxmvySEYefZoTHNFwKPQVAIDgPh5NW-74zCrIDGVcwil2rC4oLHDPTyMVac9P9jEE1HvH8YJYxCjnub0TjuJEuEKksL1OPFecv2QnIBUXEUFQ6OWaJDeYlYBhCpRscxpc4pMgbFbNOr5UiBXBXIHBUS2itrW2ueeOppFeeUbEaYUDsS148maZRbBFDdjBRuTJoU4Da0kAyVPGTEQ7Y1XmlMcd-lkFc-YMHCbAYcxyj+EULDFGxZJ6N7dyc3PXO0oI9MMkyzKCYvKv0IoZUKT5SLI3nyhwiojAaBVRTkT0TALQOe5cjT+8H0YCoACWDwdlZHNWSIjgjo7-fbmplRwyIcMidaKdCy0zrvaTywqd7HlWYcSzmEcK6TcBQRDdWwvOU2+RuqNT+I+aw5FO47jRh9ABgM0JSDhG0Xm5pHwFGEutWUhRlQVHaq0D0DMnBAA */
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
      }
    },
    CONNECTED: {
      initial: "RUNNING",
      states: {
        RUNNING: {
        },
        UPDATE_FIRMWARE: {
          invoke: {
            src: "updateFirmware",
            input: ({ context }) => context.ws as WebSocket,
            onDone: {
              target: "#connection.DISCONNECTED",
            }
          },
          exit: assign(({ context }) => {
            context.ws?.close()
            return {
              ws: null,
              type: null,
            }
          }),
        },
      },
      invoke: {
        src: 'subscribeConnection',
        input: ({ context }) => context.ws as WebSocket,
      },
      on: {
        updateFirmware: {
          target: "CONNECTED.UPDATE_FIRMWARE",
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
