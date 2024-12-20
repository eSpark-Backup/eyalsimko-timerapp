import { create, StateCreator } from 'zustand'

import { createBearSlice, EventConfig } from './eventConfig'

export const useStore = create<EventConfig>()((...a) => ({
  ...createBearSlice(...a),
}))
