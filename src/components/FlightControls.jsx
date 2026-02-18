import { useState } from 'react'
import { setFlightMode } from './WebotsConnector'
import { useTelemetryStore } from '../store/useStore'
import FlightControlsInfo from './FlightControlsInfo'
import useKeyboardFlightControls from '../hooks/useKeyboardFlightControls'

const FlightControls = () => {
  const flightMode = useTelemetryStore((state) => state.telemetry.flight_mode)

  const [showInfo, setShowInfo] = useState(false)
  const { keys, currentSpeed, MAX_SPEED } = useKeyboardFlightControls()

  const infoButtonClicked = () => {
    setShowInfo(!showInfo)
  }

  return (
    <div className="relative text-white  rounded-lg space-y-15 w-full back overflow-hidden">
      {showInfo && (
        <div className="absolute inset-0 h-full bg-black/90 rounded-lg z-10">
          <span
            className="absolute top-4 left-4 text-2xl cursor-pointer leading-none"
            onClick={() => setShowInfo(false)}
          >
            ✕
          </span>
          <div className="mt-8">
            <FlightControlsInfo />
          </div>
        </div>
      )}
      <div className="flex relative items-center">
        <div
          className="absolute left-0 text-2xl cursor-pointer"
          onClick={infoButtonClicked}
        >
          ⓘ
        </div>
        <div className="text-2xl mt-1.5 uppercase pb-2 text-center w-full">
          Flight Controls
        </div>
      </div>
      <div className="space-y-15 w-1/2 mx-auto">
        <div className="flex gap-2">
          <button
            onClick={() => setFlightMode('takeoff')}
            disabled={flightMode === 'takeoff'}
            className={`flex-1 px-3 py-2 rounded font-bold text-sm transition-colors ${
              flightMode === 'takeoff'
                ? 'bg-blue-600 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            TAKEOFF
          </button>

          <button
            onClick={() => setFlightMode('hover')}
            disabled={flightMode === 'hover'}
            className={`flex-1 px-3 py-2 rounded font-bold text-sm transition-colors ${
              flightMode === 'hover'
                ? 'bg-blue-600 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            HOVER
          </button>

          <button
            onClick={() => setFlightMode('land')}
            disabled={flightMode === 'land'}
            className={`flex-1 px-3 py-2 rounded font-bold text-sm transition-colors ${
              flightMode === 'land'
                ? 'bg-blue-600 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            LAND
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setFlightMode('rth')}
            className="flex-1 px-3 py-2 rounded font-bold text-sm bg-blue-500 hover:bg-blue-600 transition-colors"
          >
            RTH
          </button>

          <button
            onClick={() => setFlightMode('emergency_stop')}
            className="flex-1 px-3 py-2 rounded font-bold text-sm bg-red-600 hover:bg-red-700 transition-colors"
          >
            EMERGENCY STOP
          </button>
        </div>
      </div>
      <div className="text-s text-center pb-2">
        <span className="text-gray-400">Current Mode: </span>
        <span className="font-bold uppercase">{flightMode}</span>
      </div>
    </div>
  )
}

export default FlightControls
