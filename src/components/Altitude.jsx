import { useState, useEffect, useMemo } from 'react'
import { useTelemetryStore } from '../store/useStore'

const Altitude = () => {
  const altitude = useTelemetryStore((state) => state.telemetry.altitude)
  const target = useTelemetryStore((state) => state.telemetry.target)

  // Convert meters to feet
  const altitudeFeet = altitude * 3.28084
  const targetFeet = target * 3.28084

  const [containerHeight, setContainerHeight] = useState(500)
  const scaleRef = useState(null)

  // Calculate visible range and arrow position
  const { visibleMax, arrowPosPercent } = useMemo(() => {
    if (altitudeFeet <= 30) {
      return {
        visibleMax: 40,
        arrowPosPercent: (altitudeFeet / 40) * 100,
      }
    } else {
      return {
        visibleMax: altitudeFeet / 0.75,
        arrowPosPercent: 75,
      }
    }
  }, [altitudeFeet])

  // Calculate ticks with adaptive density
  const ticks = useMemo(() => {
    const minLabelGap = 20
    const steps = [10, 50, 100, 500, 1000, 2000, 5000]

    let majorStep = 10
    for (let s of steps) {
      if ((s / visibleMax) * containerHeight >= minLabelGap) {
        majorStep = s
        break
      }
    }

    const result = []
    let val = 0
    while (val <= visibleMax) {
      const pos = (val / visibleMax) * 100
      const isMajor = val % (majorStep * 5) === 0
      result.push({ val, pos, isMajor })
      val += majorStep
    }

    return result
  }, [visibleMax, containerHeight])

  // Warning bar gradient stops
  const redStop = (10 / visibleMax) * 100
  const yellowStop = (30 / visibleMax) * 100

  // Color based on altitude
  const getColors = () => {
    if (altitudeFeet <= 10) {
      return {
        arrow: '#ff0000',
        bg: 'rgba(255, 0, 0, 0.3)',
        border: '#ff0000',
      }
    } else if (altitudeFeet <= 30) {
      return {
        arrow: '#ffff00',
        bg: 'rgba(255, 255, 0, 0.2)',
        border: '#ffff00',
      }
    } else {
      return {
        arrow: '#00ff00',
        bg: 'rgba(0, 255, 0, 0.1)',
        border: '#00ff00',
      }
    }
  }

  const colors = getColors()
  const pixelOffset = (arrowPosPercent / 100) * containerHeight

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
              #ff0000 0%, #ff0000 ${redStop}%, 
              #ffff00 ${redStop}%, #ffff00 ${yellowStop}%, 
              #00ff00 ${yellowStop}%, #00ff00 100%)`,
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
