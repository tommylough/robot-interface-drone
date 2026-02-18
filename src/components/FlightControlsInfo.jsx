const FlightControlsInfo = () => {
  return (
    <div className="space-y-2">
      <div className="text-white text-sm space-y-1">
        <p className="font-bold">Drone Controls:</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
          <div>W/S: Forward/Back (accel)</div>
          <div>A/D: Strafe Left/Right</div>
          <div>Q/E: Yaw Left/Right</div>
          <div>↑/↓: Altitude Up/Down</div>
        </div>
      </div>
    </div>
  )
}

export default FlightControlsInfo
