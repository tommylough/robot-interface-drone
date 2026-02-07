import { Canvas, useFrame } from '@react-three/fiber'
import { useCameraStore, useTelemetryStore } from '../store/useStore'
import { useRef } from 'react'
import * as THREE from 'three'
import HUD from './HUD'

const CylinderOverlay = () => {
  return (
    <>
      <mesh position={[0, 0.1, 0]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.2, 32]} />
        <meshStandardMaterial color="#ff6b6b" />
      </mesh>
      {/* Ground plane for reference */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#333333" transparent opacity={0.3} />
      </mesh>
    </>
  )
}

const CameraController = () => {
  const { telemetry } = useTelemetryStore()

  useFrame(({ camera }) => {
    // Position camera at drone location
    camera.position.set(0, telemetry.altitude, 0)

    // Apply drone orientation (pitch, yaw, roll)
    // Webots uses different axis conventions, may need adjustment
    const euler = new THREE.Euler(
      telemetry.pitch, // rotation around X axis
      telemetry.yaw, // rotation around Y axis
      telemetry.roll, // rotation around Z axis
      'XYZ',
    )
    camera.quaternion.setFromEuler(euler)
  })

  return null
}

const CameraView = () => {
  const cameraImage = useCameraStore((state) => state.cameraImage)

  return (
    <div className="relative border-2 border-none rounded overflow-hidden bg-neutral-700 p-5">
      {cameraImage ? (
        <img src={cameraImage} alt="Robot Camera" className="w-full h-auto" />
      ) : (
        <div className="w-64 h-48 bg-gray-800 flex items-center justify-center text-white">
          No Camera Feed
        </div>
      )}

      {/* HUD Overlay */}
      <HUD />

      {/* Three.js overlay */}
      <Canvas
        className="absolute inset-0 pointer-events-none"
        camera={{
          fov: 60, // Adjust this to match Webots camera FOV
          aspect: 400 / 225,
          near: 0.01,
          far: 100,
        }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        {/*<CameraController />
        <CylinderOverlay />*/}
      </Canvas>
    </div>
  )
}

export default CameraView
