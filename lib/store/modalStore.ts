import { createStore } from "@xstate/store";
import { Event } from "~/lib/store/eventConfig";

export type Modal = | {
  type: "addEvent";
}
  | {
    type: "deleteEvent";
    event: Event;
  }
  | {
    type: "editEvent";
    event: Event;
  }
  | { type: null }

type State = {
  modal: Modal | null
}

const initialState: State = { modal: null }

export const modalStore = createStore({
  context: initialState,
  on: {
    hideModal: () => {
      return {
        modal: null
      }
    },
    showModal: (context, { modal }: { modal: Modal }) => {
      return { modal }
    }
  }
})