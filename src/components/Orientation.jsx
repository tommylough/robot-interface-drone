import { useTelemetryStore } from '../store/useStore'

const Orientation = () => {
  const { telemetry } = useTelemetryStore()
  const heading = telemetry.heading || 0
  const roll = telemetry.roll || 0
  const pitch = telemetry.pitch || 0

  return (
    <div className="flex items-center justify-center h-full">
      <div className="flex gap-8 font-mono">
        <div className="text-center">
          <h1 className="ui-green text-lg">Roll</h1>
          <div
            className={`font-bold ${Math.abs(telemetry.roll || 0) > 0.1 ? 'text-yellow-400' : 'text-white'}`}
          >
            {((roll || 0) * 57.2958).toFixed(1)}°
          </div>
        </div>

        <div className="text-center">
          <div className="ui-green text-lg">Pitch</div>
          <div
            className={`font-bold ${Math.abs(telemetry.pitch || 0) > 0.1 ? 'text-yellow-400' : 'text-white'}`}
          >
            {((pitch || 0) * 57.2958).toFixed(1)}°
          </div>
        </div>

        <div className="text-center">
          <div className="ui-green text-lg">Heading</div>
          <div className="font-bold text-cyan-400">{heading.toFixed(1)}°</div>
        </div>
      </div>
    </div>
  )
}

export default Orientation
