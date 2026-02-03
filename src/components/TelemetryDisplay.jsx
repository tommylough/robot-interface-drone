import { useTelemetryStore } from '../store/useStore'

const TelemetryDisplay = () => {
  const telemetry = useTelemetryStore((state) => state.telemetry)

  const getBatteryColor = (level) => {
    if (level > 50) return 'text-green-400'
    if (level > 20) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getSignalColor = (strength) => {
    if (strength > 70) return 'text-green-400'
    if (strength > 40) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getTempColor = (temp) => {
    if (temp < 40) return 'text-green-400'
    if (temp < 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  const compassHeading = ((telemetry.yaw * 57.2958 + 360) % 360).toFixed(0)

  return (
    <div className="bg-black/50 backdrop-blur-sm text-white p-4 rounded-lg space-y-3">
      <h3 className="text-sm font-bold uppercase tracking-wide border-b border-white/20 pb-2">
        Telemetry
      </h3>

      {/* Altitude & GPS */}
      <div className="grid grid-cols-2 gap-3 text-sm font-mono">
        <div>
          <div className="text-gray-400 text-xs">Altitude</div>
          <div className="text-lg font-bold text-green-400">
            {telemetry.altitude?.toFixed(2) || '0.00'}m
          </div>
        </div>

        <div>
          <div className="text-gray-400 text-xs">Target</div>
          <div className="text-lg font-bold text-blue-400">
            {telemetry.target?.toFixed(2) || '0.00'}
          </div>
        </div>
      </div>

      {/* Orientation */}
      {/*<div className="grid grid-cols-3 gap-2 text-xs font-mono">
        <div>
          <div className="text-gray-400">Roll</div>
          <div
            className={`font-bold ${Math.abs(telemetry.roll || 0) > 0.1 ? 'text-yellow-400' : 'text-white'}`}
          >
            {((telemetry.roll || 0) * 57.2958).toFixed(1)}°
          </div>
        </div>

        <div>
          <div className="text-gray-400">Pitch</div>
          <div
            className={`font-bold ${Math.abs(telemetry.pitch || 0) > 0.1 ? 'text-yellow-400' : 'text-white'}`}
          >
            {((telemetry.pitch || 0) * 57.2958).toFixed(1)}°
          </div>
        </div>

        <div>
          <div className="text-gray-400">Heading</div>
          <div className="font-bold text-cyan-400">{compassHeading}°</div>
        </div>
      </div>*/}

      {/* Battery & Signal */}
      {/*<div className="grid grid-cols-2 gap-3 text-xs font-mono">
        <div>
          <div className="text-gray-400">Battery</div>
          <div
            className={`text-lg font-bold ${getBatteryColor(telemetry.battery || 100)}`}
          >
            {telemetry.battery?.toFixed(1) || '100.0'}%
          </div>
        </div>

        <div>
          <div className="text-gray-400">Signal</div>
          <div
            className={`text-lg font-bold ${getSignalColor(telemetry.signal_strength || 100)}`}
          >
            {telemetry.signal_strength || 100}%
          </div>
        </div>
      </div>*/}

      {/* Temperatures */}
      <div className="space-y-1">
        <div className="text-gray-400 text-xs">Temperature</div>
        <div className="grid grid-cols-5 gap-2 text-xs font-mono">
          <div>
            <div className="text-gray-500">Body</div>
            <div
              className={`font-bold ${getTempColor(telemetry.temperatures?.body || 25)}`}
            >
              {telemetry.temperatures?.body?.toFixed(1) || '25.0'}°C
            </div>
          </div>
          <div>
            <div className="text-gray-500">FL</div>
            <div
              className={`font-bold ${getTempColor(telemetry.temperatures?.motors?.fl || 25)}`}
            >
              {telemetry.temperatures?.motors?.fl?.toFixed(1) || '25.0'}°C
            </div>
          </div>
          <div>
            <div className="text-gray-500">FR</div>
            <div
              className={`font-bold ${getTempColor(telemetry.temperatures?.motors?.fr || 25)}`}
            >
              {telemetry.temperatures?.motors?.fr?.toFixed(1) || '25.0'}°C
            </div>
          </div>
          <div>
            <div className="text-gray-500">RL</div>
            <div
              className={`font-bold ${getTempColor(telemetry.temperatures?.motors?.rl || 25)}`}
            >
              {telemetry.temperatures?.motors?.rl?.toFixed(1) || '25.0'}°C
            </div>
          </div>
          <div>
            <div className="text-gray-500">RR</div>
            <div
              className={`font-bold ${getTempColor(telemetry.temperatures?.motors?.rr || 25)}`}
            >
              {telemetry.temperatures?.motors?.rr?.toFixed(1) || '25.0'}°C
            </div>
          </div>
        </div>
      </div>

      {/* Wind & GPS */}
      <div className="grid grid-cols-2 gap-3 text-xs font-mono">
        <div>
          <div className="text-gray-400">Wind Speed</div>
          <div className="font-bold text-cyan-400">
            {telemetry.wind_speed?.toFixed(1) || '0.0'} m/s
          </div>
        </div>

        <div>
          <div className="text-gray-400">GPS</div>
          <div className="font-bold text-purple-400">
            {telemetry.gps?.lat?.toFixed(4) || '0.0000'},{' '}
            {telemetry.gps?.lon?.toFixed(4) || '0.0000'}
          </div>
        </div>
      </div>

      <div className="text-xs text-gray-500 pt-2 border-t border-white/10">
        Time: {telemetry.timestamp?.toFixed(2) || '0.00'}s
      </div>
    </div>
  )
}

export default TelemetryDisplay
