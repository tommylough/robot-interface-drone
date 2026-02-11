import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { sendCameraControl } from './WebotsConnector'
import { useCameraStore } from '../store/useStore'
import Trackball from './Trackball'

const CameraControls = () => {
  const [pitch, setPitch] = useState(0) // -90 to 90
  const [yaw, setYaw] = useState(0) // -180 to 180
  const setGimbalAngles = useCameraStore((state) => state.setGimbalAngles)

  const adjustCamera = (pitchDelta, yawDelta) => {
    const newPitch = Math.max(-90, Math.min(90, pitch - pitchDelta)) // Inverted
    const newYaw = ((yaw - yawDelta + 180) % 360) - 180 // Inverted
    setPitch(newPitch)
    setYaw(newYaw)
    setGimbalAngles(newPitch, newYaw)
    sendCameraControl(newPitch, newYaw)
  }

  const resetCamera = () => {
    setPitch(0)
    setYaw(0)
    setGimbalAngles(0, 0)
    sendCameraControl(0, 0)
  }

  return (
    <div className=" text-white rounded-lg">
      {/* 3D Trackball */}
      <div>
        <div className="flex justify-center text-2xl mt-1.5 uppercase">
          Camera
        </div>
        <div className="h-64">
          <Canvas
            camera={{ position: [0, 3, 0], fov: 60 }}
            gl={{ alpha: true }}
          >
            <ambientLight intensity={0.8} />
            <directionalLight position={[5, 5, 5]} intensity={1} />
            <pointLight position={[-5, 5, -5]} intensity={0.5} />
            <Trackball pitch={pitch} yaw={yaw} onAdjust={adjustCamera} />
          </Canvas>
        </div>
        <div className="flex justify-center">
          <button
            onClick={resetCamera}
            className="px-8 py-2 rounded font-bold transition-colors border border-[#686868]"
            style={{
              background: 'linear-gradient(to bottom, #001138, #001E53)',
            }}
          >
            <p className="scale-120">RESET</p>
          </button>
        </div>
      </div>
    </div>
  )
}

export default CameraControls
