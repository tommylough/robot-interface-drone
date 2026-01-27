import { create as zustandCreate } from 'zustand'

export const useDroneStore = zustandCreate((set) => ({
  sensitivity: 0.5,
  setSensitivity: (value) => set({ sensitivity: value }),
}))

export const useCameraStore = zustandCreate((set) => ({
  cameraImage: null,
  activeCamera: 'front',
  resolution: '400x240',
  fps: 0,
  setCameraImage: (image) => set({ cameraImage: image }),
  setActiveCamera: (camera) => set({ activeCamera: camera }),
  setCameraStats: (resolution, fps) => set({ resolution, fps }),
}))

export const useTelemetryStore = zustandCreate((set) => ({
  telemetry: {
    altitude: 0,
    target: 0,
    roll: 0,
    pitch: 0,
    yaw: 0,
    gps: { lat: 0, lon: 0, alt: 0 },
    battery: 100,
    signal_strength: 100,
    temperatures: {
      body: 25,
      motors: { fl: 25, fr: 25, rl: 25, rr: 25 },
    },
    wind_speed: 0,
    flight_mode: 'manual',
    timestamp: 0,
  },
  setTelemetry: (data) => set({ telemetry: data }),
}))
