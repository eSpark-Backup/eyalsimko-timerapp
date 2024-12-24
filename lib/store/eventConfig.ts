type State = {
  eventName: string
  eventDescription: string
}

import { createStore } from '@xstate/store';

export const eventConfigStore = createStore({
  context: {
    eventName: '',
    eventDescription: '',
  },
  on: {
    setConfig: (context, { eventName, eventDescription }: State) => ({
      eventDescription,
      eventName
    }),
  },
});
