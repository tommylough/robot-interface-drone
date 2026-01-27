import { useCameraStore } from '../store/useStore'

const CameraView = () => {
  const cameraImage = useCameraStore((state) => state.cameraImage)

  return (
    <div className="border-2 border-blue-500 rounded overflow-hidden">
      {cameraImage ? (
        <img src={cameraImage} alt="Robot Camera" className="w-full h-auto" />
      ) : (
        <div className="w-64 h-48 bg-gray-800 flex items-center justify-center text-white">
          No Camera Feed
        </div>
      )}
    </div>
  )
}

export default CameraView
