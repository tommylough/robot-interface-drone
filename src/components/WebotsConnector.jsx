import { useEffect } from 'react'
import { useCameraStore, useTelemetryStore } from '../store/useStore'

let socket = null
let isSocketReady = false

export const sendDroneCommand = (vertical, roll, pitch, yaw) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    const command = {
      type: 'motor_command',
      vertical,
      roll,
      pitch,
      yaw,
    }
    socket.send(JSON.stringify(command))
  }
}

export const setFlightMode = (mode) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(
      JSON.stringify({
        type: 'flight_mode',
        mode,
      }),
    )
  }
}

export const switchCamera = (camera) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(
      JSON.stringify({
        type: 'camera_switch',
        camera,
      }),
    )
  }
}

export const sendCameraControl = (pitch, yaw) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(
      JSON.stringify({
        type: 'camera_control',
        pitch,
        yaw,
      }),
    )
  }
}

const WebotsConnector = () => {
  const setCameraImage = useCameraStore((state) => state.setCameraImage)
  const setActiveCamera = useCameraStore((state) => state.setActiveCamera)
  const setCameraStats = useCameraStore((state) => state.setCameraStats)
  const setTelemetry = useTelemetryStore((state) => state.setTelemetry)

  useEffect(() => {
    const ws = new WebSocket('ws://127.0.0.1:8765')
    socket = ws
    isSocketReady = false

    ws.onopen = () => {
      console.log('Connected to Webots Python controller')
      isSocketReady = true
      console.log('Socket is now ready, readyState:', ws.readyState)
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)

      if (data.camera) {
        const imageUrl = `data:image/jpeg;base64,${data.camera.data}`
        setCameraImage(imageUrl)
        setActiveCamera(data.camera.active)
        setCameraStats(data.camera.resolution, data.camera.fps)
      }

      if (data.telemetry) {
        setTelemetry({
          altitude: data.telemetry.altitude,
          target: data.telemetry.target,
          roll: data.telemetry.roll,
          pitch: data.telemetry.pitch,
          yaw: data.telemetry.yaw,
          heading: data.telemetry.heading,
          gps: data.telemetry.gps,
          x: data.telemetry.gps?.x,
          y: data.telemetry.gps?.y,
          battery: data.telemetry.battery,
          signal_strength: data.telemetry.signal_strength,
          temperatures: data.telemetry.temperatures,
          wind_speed: data.telemetry.wind_speed,
          flight_mode: data.telemetry.flight_mode,
          timestamp: data.timestamp,
        })
      }

      // Dispatch map data events for TacticalMap component
      if (data.type === 'map_data') {
        window.dispatchEvent(new MessageEvent('webots-message', { data: event.data }))
      }
    }

    ws.onerror = (err) => {
      console.error('WebSocket Error:', err)
      isSocketReady = false
    }

    ws.onclose = () => {
      console.log('Disconnected from controller')
      socket = null
      isSocketReady = false
    }

    return () => {
      if (ws) {
        ws.close()
        isSocketReady = false
      }
    }
  }, [setCameraImage, setActiveCamera, setCameraStats, setTelemetry])

  return null
}

export default WebotsConnector
