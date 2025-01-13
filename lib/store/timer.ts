import AsyncStorage from '@react-native-async-storage/async-storage';
import { createActorContext } from '@xstate/react';
import { createActor } from 'xstate';
import { assign, fromCallback, setup } from 'xstate';

type Idle = { timer: null }
type Running = { timer: { elapsed: number, speakerIndex: number, startBlinkingTime: number, speakerName: string, countdownTime: number, message: string, messageIsVisible: boolean } }
type Resetted = { timer: { elapsed: null, speakerIndex: number, startBlinkingTime: number, speakerName: string, countdownTime: number, message: string, messageIsVisible: boolean } }

type State = {
  timer: {
    elapsed: number | null,
    speakerIndex: number,
    speakerName: string
    countdownTime: number
    startBlinkingTime: number
    message: string,
    messageIsVisible: boolean
  } | null
}

type Events = {
  type: "setup",
  data: {
    speakerName: string
    countdownTime: number
    startBlinkingTime: number
    speakerIndex: number
  }
} | {
  type: "start"
} | {
  type: "TICK"
} | {
  type: "reset"
} | {
  type: "stop"
} | {
  type: "pause"
} | {
  type: "resume"
} | {
  type: "setMessage",
  data: {
    message: string
  }
} | {
  type: "showMessage"
} | {
  type: "hideMessage"
}

export const timerStore = setup({
  types: {
    context: {} as State,
    events: {} as Events
  },
  actors: {
    ticks: fromCallback(({ sendBack }) => {
      const interval = setInterval(() => {
        sendBack({ type: 'TICK' });
      }, 1000);
      return () => clearInterval(interval);
    })
  }
}).createMachine({
  id: 'timer',
  initial: 'IDLE',
  context: {
    timer: null
  },
  states: {
    IDLE: {
      on: {
        setup: {
          actions: assign({
            timer: ({ event }) => ({
              ...event.data,
              message: 'Time is up!',
              elapsed: null,
              messageIsVisible: false
            })
          }),
          target: 'ACTIVE'
        }
      }
    },
    ACTIVE: {
      states: {
        stopped: {
          on: {
            start: {
              target: 'running',
              actions: assign({
                timer: ({ context }) => {
                  const stoppedContext = context as Resetted
                  return {
                    ...stoppedContext.timer,
                    elapsed: stoppedContext.timer.countdownTime
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
                timer: ({ context }) => {
                  const runningContext = context as Running
                  return {
                    ...runningContext.timer,
                    elapsed: runningContext.timer.elapsed - 1
                  }
                }
              })
            },
            pause: {
              target: 'paused',
              actions: assign({
                timer: ({ context }) => {
                  const runningContext = context as Running
                  return {
                    ...runningContext.timer,
                    messageIsVisible: false
                  }
                }
              })
            },
            showMessage: {
              actions: assign({
                timer: ({ context }) => {
                  console.log("show!")
                  const runningContext = context as Running
                  return {
                    ...runningContext.timer,
                    messageIsVisible: true
                  }
                }
              })
            },
            hideMessage: {
              actions: assign({
                timer: ({ context }) => {
                  console.log("hide!!")
                  const runningContext = context as Running
                  return {
                    ...runningContext.timer,
                    messageIsVisible: false
                  }
                }
              })
            }
          }
        },
        paused: {
          on: {
            resume: 'running'
          }
        },
      },
      on: {
        setMessage: {
          actions: assign({
            timer: ({ context, event }) => {
              const runningContext = context as Running
              return {
                ...runningContext.timer,
                message: event.data.message
              }
            }
          }),
        },
        stop: {
          target: '.stopped',
          actions: assign({
            timer: ({ context }) => {
              const runningContext = context as Running
              return {
                ...runningContext.timer,
                messageIsVisible: false,
                elapsed: null
              }
            }
          })
        },
      },
      initial: 'stopped',
    }
  },
  on: {
    reset: {
      actions: assign({
        timer: () => {
          return null
        }
      }),
      target: '.IDLE'
    }
  }
});

let TimerContext = {
  ...createActorContext(timerStore),
  isResolved: false,
}

const snapshotKey = 'timerSnapshot-v0'

const getContext = async () => {
  const snapshot = JSON.parse(await AsyncStorage.getItem(snapshotKey) ?? 'null')
  const context = createActorContext(timerStore, {
    snapshot,
  });

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
