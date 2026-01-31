import { useTelemetryStore } from '../store/useStore'

const Compass = () => {
  const { telemetry } = useTelemetryStore()
  const heading = telemetry.heading || 0
  const roll = telemetry.roll || 0
  const pitch = telemetry.pitch || 0

  const cardinalDirections = ['N', 'E', 'S', 'W']
  const degrees = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330]

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="relative h-64 w-64">
        {/* Artificial horizon background */}
        <div className="absolute inset-0 overflow-hidden rounded-full">
          <div
            className="absolute w-[200%] h-[200%] -left-1/2 -top-1/2"
            style={{
              transform: `rotate(${roll * (180 / Math.PI)}deg)`,
              transformOrigin: 'center',
            }}
          >
            {/* Sky (top half) */}
            <div
              className="absolute w-full h-1/2 bg-blue-500/40"
              style={{
                transform: `translateY(${-pitch * (180 / Math.PI) * 3}px)`,
              }}
            />
            {/* Ground (bottom half) */}
            <div
              className="absolute w-full h-1/2 bg-amber-900/40 bottom-0"
              style={{
                transform: `translateY(${-pitch * (180 / Math.PI) * 3}px)`,
              }}
            />
          </div>
        </div>

        {/* Rotating compass dial */}
        <div
          className="absolute inset-0 transition-transform duration-100"
          style={{ transform: `rotate(${-heading}deg)` }}
        >
          {/* Outer circle */}
          <div className="absolute inset-0 rounded-full border-2 border-gray-700" />

          {/* Degree markers and labels */}
          <svg className="absolute inset-0" viewBox="0 0 256 256">
            {degrees.map((degree) => {
              const angle = (degree - 90) * (Math.PI / 180)
              const radius = 115
              const x = 128 + radius * Math.cos(angle)
              const y = 128 + radius * Math.sin(angle)

              return (
                <text
                  key={degree}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-gray-400 text-xs"
                  transform={`rotate(${heading}, ${x}, ${y})`}
                  style={{
                    filter: 'drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))',
                  }}
                >
                  {degree}
                </text>
              )
            })}

            {/* Tick marks */}
            {Array.from({ length: 36 }).map((_, i) => {
              const degree = i * 10
              const angle = (degree - 90) * (Math.PI / 180)
              const innerRadius = 95
              const outerRadius = degree % 30 === 0 ? 105 : 100
              const x1 = 128 + innerRadius * Math.cos(angle)
              const y1 = 128 + innerRadius * Math.sin(angle)
              const x2 = 128 + outerRadius * Math.cos(angle)
              const y2 = 128 + outerRadius * Math.sin(angle)

              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  className="stroke-gray-600"
                  strokeWidth={degree % 30 === 0 ? 2 : 1}
                  style={{
                    filter: 'drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.8))',
                  }}
                />
              )
            })}
          </svg>

          {/* Cardinal directions */}
          {cardinalDirections.map((dir, i) => {
            const degree = i * 90
            const angle = (degree - 90) * (Math.PI / 180)
            const radius = 80
            const x = 128 + radius * Math.cos(angle)
            const y = 128 + radius * Math.sin(angle)

            return (
              <div
                key={dir}
                className="absolute text-2xl font-bold text-gray-300"
                style={{
                  left: `${x}px`,
                  top: `${y}px`,
                  transform: `translate(-50%, -50%) rotate(${heading}deg)`,
                  filter: 'drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.9))',
                }}
              >
                {dir}
              </div>
            )
          })}
        </div>

        {/* Center point */}
        <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-600" />

        {/* Green gradient cone */}
        <svg className="absolute inset-0" viewBox="0 0 256 256">
          <defs>
            <linearGradient
              id="greenConeGradient"
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop
                offset="0%"
                style={{ stopColor: '#10b981', stopOpacity: 0.6 }}
              />
              <stop
                offset="100%"
                style={{ stopColor: '#10b981', stopOpacity: 0 }}
              />
            </linearGradient>
            <clipPath id="circleClip">
              <circle cx="128" cy="128" r="118" />
            </clipPath>
          </defs>
          <polygon
            points="94,0 128,128 162,0"
            fill="url(#greenConeGradient)"
            clipPath="url(#circleClip)"
          />
        </svg>

        {/* Fixed heading needle pointing up */}
        <svg className="absolute inset-0" viewBox="0 0 256 256">
          <polygon points="128,100 118,128 138,128" fill="#ef4444" />
        </svg>
      </div>
    </div>
  )
}

export default Compass
