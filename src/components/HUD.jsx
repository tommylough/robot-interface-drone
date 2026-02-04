import { useTelemetryStore, useCameraStore } from '../store/useStore'

const HUD = () => {
  const { telemetry } = useTelemetryStore()
  const attitudeOpacity = useCameraStore((state) => state.attitudeOpacity)

  // Convert radians to degrees
  const pitchDeg = (telemetry.pitch * 180) / Math.PI
  const rollDeg = (telemetry.roll * 180) / Math.PI

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg className="w-full h-full" viewBox="0 0 400 225">
        {/* Center Crosshair - always visible */}
        <g transform="translate(200, 112.5)">
          {/* Center dot */}
          <circle cx="0" cy="0" r="2" fill="rgba(255,255,255,0.8)" />

          {/* Crosshair lines */}
          <line
            x1="-30"
            y1="0"
            x2="-10"
            y2="0"
            stroke="rgba(255,255,255,0.8)"
            strokeWidth="1.5"
          />
          <line
            x1="10"
            y1="0"
            x2="30"
            y2="0"
            stroke="rgba(255,255,255,0.8)"
            strokeWidth="1.5"
          />
          <line
            x1="0"
            y1="-30"
            x2="0"
            y2="-10"
            stroke="rgba(255,255,255,0.8)"
            strokeWidth="1.5"
          />
          <line
            x1="0"
            y1="10"
            x2="0"
            y2="30"
            stroke="rgba(255,255,255,0.8)"
            strokeWidth="1.5"
          />
        </g>

        {/* Artificial Horizon - fades with camera movement */}
        <g opacity={attitudeOpacity} transform="translate(200, 112.5)">
          <g transform={`rotate(${rollDeg})`}>
            <g transform={`translate(0, ${-pitchDeg * 2})`}>
              {/* Horizon line */}
              <line
                x1="-150"
                y1="0"
                x2="150"
                y2="0"
                stroke="rgba(255,255,255,0.8)"
                strokeWidth="1"
              />

              {/* Pitch ladder lines */}
              {[-20, -10, 10, 20].map((angle) => {
                const y = -angle * 2
                const lineWidth = 60
                return (
                  <line
                    key={angle}
                    x1={-lineWidth / 2}
                    y1={y}
                    x2={lineWidth / 2}
                    y2={y}
                    stroke="rgba(255,255,255,0.6)"
                    strokeWidth="1"
                  />
                )
              })}
            </g>
          </g>

          {/* Aircraft symbol (fixed in center) */}
          <g>
            {/* Center chevron */}
            <polyline
              points="-10,0 0, 7 10,0"
              stroke="rgba(0,255,0,0.9)"
              strokeWidth="2"
              fill="none"
              strokeLinejoin="miter"
            />
          </g>
        </g>
      </svg>
    </div>
  )
}

export default HUD
