import { useEffect } from 'react'
import { useCameraStore } from '../store/useStore'

let socket = null
let isSocketReady = false

export const sendDroneCommand = (vertical, roll, pitch, yaw) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    const command = {
      type: 'motor_command',
      vertical: vertical,
      roll: roll,
      pitch: pitch,
      yaw: yaw,
    }
    socket.send(JSON.stringify(command))
  }
}

const WebotsConnector = () => {
  const setCameraImage = useCameraStore((state) => state.setCameraImage)

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
  }, [setCameraImage])

  return null
}

export default WebotsConnector
