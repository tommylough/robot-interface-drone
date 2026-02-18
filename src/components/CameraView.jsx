import { Canvas } from '@react-three/fiber'
import { useCameraStore } from '../store/useStore'
import HUD from './HUD'

const CameraView = () => {
  const cameraImage = useCameraStore((state) => state.cameraImage)

  return (
    <div className="relative border-2 border-none rounded overflow-hidden bg-neutral-700">
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
      </Canvas>
    </div>
  )
}

export default CameraView
