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

    // Map bounds from world
    const bounds = mapData.bounds
    const worldWidth = bounds.max_x - bounds.min_x
    const worldHeight = bounds.max_y - bounds.min_y

    // Scale factor to fit world into canvas with zoom
    const baseScale = Math.min(width / worldWidth, height / worldHeight) * 0.9
    const scale = baseScale * zoom
    const offsetX = width / 2 + pan.x
    const offsetY = height / 2 + pan.y

    // Convert world coords to canvas coords
    const toCanvas = (x, y) => {
      return {
        x: offsetX + x * scale,
        y: offsetY - y * scale // Flip Y axis
      }
    }

    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.lineWidth = 1
    for (let i = -200; i <= 200; i += 50) {
      // Vertical lines
      const start = toCanvas(i, -200)
      const end = toCanvas(i, 200)
      ctx.beginPath()
      ctx.moveTo(start.x, start.y)
      ctx.lineTo(end.x, end.y)
      ctx.stroke()

      // Horizontal lines
      const start2 = toCanvas(-200, i)
      const end2 = toCanvas(200, i)
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
          color = '#ef4444'
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

    // Draw drone position
    if (telemetry.x !== undefined && telemetry.y !== undefined) {
      const dronePos = toCanvas(telemetry.x, telemetry.y)

      // Draw drone icon
      ctx.fillStyle = '#10b981'
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 2

      // Triangle pointing in heading direction
      const heading = (telemetry.yaw || 0) * (180 / Math.PI)
      const size = 12
      ctx.save()
      ctx.translate(dronePos.x, dronePos.y)
      ctx.rotate((-heading * Math.PI) / 180)
      ctx.beginPath()
      ctx.moveTo(0, -size)
      ctx.lineTo(size / 2, size / 2)
      ctx.lineTo(-size / 2, size / 2)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
      ctx.restore()

      // Draw position text
      ctx.fillStyle = '#ffffff'
      ctx.font = '12px monospace'
      ctx.fillText(
        `(${telemetry.x?.toFixed(1)}, ${telemetry.y?.toFixed(1)})`,
        dronePos.x + 15,
        dronePos.y - 15
      )
    }

    // Draw legend
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
    ctx.fillRect(10, 10, 120, 140)

    const legend = [
      { color: '#10b981', label: 'Drone' },
      { color: '#3b82f6', label: 'Windmill' },
      { color: '#ef4444', label: 'Building' },
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
        Zoom: {zoom.toFixed(1)}x | Scroll to zoom, drag to pan
      </div>
    </div>
  )
}

export default TacticalMap
