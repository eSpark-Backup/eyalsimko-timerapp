import AsyncStorage from '@react-native-async-storage/async-storage';
import { createActorContext } from '@xstate/react';
import { and, assign, fromCallback, fromPromise, setup } from 'xstate';
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
  blackout: boolean
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
  type: "toggleBlackout"
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
      connectionActor.subscribe(snapshot => {
        if (snapshot.matches("CONNECTED")) {
          const context = connectionActor.getSnapshot().context as ConnectedState

          if (context.timerInit) {
            sendBack({ type: "recover", data: context.timerInit })
          }
        }
      })
    }),
    waitForEventDeletion: fromPromise(({ input }: { input: { eventId: string } }) => {
      return new Promise((resolve) => {
        const subscription = eventConfigStore.subscribe((state) => {
          if (!state.context.events.find(event => event.id === input.eventId)) {
            subscription.unsubscribe()
            resolve(undefined)
          }
        })
      })
    })
  },
  guards: {
    isConnected: () => {
      return connectionActor.getSnapshot().matches("CONNECTED")
    },
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QBcCWBbMAnAxLMyArgA4DaADALqKjED2sqadAdjSAJ6IC0ATPwBoQAD0QBGAMxiAHADoAbPLFiA7BICs6lb3LSJAX31C0mXFjgEK1JCHqNmbG6IR9esgJzl17lerHuAFmlfdwl5IS4XcgUxAN53RXIVAPdpdy0DIxATbBwIVFgAY1YWMELkK3Y7JlRWdkjuCXJ3WXUhZzF5CTcNeSD5L21dTOMMXNgACzoAdwBZOFgAQxhKm2qHep4JH3bxd1VZFRUvIM0hvUNR0xwJ1Agwedgllaoqhhq6mwbtlV2EfwORxO0jOOguWRyWFkAEkACIAGQAojhzMUAG7YVa0d4bJyICTdWTSaS8aRiXhtTiITTqWQSFQkgIBeRaFRKaSXbJjKEAQQAwgAVaEANWRsGQdDIrzWONqjlAzncvAkrW8SjEgzBYgi4nisl0zWVAUkzLCAU5kNk-KFopwEqgUAANmAAEKOxaFADWdEIFWl2PscvYHV4xwU6rUoOGOpcofIFu5VsFIsRsnFkuIkDwyEWWD91gDH3lIkQbJUsniBMkpNi0nk7hjEmk0T05ApKU6ILECdMSZtqawhBYLFQLCgeVYYFko7RdE9U8t1pTskHw9HUAQM7ohUWDlIYkoWNsss+CsQIOinni8mVBK0vG1VIQQRaAWGKnc+3kXZ72D7y9XEcxxwIU+QAaSPdYgzxBAb3LdRunIRI62UY0Y1JNxAgJC9eCCB9uwhRMl1FFchyA8diEWQh8Egk9i2cZV5A8PwfA0XQGSbRtmyJJp2y-H9CN7YjU0o6is3MWBCEwWjA1PEtn14JiQQZbx1D0JoP3Q7jr1DPxmk-dRmV-XlkxIwD1wnUppxYWd51kRdTIHMj103Gzt13OV90PA83lk+jz3US82wSW8NG0R9Ii0AIPGGAJ7zirR5EMLIWDoe54BsSFfKLYMeDDTxvF8fwghCAIY0aBIPE-VJyBkOITWMmEEURbLcTPBByEbMJGuE1roPa1RopSQyvGaXx+AScraWNTxmQ1XxmUWnrHLTCViEzCA+rk5xtDkMt+C6WrvDCGMxHUNxBlOcgju2OLlv7Ui1zHLb-OfTx9XkY5cPU+8IvxFQxCJBlcOZVklGSe7l1E-BNplPzcoQfg3GGt9Ap8c7ry06IdKK-T0iM5KgA */
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
                  blackout: false,
                }
              }
              const newTimer: RunningTimer = {
                elapsed: Math.floor(data.elapsed),
                elapsedInMs: Math.floor(data.elapsed * 1000),
                eventId: event.id,
                countdownTime: event.countdownTime,
                blinkingStartTime: event.blinkingStartTime,
                blinkLength: event.blinkLength,
                blackout: false,
              }
              return newTimer
            },
            disconnectedWhileRunningEventId: null
          })
        }
      },
      entry: () => connectionActor.send({ type: "sendMessage", message: { type: "stop" } }),
    },
    ACTIVE: {
      invoke: [{
        src: 'waitForDisconnect'
      }, {
        src: "waitForEventDeletion",
        input: ({ context }) => ({ eventId: context.timer?.eventId as string }),
        onDone: {
          target: "#timer.IDLE",
        }
      }],
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
          invoke: [{
            src: 'ticks',
          }],
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
              actions: ({ context }) => {
                const runningContext = context as Running
                const event = eventConfigStore.getSnapshot().context.events.find(event => event.id === runningContext.timer.eventId)!
                if (!event.startedAt) {
                  eventConfigStore.send({
                    type: "setEventStartedAt",
                    eventId: runningContext.timer.eventId,
                  })
                }
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
        toggleBlackout: {
          actions: assign({
            timer: ({ context }) => {
              const runningContext = context as Running
              const isBlackoutMode = runningContext.timer.blackout
              if (isBlackoutMode)
                connectionActor.send({ type: "sendMessage", message: { type: "blackout:off" } })
              else
                connectionActor.send({ type: "sendMessage", message: { type: "blackout:on" } })
              return {
                ...runningContext.timer,
                blackout: !isBlackoutMode,
              }
            }
          })
        }
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
            messageId: null,
            blackout: false,
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
