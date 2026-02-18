import { useState, useEffect, useRef } from 'react'
import { sendDroneCommand } from '../components/WebotsConnector'
import { useDroneStore, useTelemetryStore } from '../store/useStore'

const MAX_SPEED = 2.0
const ACCELERATION_RATE = 0.05

const useKeyboardFlightControls = () => {
  const flightMode = useTelemetryStore((state) => state.telemetry.flight_mode)
  const sensitivity = useDroneStore((state) => state.sensitivity)

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

  const wasAnyKeyPressed = useRef(false)
  const currentSpeed = useRef(0)

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
        setKeys((prev) => ({ ...prev, arrowup: false }))
      }
      if (e.code === 'ArrowDown') {
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

    if (keys.arrowup) vertical += sensitivity
    if (keys.arrowdown) vertical -= sensitivity

    if (keys.w) {
      currentSpeed.current = Math.min(MAX_SPEED, currentSpeed.current + ACCELERATION_RATE)
    } else if (keys.s) {
      currentSpeed.current = Math.max(-MAX_SPEED, currentSpeed.current - ACCELERATION_RATE)
    }

    pitch += currentSpeed.current

    if (keys.a) roll -= sensitivity
    if (keys.d) roll += sensitivity
    if (keys.q) yaw -= sensitivity
    if (keys.e) yaw += sensitivity

    const anyKeyPressed = Object.values(keys).some((pressed) => pressed)

    if (anyKeyPressed) {
      sendDroneCommand(vertical, roll, pitch, yaw)
      wasAnyKeyPressed.current = true
    } else if (wasAnyKeyPressed.current) {
      sendDroneCommand(0, 0, currentSpeed.current, 0)
      wasAnyKeyPressed.current = false
    }
  }, [keys, sensitivity])

  return { keys, currentSpeed, MAX_SPEED }
}

export default useKeyboardFlightControls
