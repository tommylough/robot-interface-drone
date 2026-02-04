import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'

const DRAG_SENSITIVITY = 0.5

const Trackball = ({ pitch, yaw, onAdjust }) => {
  const trackballRef = useRef()
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const handlePointerDown = (e) => {
    e.stopPropagation()
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const handlePointerUp = () => {
    setIsDragging(false)
  }

  const handlePointerMove = (e) => {
    if (!isDragging) return

    const deltaX = e.clientX - dragStart.x
    const deltaY = e.clientY - dragStart.y

    onAdjust(-deltaY * DRAG_SENSITIVITY, -deltaX * DRAG_SENSITIVITY)
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  useFrame(() => {
    if (trackballRef.current) {
      trackballRef.current.rotation.x = (pitch * Math.PI) / 180
      trackballRef.current.rotation.y = (yaw * Math.PI) / 180
    }
  })

  return (
    <group>
      {/* Base Holder - Bottom */}
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[1.6, 1.6, 0.05, 32]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.3} roughness={0.7} />
      </mesh>

      {/* Light Gray Ring around sphere */}
      <mesh position={[0, 0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.1, 0.25, 16, 32]} />
        <meshStandardMaterial color="#888888" metalness={0.4} roughness={0.6} />
      </mesh>

      {/* Trackball */}
      <mesh
        ref={trackballRef}
        position={[0, 0.4, 0]}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerUp}
      >
        <sphereGeometry args={[1.1, 32, 32]} />
        <meshStandardMaterial color="#1E90FF" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  )
}

export default Trackball
