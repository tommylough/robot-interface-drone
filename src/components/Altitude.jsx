import { useState } from 'react'
import { useTelemetryStore } from '../store/useStore'
import { useAltitudeScale, convertToFeet } from '../hooks/useAltitudeScale'

const Altitude = () => {
  const altitude = useTelemetryStore((state) => state.telemetry.altitude)
  const target = useTelemetryStore((state) => state.telemetry.target)
  const [containerHeight, setContainerHeight] = useState(500)

  const { altitudeFeet, ticks, colors, gradientStops, pixelOffset } = useAltitudeScale(
    altitude,
    containerHeight
  )
  const targetFeet = convertToFeet(target)

  return (
    <div
      className="flex flex-col items-start h-full w-full text-white p-10 pb-2"
      style={{ overflow: 'visible' }}
    >
      {/* Scale Container */}
      <div
        ref={(el) => {
          if (el && el.offsetHeight > 0) {
            setContainerHeight(el.offsetHeight)
          }
        }}
        className="relative w-0.5 h-[75%] bg-[#555] ml-8"
        style={{ overflow: 'visible' }}
      >
        {/* Warning Bar */}
        <div
          className="absolute left-0.5 bottom-0 w-2.5 h-full"
          style={{
            background: `linear-gradient(to top, 
              #ff0000 0%, #ff0000 ${gradientStops.red}%, 
              #ffff00 ${gradientStops.red}%, #ffff00 ${gradientStops.yellow}%, 
              #00ff00 ${gradientStops.yellow}%, #00ff00 100%)`,
          }}
        />

        {/* Altitude Indicator Arrow */}
        <div
          className="absolute left-[15px] z-10 transition-transform duration-200"
          style={{
            borderTop: '10px solid transparent',
            borderBottom: '10px solid transparent',
            borderRight: `15px solid ${colors.arrow}`,
            bottom: `${pixelOffset}px`,
          }}
        />

        {/* Drone Icon - separate from arrow for positioning */}
        <div
          className="absolute left-[80px] transition-transform duration-200 z-20 w-24 h-24"
          style={{
            bottom: `${pixelOffset + 11}px`,
            transform: 'translateY(50%)',
          }}
        >
          <img
            src="/images/drone.png"
            alt="drone"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Ticks */}
        {ticks.map((tick, i) => (
          <div
            key={i}
            className="absolute right-0 border-b-2 border-white"
            style={{
              bottom: `${tick.pos}%`,
              width: tick.isMajor ? '20px' : '15px',
              borderBottomWidth: tick.isMajor ? '3px' : '2px',
            }}
          >
            <span className="absolute right-[20px] translate-y-1/2 whitespace-nowrap text-[11px] text-[#ccc]">
              {tick.val}
            </span>
          </div>
        ))}
      </div>

      {/* Altitude Readout - at bottom */}
      <div
        className="px-4 py-3 text-base rounded text-center border mt-16 ml-2"
        style={{
          backgroundColor: colors.bg,
          borderColor: colors.border,
        }}
      >
        <div>
          Alt: <span className="font-bold">{Math.round(altitudeFeet)}</span> ft
        </div>
        {target > 0 && (
          <div className="text-sm mt-1 opacity-70">
            Tgt: {Math.round(targetFeet)} ft
          </div>
        )}
      </div>
    </div>
  )
}

export default Altitude
