import { create, StateCreator } from 'zustand'

export interface EventConfig {
  eventName: string
  eventDescription: string
  setConfig: (config: Pick<EventConfig, 'eventName' | 'eventDescription'>) => void
}

export const createBearSlice: StateCreator<
  EventConfig,
  [],
  [],
  EventConfig
> = (set) => ({
  eventName: '',
  eventDescription: '',
  setConfig: (config) => set(config),
})
