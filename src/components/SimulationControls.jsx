import { useState, useEffect } from 'react'
import { sendDroneCommand } from './WebotsConnector'
import { useDroneStore } from '../store/useStore'

const SimulationControls = () => {
  const [keys, setKeys] = useState({
    w: false,
    a: false,
    s: false,
    d: false,
    q: false,
    e: false,
    arrowup: false,
    arrowdown: false,
  })
  const sensitivity = useDroneStore((state) => state.sensitivity)

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase()

      // Handle regular keys
      if (['w', 'a', 's', 'd', 'q', 'e'].includes(key)) {
        setKeys((prev) => ({ ...prev, [key]: true }))
      }

      // Handle arrow keys
      if (e.code === 'ArrowUp') {
        e.preventDefault()
        setKeys((prev) => ({ ...prev, arrowup: true }))
      }
      if (e.code === 'ArrowDown') {
        e.preventDefault()
        setKeys((prev) => ({ ...prev, arrowdown: true }))
      }
    }

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase()

      // Handle regular keys
      if (['w', 'a', 's', 'd', 'q', 'e'].includes(key)) {
        setKeys((prev) => ({ ...prev, [key]: false }))
      }

      // Handle arrow keys
      if (e.code === 'ArrowUp') {
        e.preventDefault()
        setKeys((prev) => ({ ...prev, arrowup: false }))
      }
      if (e.code === 'ArrowDown') {
        e.preventDefault()
        setKeys((prev) => ({ ...prev, arrowdown: false }))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  useEffect(() => {
    let vertical = 0
    let roll = 0
    let pitch = 0
    let yaw = 0

    // Altitude control (Arrow Up = up, Arrow Down = down)
    if (keys.arrowup) {
      vertical += sensitivity
    }
    if (keys.arrowdown) {
      vertical -= sensitivity
    }

    // Forward/backward (W/S)
    if (keys.w) {
      pitch += sensitivity
    }
    if (keys.s) {
      pitch -= sensitivity
    }

    // Left/right strafe (A/D)
    if (keys.a) {
      roll -= sensitivity
    }
    if (keys.d) {
      roll += sensitivity
    }

    // Yaw rotation (Q/E)
    if (keys.q) {
      yaw -= sensitivity
    }
    if (keys.e) {
      yaw += sensitivity
    }

    sendDroneCommand(vertical, roll, pitch, yaw)
  }, [keys, sensitivity])

  return (
    <div className="space-y-2">
      <div className="text-white text-sm space-y-1">
        <p className="font-bold">Drone Controls:</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
          <div>W/S: Forward/Back</div>
          <div>A/D: Strafe Left/Right</div>
          <div>Q/E: Yaw Left/Right</div>
          <div>↑/↓: Altitude Up/Down</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 font-mono text-xs">
        <span
          className={`px-2 py-1 rounded ${keys.w ? 'bg-green-500' : 'bg-gray-600'} text-white`}
        >
          W
        </span>
        <span
          className={`px-2 py-1 rounded ${keys.a ? 'bg-green-500' : 'bg-gray-600'} text-white`}
        >
          A
        </span>
        <span
          className={`px-2 py-1 rounded ${keys.s ? 'bg-green-500' : 'bg-gray-600'} text-white`}
        >
          S
        </span>
        <span
          className={`px-2 py-1 rounded ${keys.d ? 'bg-green-500' : 'bg-gray-600'} text-white`}
        >
          D
        </span>
        <span
          className={`px-2 py-1 rounded ${keys.q ? 'bg-green-500' : 'bg-gray-600'} text-white`}
        >
          Q
        </span>
        <span
          className={`px-2 py-1 rounded ${keys.e ? 'bg-green-500' : 'bg-gray-600'} text-white`}
        >
          E
        </span>
        <span
          className={`px-2 py-1 rounded ${keys.arrowup ? 'bg-green-500' : 'bg-gray-600'} text-white`}
        >
          ↑
        </span>
        <span
          className={`px-2 py-1 rounded ${keys.arrowdown ? 'bg-green-500' : 'bg-gray-600'} text-white`}
        >
          ↓
        </span>
      </div>
    </div>
  )
}

export default SimulationControls
