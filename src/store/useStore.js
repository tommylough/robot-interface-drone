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
  gimbalPitch: 0,
  gimbalYaw: 0,
  attitudeOpacity: 1,
  fadeSensitivity: 0.05, // 0-1: lower = fades faster, higher = fades slower
  setCameraImage: (image) => set({ cameraImage: image }),
  setActiveCamera: (camera) => set({ activeCamera: camera }),
  setCameraStats: (resolution, fps) => set({ resolution, fps }),
  setGimbalAngles: (pitch, yaw) => {
    const state = useCameraStore.getState()
    // Calculate opacity based on distance from center
    const distance = Math.sqrt(pitch * pitch + yaw * yaw)
    const maxDistance = Math.sqrt(90 * 90 + 180 * 180) * state.fadeSensitivity // Apply sensitivity
    const opacity = Math.max(0, 1 - distance / maxDistance)
    set({ gimbalPitch: pitch, gimbalYaw: yaw, attitudeOpacity: opacity })
  },
  setFadeSensitivity: (value) => set({ fadeSensitivity: value }),
}))

export const useTelemetryStore = zustandCreate((set) => ({
  telemetry: {
    altitude: 0,
    target: 0,
    roll: 0,
    pitch: 0,
    yaw: 0,
    heading: 0,
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
