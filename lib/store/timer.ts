import AsyncStorage from '@react-native-async-storage/async-storage';
import { createActorContext } from '@xstate/react';
import { and, assign, fromCallback, setup } from 'xstate';
import { ConnectedState, connectionActor, RecoverMessage } from './connectionStore';
import { eventConfigStore } from './eventConfig';
import Toast from 'react-native-toast-message';
import { AppState } from 'react-native';

type RunningTimer = {
  elapsed: number,
  elapsedInMs: number,
  eventId: string,
  countdownTime: number
  blinkingStartTime: number
  blinkLength: number
}

type NonRunningTimer = Omit<RunningTimer, 'elapsed' | 'elapsedInMs'> & {
  elapsed: null,
  elapsedInMs: null,
}

type Timer = RunningTimer | NonRunningTimer

type MessageState = { messageId: string | null }

type Idle = { timer: null }
type Disconnected = { timer: null }
type Running = { timer: RunningTimer, }
type Resetted = { timer: NonRunningTimer }

type State = { timer: Timer | null, disconnectedWhileRunningEventId: null | string } & MessageState

export type SetupEvent = {
  type: "setup",
  data: {
    eventId: string
  }
}

type Events = SetupEvent | {
  type: "start"
} | {
  type: "TICK"
  diff: number
} | {
  type: "reset"
} | {
  type: "stop"
} | {
  type: "pause"
} | {
  type: "resume"
} | {
  type: "showMessage",
  data: {
    messageId: string
  },
} | {
  type: "hideMessage"
} | {
  type: "recover",
  data: RecoverMessage
} | {
  type: "disconnect"
}

