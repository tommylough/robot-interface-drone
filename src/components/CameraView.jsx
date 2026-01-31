import { useCameraStore } from '../store/useStore'

const CameraView = () => {
  const cameraImage = useCameraStore((state) => state.cameraImage)

  return (
    <div className="border-2 border-none rounded overflow-hidden bg-neutral-700 p-5">
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
