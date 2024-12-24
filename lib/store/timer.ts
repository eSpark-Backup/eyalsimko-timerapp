import { createActorContext } from '@xstate/react';
import { assign, fromCallback, setup } from 'xstate';

type Idle = { timer: null }
type Running = { timer: { elapsed: number, startBlinkingTime: number, speakerName: string, countdownTime: number } }
type Resetted = { timer: { elapsed: null, startBlinkingTime: number, speakerName: string, countdownTime: number } }

type State = {
  timer: {
    elapsed: number | null,
    speakerName: string
    countdownTime: number
    startBlinkingTime: number
  } | null
}

type Events = {
  type: "setup",
  data: {
    speakerName: string
    countdownTime: number
    startBlinkingTime: number
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
            timer: ({ context, event }) => {
              console.log(context, event);
              return {
                ...event.data,
                elapsed: null
              }
            }
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
                  console.log("TICK", runningContext.timer)
                  return {
                    ...runningContext.timer,
                    elapsed: runningContext.timer.elapsed - 1
                  }
                }
              })
            },
            pause: "paused",
          }
        },
        paused: {
          on: {
            resume: 'running'
          }
        },
      },
      on: {
        stop: {
          target: '.stopped',
          actions: assign({
            timer: ({ context }) => {
              const runningContext = context as Running
              return {
                ...runningContext.timer,
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

export const TimerContext = createActorContext(timerStore);