export const timerStore = setup({
  types: {
    context: {} as State,
    events: {} as Events
  },
  actors: {
    ticks: fromCallback(({ sendBack }) => {
      let previoutTickTime = performance.now()
      const interval = setInterval(() => {
        const currentTickTime = performance.now()
        const diff = currentTickTime - previoutTickTime
        previoutTickTime = currentTickTime
        sendBack({ type: 'TICK', diff });
      }, 33);
      return () => clearInterval(interval);
    }),
    waitForDisconnect: fromCallback(({ sendBack }) => {
      connectionActor.subscribe(snapshot => {
        if (!snapshot.matches("CONNECTED")) {
          sendBack({ type: "disconnect" })
        }
      })
    }),
    waitForRecovery: fromCallback(({ sendBack }) => {
      console.log("RUN waitForRecovery")
      connectionActor.subscribe(snapshot => {
        if (snapshot.matches("CONNECTED")) {
          const context = connectionActor.getSnapshot().context as ConnectedState
          const disconnectedWihleRunningEventId = context.disconnectedWhileRunningEventId
          const event = eventConfigStore.getSnapshot().context.events.find(event => event.id === disconnectedWihleRunningEventId)!

          if (context.timerInit) {
            sendBack({ type: "recover", data: context.timerInit })
          }
        }
      })
    })
  },
  guards: {
    isConnected: () => {
      return connectionActor.getSnapshot().matches("CONNECTED")
    },
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QBcCWBbMAnAxFuYyA2gAwC6ioADgPaypo0B2lIAHogLQBM3AdAE4SAVgEB2YQEYBAFgAcEgQGYAbABoQATy4k+KyTO4CVKkmJkC5A4WKUBfOxrSYsfAJIARADIBRHLEIAVypSCiQQWnpGFnCOBCUBPklk624VGWFuYRIVYQ1tBAs5PmEVZVtbEm45OSyHJwxsPgBBAGEAFTcANT8A5ABZOFgAQxhQ1kiGVGZWOIlhPhkSGQsSY2EZSRIlfMQrXTWlI+4ZJUklMUkVepBnJrbOnv9kGhDyCbopmdjEAW4lEqifRbGzcEhySS7BCSIx8cFrf6bJQyFSqGQ3O6uB7dHx8WAvKhUSDPYZYYjvcKTaKzRBiFRiPhGI7naoGORlKFKOS6ORKKobARXORSDGNLEdHF8LCBJhMVBMKA4TqtADS40pn2pPwQKm4DOESjBJnBwM2UOq-FkR2FVXk3GSopcLQlPSlMrlCpwVGGgQC6uomumMVAcX+KkEUnESmyCl5ck53L4vP5FiFIsctzFzseuOlsvlitgAAsaAB3QawEZjCkBqJBmk6qpJ4xLQ3VMSXdRaRBlYomKPmFTc5ECR33F2590FnBF1AQMAVqtgf0RQPfEOIC4A3kCawiZQXEiQ7sIMRpPQiZNczJZMRj8U5vje33E-CwQKYFdU+vawzh4ViMK1i8nyYgCOaiZGLqEhbLu1gog4GZMDQ87wOEmIfHW67sFwYi6EIogwbICiiDIUKcDUSQGGcJD8icCTcPe7jeD4mFfMGOEICQnKqEx2I9GxWobtC5iLPBIhrBIvDGFCmwlNyyhSNksgwtcGaYtmkr4q8RIQIJP7CWexR0meaR8pIoiqFCFn8CI5g2keBqyMIfETm6+YKvp2FxKscL0raIGgseBQXJISaAScKI2HSkjmK5j7PgEekalhHGhrwYkbBJ4g3jJJ7VLoUF6lIay7hsakOEAA */
  id: 'timer',
  initial: 'IDLE',
  context: {
    timer: null,
    messageId: null,
    disconnectedWhileRunningEventId: null,
  },
  states: {
    IDLE: {
      invoke: {
        src: 'waitForRecovery',
      },
      on: {
        recover: {
          target: 'ACTIVE.running',
          actions: assign({
            timer: ({ event: { data }, context }) => {
              const disconnectedWhileRunningEventId = context.disconnectedWhileRunningEventId
              const event = eventConfigStore.getSnapshot().context.events.find(event => event.id === disconnectedWhileRunningEventId)!
              if (!event) {
                Toast.show({
                  type: "error",
                  text1: "Timer recovery failed",
                  text2: "There was a timer running on the Timer module, but timer recovery failed.",
                })
                return {
                  elapsed: Math.floor(data.elapsed),
                  elapsedInMs: Math.floor(data.elapsed * 1000),
                  eventId: "EMPTY",
                  countdownTime: Math.floor(data.elapsed),
                  blinkingStartTime: data.startBlinkingTime,
                  blinkLength: data.startBlinkingTime,
                }
              }
              const newTimer: RunningTimer = {
                elapsed: Math.floor(data.elapsed),
                elapsedInMs: Math.floor(data.elapsed * 1000),
                eventId: event.id,
                countdownTime: event.countdownTime,
                blinkingStartTime: event.blinkingStartTime,
                blinkLength: event.blinkLength,
              }
              return newTimer
            },
            disconnectedWhileRunningEventId: null
          })
        }
      }
    },
    ACTIVE: {
      invoke: {
        src: 'waitForDisconnect'
      },
      states: {
        stopped: {
          on: {
            start: {
              guard: 'isConnected',
              target: 'running',
              actions: assign({
                timer: ({ context }) => {
                  const stoppedContext = context as Resetted
                  eventConfigStore.send({ type: "setEventStartedAt", eventId: stoppedContext.timer.eventId })
                  connectionActor.send({
                    type: "sendMessage", message: {
                      type: "start"
                    }
                  })
                  return {
                    ...stoppedContext.timer,
                    elapsed: stoppedContext.timer.countdownTime,
                    elapsedInMs: stoppedContext.timer.countdownTime * 1000,
                  }
                }
              })
            }
          }
        },
        running: {
          invoke: {
            src: 'ticks'
          },
          on: {
            TICK: {
              actions: assign({
                timer: ({ context, event }) => {
                  const runningContext = context as Running
                  const elapsedInMs = runningContext.timer.elapsedInMs - event.diff
                  return {
                    ...runningContext.timer,
                    elapsedInMs,
                    elapsed: Math.round(elapsedInMs / 1000)
                  }
                }
              })
            },
            pause: {
              guard: 'isConnected',
              target: 'paused',
              actions: assign({
                timer: ({ context }) => {
                  const runningContext = context as Running
                  connectionActor.send({ type: "sendMessage", message: { type: "pause" } })
                  return {
                    ...runningContext.timer,
                    messageId: null
                  }
                }
              })
            },
          }
        },
        paused: {
          on: {
            resume: {
              guard: 'isConnected',
              target: 'running',
              actions: () => {
                connectionActor.send({ type: "sendMessage", message: { type: "resume" } })
              }
            }
          }
        },
      },
      on: {
        stop: {
          target: '.stopped',
          guard: 'isConnected',
          actions: assign({
            timer: ({ context }) => {
              const runningContext = context as Running
              connectionActor.send({
                type: "sendMessage",
                // we have to send stop => reset => stop in order to:
                message: [{
                  type: "stop",
                  // first stop removes the timer from the screen
                }, {
                  type: "reset",
                  data: runningContext.timer.countdownTime,
                  // reset the timer on the screen to initial time. w/o prior stop event, there would be a visual blink on the screen with initial time
                }, {
                  type: "stop",
                  // second stop to remove the timer from the screen
                }]
              })
              return {
                ...runningContext.timer,
                elapsed: null,
                elapsedInMs: null,
              }
            }
          })
        },
      },
      initial: 'stopped',
    }
  },
  on: {
    setup: {
      guard: and(['isConnected', ({ event: { data: { eventId } } }) => {
        const event = eventConfigStore.getSnapshot().context.events.find(event => event.id === eventId)!

        return !!eventId && event.countdownTime > 0
      }]),
      actions: assign({
        timer: ({ event: { data } }) => {
          const event = eventConfigStore.getSnapshot().context.events.find(event => event.id === data.eventId)!
          const defaultBlinkLength = eventConfigStore.getSnapshot().context.blinkLength
          connectionActor.send({
            type: "sendMessage", message: [
              { type: "stop" },
              {
                type: "blink",
                data: event.blinkingStartTime
              }, {
                type: "blink_length",
                data: event.blinkLength
              }, {
                type: "reset",
                data: event.countdownTime,
              }]
          })
          return {
            countdownTime: event.countdownTime,
            blinkingStartTime: event.blinkingStartTime,
            blinkLength: event.blinkingStartTime ?? defaultBlinkLength,
            eventId: event.id,
            elapsed: null,
            elapsedInMs: null,
            messageId: null
          }
        },
        disconnectedWhileRunningEventId: () => null,
      }),
      target: '.ACTIVE'
    },
    reset: {
      actions: assign({
        timer: () => {
          return null
        },
        disconnectedWhileRunningEventId: () => null
      }),
      target: '.IDLE'
    },
    disconnect: {
      target: '.IDLE',
      actions: assign({
        timer: () => null,
        disconnectedWhileRunningEventId: ({ context }) => context.timer?.eventId ?? null
      })
    },
    showMessage: {
      guard: and(['isConnected', ({ event }) => {
        return !!eventConfigStore.getSnapshot().context.messages.find(message => message.id === event.data.messageId)
      }]),
      actions: assign({
        messageId: ({ event, context }) => {
          const runningContext = context as Running
          const message = eventConfigStore.getSnapshot().context.messages.find(message => message.id === event.data.messageId)!
          connectionActor.send({ type: "sendMessage", message: { type: "msg", data: message.content } })
          return event.data.messageId
        }
      })
    },
    hideMessage: {
      guard: 'isConnected',
      actions: assign({
        messageId: ({ context }) => {
          const runningContext = context as Running
          connectionActor.send({ type: "sendMessage", message: { type: "hide" } })
          return null
        }
      })
    }
  },
});

let TimerContext = {
  ...createActorContext(timerStore),
  isResolved: false,
}

const snapshotKey = 'timerSnapshot-v1'

const getContext = async () => {
  const snapshot = JSON.parse(await AsyncStorage.getItem(snapshotKey) ?? 'null')
  const context = createActorContext(timerStore, snapshot ? { snapshot } : undefined);
  TimerContext = {
    ...context,
    isResolved: true,
  }
}

getContext()

const useSyncTimerState = () => {
  if (!TimerContext.isResolved) return
  const actor = TimerContext.useActorRef()

  actor.subscribe(() => {
    AsyncStorage.setItem(snapshotKey, JSON.stringify(actor.getPersistedSnapshot()))
  })
}

export function TimerSync() {
  useSyncTimerState()

  return null
}

export { TimerContext }
