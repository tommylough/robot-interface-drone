const LinearCompass = ({ heading, compassHeight = 225 }) => {
  const cardinalDirections = [
    { label: 'N', deg: 0 },
    { label: 'E', deg: 90 },
    { label: 'S', deg: 180 },
    { label: 'W', deg: 270 },
  ]

  return (
    <g>
      {/* Compass background */}
      <rect
        x="0"
        y="0"
        width="400"
        height={compassHeight}
        fill="none"
        /*stroke="rgba(255,255,255,0.15)"*/
        strokeWidth="1"
      />

      {/* Compass tape - shows cardinal directions */}
      <g clipPath="url(#compassClip)">
        {cardinalDirections.map((dir) => {
          // Calculate position based on heading
          const offset = ((dir.deg - heading + 360) % 360) - 180
          const x = 200 + offset * 1.5 // Scale factor for spacing

          return (
            <text
              key={dir.label}
              x={x}
              y="22"
              fill="rgba(255,255,255,0.9)"
              fontSize="8"
              fontFamily="monospace"
              fontWeight="bold"
              textAnchor="middle"
            >
              {dir.label}
            </text>
          )
        })}

        {/* Add degree marks every 30 degrees */}
        {Array.from({ length: 12 }).map((_, i) => {
          const deg = i * 30
          const offset = ((deg - heading + 360) % 360) - 180
          const x = 200 + offset * 1.5

          return (
            <g key={deg}>
              <line
                x1={x}
                y1="5"
                x2={x}
                y2="0"
                stroke="rgba(255,255,255,0.6)"
                strokeWidth="1"
              />
              <text
                x={x}
                y="12"
                fill="rgba(255,255,255,0.7)"
                fontSize="6"
                fontFamily="monospace"
                textAnchor="middle"
              >
                {deg}
              </text>
            </g>
          )
        })}
      </g>

      {/* Clip path for compass tape */}
      <defs>
        <clipPath id="compassClip">
          <rect x="0" y="0" width="400" height={compassHeight} />
        </clipPath>
      </defs>

      {/* Center indicator triangle */}
      <path
        d={`M 200,${compassHeight} L 195,${compassHeight + 6} L 205,${compassHeight + 6} Z`}
        fill="rgba(255,255,255,0.9)"
      />
    </g>
  )
}

export default LinearCompass
