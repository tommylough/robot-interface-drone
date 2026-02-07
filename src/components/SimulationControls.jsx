import { useState, useEffect, useRef } from 'react'
import { sendDroneCommand } from './WebotsConnector'
import { useDroneStore, useTelemetryStore } from '../store/useStore'

const MIN_SPEED = 1
const MAX_SPEED = 2.0
const ACCELERATION_RATE = 0.05

const SimulationControls = () => {
  const flightMode = useTelemetryStore((state) => state.telemetry.flight_mode)
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
  const wasAnyKeyPressed = useRef(false)
  const currentSpeed = useRef(0) // Positive = forward, negative = backward

  // Reset speed when switching to hover mode
  useEffect(() => {
    if (flightMode === 'hover') {
      currentSpeed.current = 0
      sendDroneCommand(0, 0, 0, 0)
    }
  }, [flightMode])

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase()

      if (['w', 'a', 's', 'd', 'q', 'e'].includes(key)) {
        setKeys((prev) => ({ ...prev, [key]: true }))
      }

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

      if (['w', 'a', 's', 'd', 'q', 'e'].includes(key)) {
        setKeys((prev) => ({ ...prev, [key]: false }))
      }

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

    // Altitude control
    if (keys.arrowup) {
      vertical += sensitivity
    }
    if (keys.arrowdown) {
      vertical -= sensitivity
    }

    // Forward/backward with acceleration - speed persists when released
    if (keys.w) {
      // Accelerate forward
      currentSpeed.current = Math.min(
        MAX_SPEED,
        currentSpeed.current + ACCELERATION_RATE,
      )
    } else if (keys.s) {
      // Accelerate backward
      currentSpeed.current = Math.max(
        -MAX_SPEED,
        currentSpeed.current - ACCELERATION_RATE,
      )
    }
    // Speed persists when neither W nor S is pressed

    pitch += currentSpeed.current

    // Left/right strafe
    if (keys.a) {
      roll -= sensitivity
    }
    if (keys.d) {
      roll += sensitivity
    }

    // Yaw rotation
    if (keys.q) {
      yaw -= sensitivity
    }
    if (keys.e) {
      yaw += sensitivity
    }

    const anyKeyPressed = Object.values(keys).some((pressed) => pressed)

    // Send commands when keys are pressed OR when transitioning from pressed to released
    if (anyKeyPressed) {
      sendDroneCommand(vertical, roll, pitch, yaw)
      wasAnyKeyPressed.current = true
    } else if (wasAnyKeyPressed.current) {
      // Send final command with current speed maintained
      sendDroneCommand(0, 0, currentSpeed.current, 0)
      wasAnyKeyPressed.current = false
    }
  }, [keys, sensitivity])

  return (
    <div className="space-y-2">
      <div className="text-white text-sm space-y-1">
        <p className="font-bold">Drone Controls:</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
          <div>W/S: Forward/Back (accel)</div>
          <div>A/D: Strafe Left/Right</div>
          <div>Q/E: Yaw Left/Right</div>
          <div>↑/↓: Altitude Up/Down</div>
        </div>
        <div className="text-xs text-gray-400">
          Speed: {Math.abs((currentSpeed.current / MAX_SPEED) * 100).toFixed(0)}
          %{' '}
          {currentSpeed.current < 0
            ? '(backward)'
            : currentSpeed.current > 0
              ? '(forward)'
              : ''}
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
