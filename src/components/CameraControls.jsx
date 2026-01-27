import { switchCamera } from './WebotsConnector'
import { useCameraStore } from '../store/useStore'

const CameraControls = () => {
  const activeCamera = useCameraStore((state) => state.activeCamera)
  const resolution = useCameraStore((state) => state.resolution)
  const fps = useCameraStore((state) => state.fps)

  return (
    <div className="bg-black/50 backdrop-blur-sm text-white p-3 rounded-lg space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wide">Camera</h3>
        <div className="text-xs text-gray-400">
          {resolution} @ {fps}fps
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => switchCamera('front')}
          className={`flex-1 px-3 py-1.5 rounded text-xs font-bold transition-colors ${
            activeCamera === 'front'
              ? 'bg-purple-600'
              : 'bg-gray-600 hover:bg-gray-500'
          }`}
        >
          FRONT
        </button>

        <button
          onClick={() => switchCamera('bottom')}
          className={`flex-1 px-3 py-1.5 rounded text-xs font-bold transition-colors ${
            activeCamera === 'bottom'
              ? 'bg-purple-600'
              : 'bg-gray-600 hover:bg-gray-500'
          }`}
        >
          BOTTOM
        </button>
      </div>
    </div>
  )
}

export default CameraControls
