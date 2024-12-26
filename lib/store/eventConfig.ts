type State = {
  eventName: string | null
  eventDescription: string | null
  defaultBlinkingStartTime: number | null
  blinkLength: number | null
}

import { createStore } from '@xstate/store';

export const eventConfigStore = createStore({
  context: {
    eventName: null,
    eventDescription: null,
    defaultBlinkingStartTime: null,
    blinkLength: null,
  } as State,
  on: {
    setEventName: (context, { eventName, eventDescription }: Pick<State, 'eventDescription' | 'eventName'>) => ({
      eventDescription,
      eventName
    }),
    setDefaultBlinkingStartTime: (context, { defaultBlinkingStartTime }: Pick<State, 'defaultBlinkingStartTime'>) => ({
      defaultBlinkingStartTime
    }),
    setBlinkLength: (context, { blinkLength }: Pick<State, 'blinkLength'>) => ({
      blinkLength
    }),
  },
});
