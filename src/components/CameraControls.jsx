import { useState } from 'react'
import { switchCamera, sendCameraControl } from './WebotsConnector'
import { useCameraStore } from '../store/useStore'

const CameraControls = () => {
  const activeCamera = useCameraStore((state) => state.activeCamera)
  const resolution = useCameraStore((state) => state.resolution)
  const fps = useCameraStore((state) => state.fps)
  
  const [manualMode, setManualMode] = useState(false)
  const [pitch, setPitch] = useState(0) // -90 to 90
  const [yaw, setYaw] = useState(0) // -180 to 180

  const adjustCamera = (pitchDelta, yawDelta) => {
    const newPitch = Math.max(-90, Math.min(90, pitch - pitchDelta))  // Inverted
    const newYaw = ((yaw - yawDelta + 180) % 360) - 180  // Inverted
    setPitch(newPitch)
    setYaw(newYaw)
    sendCameraControl(newPitch, newYaw)
  }

  const resetCamera = () => {
    setPitch(0)
    setYaw(0)
    setManualMode(false)
  }

  return (
    <div className="bg-black/50 backdrop-blur-sm text-white p-3 rounded-lg space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wide">Camera</h3>
        <div className="text-xs text-gray-400">
          {resolution} @ {fps}fps
        </div>
      </div>

      {!manualMode ? (
        <>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setPitch(0)
                setYaw(0)
                sendCameraControl(0, 0)
                switchCamera('front')
              }}
              className={`flex-1 px-3 py-1.5 rounded text-xs font-bold transition-colors ${
                activeCamera === 'front'
                  ? 'bg-purple-600'
                  : 'bg-gray-600 hover:bg-gray-500'
              }`}
            >
              FRONT
            </button>

            <button
              onClick={() => {
                setPitch(90)  // Look down (positive pitch)
                setYaw(0)
                sendCameraControl(90, 0)
                switchCamera('front')
              }}
              className="flex-1 px-3 py-1.5 rounded text-xs font-bold bg-gray-600 hover:bg-gray-500 transition-colors"
            >
              BOTTOM
            </button>
          </div>
          
          <button
            onClick={() => setManualMode(true)}
            className="w-full px-3 py-1.5 rounded text-xs font-bold bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            MANUAL CONTROL
          </button>
        </>
      ) : (
        <>
          {/* Manual Control Mode */}
          <div className="space-y-2">
            {/* Current Angles Display */}
            <div className="flex justify-between text-xs font-mono">
              <span>Pitch: <span className="text-green-400">{pitch}°</span></span>
              <span>Yaw: <span className="text-green-400">{yaw}°</span></span>
            </div>
            
            {/* D-Pad Controls */}
            <div className="grid grid-cols-3 gap-1">
              {/* Top row */}
              <button
                onClick={() => adjustCamera(5, -5)}
                className="bg-gray-600 hover:bg-gray-500 p-2 rounded text-xs"
              >
                ↖
              </button>
              <button
                onClick={() => adjustCamera(5, 0)}
                className="bg-gray-600 hover:bg-gray-500 p-2 rounded text-xs"
              >
                ↑
              </button>
              <button
                onClick={() => adjustCamera(5, 5)}
                className="bg-gray-600 hover:bg-gray-500 p-2 rounded text-xs"
              >
                ↗
              </button>
              
              {/* Middle row */}
              <button
                onClick={() => adjustCamera(0, -5)}
                className="bg-gray-600 hover:bg-gray-500 p-2 rounded text-xs"
              >
                ←
              </button>
              <button
                onClick={resetCamera}
                className="bg-yellow-600 hover:bg-yellow-700 p-2 rounded text-xs font-bold"
              >
                ⊙
              </button>
              <button
                onClick={() => adjustCamera(0, 5)}
                className="bg-gray-600 hover:bg-gray-500 p-2 rounded text-xs"
              >
                →
              </button>
              
              {/* Bottom row */}
              <button
                onClick={() => adjustCamera(-5, -5)}
                className="bg-gray-600 hover:bg-gray-500 p-2 rounded text-xs"
              >
                ↙
              </button>
              <button
                onClick={() => adjustCamera(-5, 0)}
                className="bg-gray-600 hover:bg-gray-500 p-2 rounded text-xs"
              >
                ↓
              </button>
              <button
                onClick={() => adjustCamera(-5, 5)}
                className="bg-gray-600 hover:bg-gray-500 p-2 rounded text-xs"
              >
                ↘
              </button>
            </div>
            
            <button
              onClick={() => setManualMode(false)}
              className="w-full px-3 py-1.5 rounded text-xs font-bold bg-gray-600 hover:bg-gray-500 transition-colors"
            >
              BACK TO PRESETS
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default CameraControls
