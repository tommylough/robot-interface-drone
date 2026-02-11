import { setFlightMode } from './WebotsConnector'
import { useTelemetryStore } from '../store/useStore'

const FlightControls = () => {
  const flightMode = useTelemetryStore((state) => state.telemetry.flight_mode)

  return (
    <div className=" text-white p-4 rounded-lg space-y-15">
      <h3 className="text-2xl mt-1.5 uppercase pb-2 text-center">
        Flight Controls
      </h3>

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

      <div className="text-s text-center">
        <span className="text-gray-400">Current Mode: </span>
        <span className="font-bold uppercase">{flightMode}</span>
      </div>
    </div>
  )
}

export default FlightControls
