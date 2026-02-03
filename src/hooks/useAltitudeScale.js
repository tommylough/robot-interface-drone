import { useMemo } from 'react'

const METERS_TO_FEET = 3.28084
const ALTITUDE_THRESHOLDS = {
  RED: 10,
  YELLOW: 30,
  LOW_RANGE: 40,
  HIGH_POSITION: 75
}

const COLOR_SCHEMES = {
  red: {
    arrow: '#ff0000',
    bg: 'rgba(255, 0, 0, 0.3)',
    border: '#ff0000'
  },
  yellow: {
    arrow: '#ffff00',
    bg: 'rgba(255, 255, 0, 0.2)',
    border: '#ffff00'
  },
  green: {
    arrow: '#00ff00',
    bg: 'rgba(0, 255, 0, 0.1)',
    border: '#00ff00'
  }
}

export const useAltitudeScale = (altitudeMeters, containerHeight) => {
  const altitudeFeet = altitudeMeters * METERS_TO_FEET

  const scale = useMemo(() => {
    if (altitudeFeet <= ALTITUDE_THRESHOLDS.YELLOW) {
      return {
        visibleMax: ALTITUDE_THRESHOLDS.LOW_RANGE,
        arrowPosPercent: (altitudeFeet / ALTITUDE_THRESHOLDS.LOW_RANGE) * 100
      }
    }
    return {
      visibleMax: altitudeFeet / 0.75,
      arrowPosPercent: ALTITUDE_THRESHOLDS.HIGH_POSITION
    }
  }, [altitudeFeet])

  const ticks = useMemo(() => {
    const minLabelGap = 20
    const steps = [10, 50, 100, 500, 1000, 2000, 5000]

    let majorStep = 10
    for (const s of steps) {
      if ((s / scale.visibleMax) * containerHeight >= minLabelGap) {
        majorStep = s
        break
      }
    }

    const result = []
    let val = 0
    while (val <= scale.visibleMax) {
      const pos = (val / scale.visibleMax) * 100
      const isMajor = val % (majorStep * 5) === 0
      result.push({ val, pos, isMajor })
      val += majorStep
    }

    return result
  }, [scale.visibleMax, containerHeight])

  const colors = useMemo(() => {
    if (altitudeFeet <= ALTITUDE_THRESHOLDS.RED) return COLOR_SCHEMES.red
    if (altitudeFeet <= ALTITUDE_THRESHOLDS.YELLOW) return COLOR_SCHEMES.yellow
    return COLOR_SCHEMES.green
  }, [altitudeFeet])

  const gradientStops = useMemo(() => ({
    red: (ALTITUDE_THRESHOLDS.RED / scale.visibleMax) * 100,
    yellow: (ALTITUDE_THRESHOLDS.YELLOW / scale.visibleMax) * 100
  }), [scale.visibleMax])

  const pixelOffset = (scale.arrowPosPercent / 100) * containerHeight

  return {
    altitudeFeet,
    scale,
    ticks,
    colors,
    gradientStops,
    pixelOffset
  }
}

export const convertToFeet = (meters) => meters * METERS_TO_FEET
