import { create as zustandCreate } from 'zustand'

export const useDroneStore = zustandCreate((set) => ({
  sensitivity: 0.5,
  altitude: 0,
  setSensitivity: (value) => set({ sensitivity: value }),
  setAltitude: (value) => set({ altitude: value }),
}))

export const useCameraStore = zustandCreate((set) => ({
  cameraImage: null,
  setCameraImage: (image) => set({ cameraImage: image }),
}))
/*
count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: ()
    
 */
