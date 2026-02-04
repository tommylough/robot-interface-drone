import CameraView from './CameraView'
import CameraControls from './CameraControls'
import Compass from './Compass'
import Orientation from './Orientation'
import Altitude from './Altitude'
import FlightControls from './FlightControls'
import { useTelemetryStore } from '../store/useStore'

const MainView = () => {
  const { telemetry } = useTelemetryStore()
  const battery = telemetry.battery || 0
  const signalStrength = telemetry.signal_strength || 0

  // Calculate number of signal bars (0-4)
  const signalBars = Math.ceil((signalStrength / 100) * 4)

  // Battery color based on level
  const batteryColor =
    battery > 50
      ? 'bg-green-500'
      : battery > 20
        ? 'bg-yellow-500'
        : 'bg-red-500'

  return (
    <div className="h-screen bg-black flex items-center justify-center font-sans text-green-600">
      <div className="w-420 h-262.5 p-10">
        <div className="grid h-full grid-cols-[80px_1fr_350px] grid-rows-[1fr_350px] gap-4">
          {/* Sidebar */}
          <div className="row-span-2 flex flex-col items-center justify-between rounded-2xl bg-main-panel py-6">
            <div className="flex flex-col gap-6">
              <div className="h-10 w-10 rounded-lg bg-[#1a1a1a]" />
              <div className="h-10 w-10 rounded-lg bg-[#1a1a1a]" />
              <div className="h-10 w-10 rounded-lg bg-[#1a1a1a]" />
            </div>
            <div className="h-10 w-10 rounded-full bg-[#1a1a1a]" />
          </div>
          {/* Top Middle - Primary View */}
          <div className="rounded-3xl bg-main-panel relative overflow-hidden">
            <CameraView />
          </div>
          {/* Top Right - Status Panel */}
          <div className="rounded-3xl bg-main-panel p-6 flex flex-col gap-4">
            {/* Top row - Network and Battery indicators */}
            <div className="flex gap-4 items-center justify-between pl-4 pr-4">
              {/* Network Signal */}
              <div className="flex items-center gap-2">
                <div className="flex gap-1 items-end">
                  <div
                    className={`w-1 h-2 ${signalBars >= 1 ? 'bg-green-500' : 'bg-gray-600'}`}
                  ></div>
                  <div
                    className={`w-1 h-3 ${signalBars >= 2 ? 'bg-green-500' : 'bg-gray-600'}`}
                  ></div>
                  <div
                    className={`w-1 h-4 ${signalBars >= 3 ? 'bg-green-500' : 'bg-gray-600'}`}
                  ></div>
                  <div
                    className={`w-1 h-5 ${signalBars >= 4 ? 'bg-green-500' : 'bg-gray-600'}`}
                  ></div>
                </div>
              </div>
              {/* Battery Level */}
              <div className="flex items-center gap-2">
                <div className="w-12 h-6 border-2 border-gray-400 rounded relative overflow-hidden p-0.5">
                  <div
                    className={`h-full ${batteryColor} rounded-sm`}
                    style={{ width: `${battery}%` }}
                  ></div>
                </div>
              </div>
            </div>
            {/* Bottom row - Drone component */}
            <div className="flex-1">
              <Altitude />
            </div>
          </div>
          {/* Bottom Middle - Controls/Telemetry */}
          <div className="rounded-3xl bg-main-panel p-6">
            <div className="flex h-full w-full gap-4">
              <div
                id="gauge"
                className="flex-1 flex flex-col items-center justify-center"
              >
                <div className="flex items-center justify-center p-3r scale-90">
                  <Compass />
                </div>
                <div>
                  <Orientation />
                </div>
              </div>
              <div
                id="buttons"
                className="flex-1 flex items-center justify-center"
              >
                <FlightControls />
              </div>
            </div>
          </div>
          {/* Bottom Right - Map/Compass */}
          <div className="rounded-3xl bg-main-panel">
            <CameraControls />
          </div>
        </div>
      </div>
    </div>
  )
}

export default MainView
