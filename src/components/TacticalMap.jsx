import { useEffect, useRef, useState } from 'react'
import { useTelemetryStore } from '../store/useStore'

const TacticalMap = () => {
  const canvasRef = useRef(null)
  const [mapData, setMapData] = useState(null)
  const { telemetry } = useTelemetryStore()
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  useEffect(() => {
    // Listen for map data from WebSocket
    const handleMapData = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'map_data') {
          setMapData(data.data)
        }
      } catch (e) {
        // Ignore parse errors
      }
    }

    // This will be handled by WebotsConnector
    window.addEventListener('webots-message', handleMapData)
    return () => window.removeEventListener('webots-message', handleMapData)
  }, [])

  const handleWheel = (e) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setZoom((prevZoom) => Math.max(0.5, Math.min(5, prevZoom * delta)))
  }

  const handleMouseDown = (e) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
  }

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (!canvasRef.current || !mapData) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height

    // Clear canvas
    ctx.fillStyle = '#1a1a1a'
    ctx.fillRect(0, 0, width, height)

    // Get drone position and heading
    const droneX = telemetry.x || 0
    const droneY = telemetry.y || 0
    const droneHeading = (telemetry.yaw || 0) * (180 / Math.PI)

    // Map bounds from world
    const bounds = mapData.bounds
    const worldWidth = bounds.max_x - bounds.min_x
    const worldHeight = bounds.max_y - bounds.min_y

    // Scale factor with zoom
    const baseScale = Math.min(width / worldWidth, height / worldHeight) * 0.9
    const scale = baseScale * zoom

    // Save context for rotation
    ctx.save()
    
    // Translate to center of canvas
    ctx.translate(width / 2, height / 2)
    
    // Rotate map so drone's heading is always up (subtract 90 degree offset)
    ctx.rotate(((droneHeading - 90) * Math.PI) / 180)
    
    // Apply pan offset
    ctx.translate(pan.x, pan.y)

    // Convert world coords to canvas coords (relative to drone)
    const toCanvas = (x, y) => {
      const relX = x - droneX
      const relY = y - droneY
      return {
        x: relX * scale,
        y: -relY * scale // Flip Y axis
      }
    }

    // Draw grid (centered on drone)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.lineWidth = 1
    const gridSize = 50
    const gridRange = 400
    
    for (let i = -gridRange; i <= gridRange; i += gridSize) {
      // Vertical lines
      const start = toCanvas(droneX + i, droneY - gridRange)
      const end = toCanvas(droneX + i, droneY + gridRange)
      ctx.beginPath()
      ctx.moveTo(start.x, start.y)
      ctx.lineTo(end.x, end.y)
      ctx.stroke()

      // Horizontal lines
      const start2 = toCanvas(droneX - gridRange, droneY + i)
      const end2 = toCanvas(droneX + gridRange, droneY + i)
      ctx.beginPath()
      ctx.moveTo(start2.x, start2.y)
      ctx.lineTo(end2.x, end2.y)
      ctx.stroke()
    }

    // Draw objects
    mapData.objects.forEach((obj) => {
      const pos = toCanvas(obj.position.x, obj.position.y)

      // Set color based on category
      let color = '#888888'
      let size = 4

      switch (obj.category) {
        case 'windmill':
          color = '#3b82f6'
          size = 8
          break
        case 'building':
          color = '#f97316' // Orange
          size = 10
          break
        case 'tree':
          color = '#22c55e'
          size = 3
          break
        case 'vehicle':
          color = '#eab308'
          size = 6
          break
        case 'road':
          color = '#6b7280'
          size = 2
          break
        default:
          color = '#888888'
          size = 4
      }

      // Draw object
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2)
      ctx.fill()

      // Draw label for larger objects
      if (size > 5) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
        ctx.font = '10px monospace'
        ctx.fillText(obj.type, pos.x + size + 2, pos.y + 3)
      }
    })

    // Restore context after drawing map elements
    ctx.restore()

    // Draw drone icon at center (always fixed position, always pointing up)
    const size = 24
    
    ctx.save()
    ctx.translate(width / 2, height / 2)
    
    // Draw arrow shape pointing up
    ctx.fillStyle = '#ef4444' // Red
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2
    
    ctx.beginPath()
    // Arrow point
    ctx.moveTo(0, -size)
    // Right side
    ctx.lineTo(size * 0.4, -size * 0.3)
    ctx.lineTo(size * 0.25, -size * 0.3)
    ctx.lineTo(size * 0.25, size * 0.6)
    // Bottom right
    ctx.lineTo(-size * 0.25, size * 0.6)
    ctx.lineTo(-size * 0.25, -size * 0.3)
    // Left side
    ctx.lineTo(-size * 0.4, -size * 0.3)
    ctx.closePath()
    
    ctx.fill()
    ctx.stroke()
    ctx.restore()

    // Draw position text at center
    ctx.fillStyle = '#ffffff'
    ctx.font = '12px monospace'
    ctx.fillText(
      `(${droneX.toFixed(1)}, ${droneY.toFixed(1)})`,
      width / 2 + 15,
      height / 2 - 15
    )

    // Draw compass rose showing north
    ctx.save()
    ctx.translate(width - 40, 40)
    ctx.rotate(((droneHeading - 90) * Math.PI) / 180)
    
    // North indicator
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 14px monospace'
    ctx.textAlign = 'center'
    ctx.fillText('N', 0, -15)
    
    // Arrow pointing north
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.moveTo(0, -10)
    ctx.lineTo(5, 0)
    ctx.lineTo(-5, 0)
    ctx.closePath()
    ctx.fill()
    ctx.restore()

    // Draw legend
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
    ctx.fillRect(10, 10, 120, 140)

    const legend = [
      { color: '#ef4444', label: 'Drone' },
      { color: '#3b82f6', label: 'Windmill' },
      { color: '#f97316', label: 'Building' },
      { color: '#22c55e', label: 'Tree' },
      { color: '#eab308', label: 'Vehicle' },
      { color: '#6b7280', label: 'Road' },
    ]

    legend.forEach((item, i) => {
      const y = 30 + i * 20
      ctx.fillStyle = item.color
      ctx.beginPath()
      ctx.arc(25, y, 5, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#ffffff'
      ctx.font = '12px monospace'
      ctx.fillText(item.label, 40, y + 4)
    })
  }, [mapData, telemetry.x, telemetry.y, telemetry.yaw, zoom, pan])

  if (!mapData) {
    return (
      <div className="w-full h-full bg-gray-900 rounded flex items-center justify-center text-white">
        <div className="text-center">
          <div className="text-sm opacity-50">Waiting for map data...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full bg-gray-900 rounded relative touch-none">
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        className="w-full h-full cursor-move"
        style={{ touchAction: 'none' }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      <div className="absolute bottom-2 right-2 text-white text-xs opacity-50 pointer-events-none">
        Zoom: {zoom.toFixed(1)}x | Scroll to zoom, drag to pan<br />
        Heading: {((telemetry.yaw || 0) * (180 / Math.PI)).toFixed(0)}°
      </div>
    </div>
  )
}

export default TacticalMap
