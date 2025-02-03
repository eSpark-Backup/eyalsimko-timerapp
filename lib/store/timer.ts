import AsyncStorage from '@react-native-async-storage/async-storage';
import { createActorContext } from '@xstate/react';
import { and, assign, fromCallback, fromEventObservable, setup } from 'xstate';
import { connectionActor } from './connectionStore';

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
  } | null,
}

type SetupEvent = {
  type: "setup",
  data: {
    speakerName: string
    countdownTime: number
    startBlinkingTime: number
    speakerIndex: number
  }
}

type Events = SetupEvent | {
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
    }),
    waitForDisconnect: fromCallback(({ sendBack }) => {
      connectionActor.subscribe(snapshot => {
        if (!snapshot.matches("CONNECTED")) {
          sendBack({ type: "reset" })
        }
      })
    })
  },
  guards: {
    isConnected: () => connectionActor.getSnapshot().matches("CONNECTED"),
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QBcCWBbMAnAxFuYyA2gAwC6ioADgPaypo0B2lIAHogLQBM3AdAE4SAVgEB2YQEYBAFgAcEgQGYAbABoQATy4k+KyTO4CVKkmJkC5A4WKUBfOxrSYsfAJIARADIBRHLEIAVypSCiQQWnpGFnCOBCUBPklk624VGWFuYRIVYQ1tBAs5PmEVZVtbEm45OSyHJwxsPgBBAGEAFTcANT8A5ABZOFgAQxhQ1kiGVGZWOIlhPhkSGQsSY2EZSRIlfMQrXTWlI+4ZJUklMUkVepBnJrbOnv9kGhDyCbopmdjEAW4lEqifRbGzcEhySS7BCSIx8cFrf6bJQyFSqGQ3O6uB7dHx8WAvKhUSDPYZYYjvcKTaKzRBiFRiPhGI7naoGORlKFKOS6ORKKobARXORSDGNLEdHF8LCBJhMVBMKA4TqtADS40pn2pPwQKm4DOESjBJnBwM2UOq-FkR2FVXk3GSopcLQlPSlMrlCpwVGGgQC6uomumMVAcX+KkEUnESmyCl5ck53L4vP5FiFIsctzFzseuOlsvlitgAAsaAB3QawEZjCkBqJBmk6qpJ4xLQ3VMSXdRaRBlYomKPmFTc5ECR33F2590FnBF1AQMAVqtgf0RQPfEOIC4A3kCawiZQXEiQ7sIMRpPQiZNczJZMRj8U5vje33E-CwQKYFdU+vawzh4ViMK1i8nyYgCOaiZGLqEhbLu1gog4GZMDQ87wOEmIfHW67sFwYi6EIogwbICiiDIUKcDUSQGGcJD8icCTcPe7jeD4mFfMGOEICQnKqEx2I9GxWobtC5iLPBIhrBIvDGFCmwlNyyhSNksgwtcGaYtmkr4q8RIQIJP7CWexR0meaR8pIoiqFCFn8CI5g2keBqyMIfETm6+YKvp2FxKscL0raIGgseBQXJISaAScKI2HSkjmK5j7PgEekalhHGhrwYkbBJ4g3jJJ7VLoUF6lIay7hsakOEAA */
  id: 'timer',
  initial: 'IDLE',
  context: {
    timer: null,
  },
  states: {
    IDLE: {
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
                  connectionActor.send({
                    type: "sendMessage", message: {
                      type: "start"
                    }
                  })
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
              guard: 'isConnected',
              target: 'paused',
              actions: assign({
                timer: ({ context }) => {
                  const runningContext = context as Running
                  connectionActor.send({ type: "sendMessage", message: { type: "pause" } })
                  return {
                    ...runningContext.timer,
                    messageIsVisible: false
                  }
                }
              })
            },
            showMessage: {
              guard: 'isConnected',
              actions: assign({
                timer: ({ context }) => {
                  const runningContext = context as Running
                  connectionActor.send({ type: "sendMessage", message: { type: "msg", data: runningContext.timer.message } })
                  return {
                    ...runningContext.timer,
                    messageIsVisible: true
                  }
                }
              })
            },
            hideMessage: {
              guard: 'isConnected',
              actions: assign({
                timer: ({ context }) => {
                  const runningContext = context as Running
                  connectionActor.send({ type: "sendMessage", message: { type: "hide" } })
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
          guard: 'isConnected',
          actions: assign({
            timer: ({ context }) => {
              const runningContext = context as Running
              connectionActor.send({
                type: "sendMessage",
                message: {
                  type: "stop",
                }
              })
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
    setup: {
      guard: and(['isConnected', ({ event }) => {
        return event.data.speakerName.length > 0 && event.data.countdownTime > 0 && event.data.startBlinkingTime > 0
      }]),
      actions: assign({
        timer: ({ event }) => {
          connectionActor.send({
            type: "sendMessage", message: [{
              type: "blink",
              data: event.data.startBlinkingTime
            }, {
              type: "reset",
              data: event.data.countdownTime,
            }]
          })
          return {
            ...event.data,
            message: 'Time is up!',
            elapsed: null,
            messageIsVisible: false
          }
        }
      }),
      target: '.ACTIVE'
    },
    reset: {
      actions: assign({
        timer: () => {
          return null
        }
      }),
      target: '.IDLE'
    }
  },
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
