# Drone Interface

A real-time drone control interface built with React and Webots. Control a DJI Mavic 2 Pro quadcopter simulation through an interactive web UI with live camera feed, tactical map, telemetry, and sensor-stabilized flight.

![Drone Interface](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

![Drone Interface UI](https://raw.githubusercontent.com/tommylough/robot-interface-drone/main/public/images/drone_ui.jpg)

## Features

- 🚁 **Real-time Drone Control** — Keyboard-driven 6-axis flight with acceleration model
- 📹 **Live Camera Feed** — Front camera streamed via WebSocket with HUD overlay
- 🎮 **Flight Modes** — Takeoff, Hover, Land, Return to Home, and Emergency Stop
- 🗺️ **Tactical Map** — Live canvas map built from Webots world objects with zoom and pan
- 📡 **Full Telemetry** — Altitude, GPS, heading, roll/pitch/yaw, battery, signal, motor temps, wind speed
- 🎯 **Camera Gimbal** — 3D trackball control for pitch/yaw with attitude HUD fade
- 🧭 **Compass & Artificial Horizon** — Live orientation display with pitch ladder
- 📊 **Altitude Scale** — Visual altitude indicator with color-coded warning bands
- 🔄 **PID Stabilization** — IMU/GPS/gyro-based stabilization with disturbance decay

## Tech Stack

**Frontend:**
- React 18
- React Three Fiber + Three.js
- Zustand (state management)
- Tailwind CSS
- Vite

**Backend:**
- Python 3
- Webots R2025a
- asyncio + websockets
- Pillow (image processing)

## Prerequisites

- Node.js 18+ and yarn or npm
- Python 3.8+
- Webots R2025a or later
- Python packages:
  ```bash
  pip install websockets pillow --break-system-packages
  ```

## Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd robot-interface
   ```

2. Install Node dependencies:
   ```bash
   yarn install
   ```

3. Verify Webots is installed at `/Applications/Webots.app` (macOS)

## Running the Project

### 1. Start Webots

Open Webots and load `./webots/worlds/flying-drone.wbt`, or run headless:

```bash
/Applications/Webots.app/Contents/MacOS/webots \
  --stream \
  --mode=run \
  --extern-urls \
  ./webots/worlds/flying-drone.wbt
```

The Python controller starts automatically. You'll see:
```
INFO:__main__:WebSocket running on ws://localhost:8765
```

### 2. Start the React Dev Server

```bash
yarn dev
```

Navigate to `http://localhost:5173`

Once both are running the interface connects automatically and the drone will be ready in idle mode.

## Controls

| Key | Action |
|-----|--------|
| **↑** | Increase altitude |
| **↓** | Decrease altitude |
| **W** | Accelerate forward |
| **S** | Accelerate backward |
| **A** | Strafe left |
| **D** | Strafe right |
| **Q** | Yaw left |
| **E** | Yaw right |

Forward/backward speed accumulates while W/S are held and persists when released. Hover mode clears speed and holds position.

## Flight Modes

| Mode | Behavior |
|------|----------|
| **Takeoff** | Climbs to 2.0m then switches to manual |
| **Hover** | Locks altitude, decays movement disturbances |
| **Land** | Staged descent, switches to idle at ground |
| **RTH** | Navigates back to takeoff position then lands |
| **Emergency Stop** | Immediately initiates landing |

## Project Structure

```
robot-interface/
├── src/
│   ├── components/
│   │   ├── WebotsConnector.jsx       # WebSocket connection, dispatches telemetry
│   │   ├── FlightControls.jsx        # Flight mode buttons + keyboard controls
│   │   ├── FlightControlsInfo.jsx    # Info overlay UI for flight controls
│   │   ├── CameraView.jsx            # Live camera feed with HUD overlay
│   │   ├── CameraControls.jsx        # 3D trackball gimbal control
│   │   ├── HUD.jsx                   # SVG HUD with artificial horizon + compass
│   │   ├── LinearCompass.jsx         # Top compass tape for HUD
│   │   ├── Compass.jsx               # Circular compass with artificial horizon
│   │   ├── Altitude.jsx              # Visual altitude scale + GPS + airspeed
│   │   ├── TacticalMap.jsx           # Canvas map from world object data
│   │   ├── TelemetryDisplay.jsx      # Full telemetry readout panel
│   │   ├── Orientation.jsx           # Roll/pitch/heading display
│   │   ├── Trackball.jsx             # R3F 3D trackball mesh
│   │   ├── MainView.jsx              # Layout and top-level UI
│   │   └── Experience.jsx            # R3F scene root
│   ├── hooks/
│   │   ├── useKeyboardFlightControls.js  # Keyboard input + drone command logic
│   │   └── useAltitudeScale.js           # Altitude scale calculations
│   ├── store/
│   │   └── useStore.js               # Zustand stores: drone, camera, telemetry
│   ├── App.jsx
│   └── main.jsx
├── webots/
│   ├── controllers/
│   │   └── flying/
│   │       ├── flying.py             # Main control loop entry point
│   │       ├── config.py             # PID constants and server config
│   │       ├── communication/
│   │       │   ├── websocket_server.py
│   │       │   └── telemetry.py
│   │       ├── control/
│   │       │   ├── pid_controller.py
│   │       │   └── flight_modes.py
│   │       ├── hardware/
│   │       │   ├── sensors.py
│   │       │   └── actuators.py
│   │       └── perception/
│   │           ├── camera_processor.py
│   │           └── world_mapper.py
│   └── worlds/
│       └── flying-drone.wbt
├── public/
│   └── images/
└── package.json
```

## Architecture

```
┌─────────────────────┐     WebSocket (8765)     ┌───────────────────────┐
│   React Frontend    │◄────────────────────────►│  Python Controller    │
│                     │                           │      (Webots)         │
│  FlightControls     │── flight_mode command ───►│  FlightModeManager    │
│  useKeyboard...     │── motor_command ─────────►│  PIDController        │
│  CameraControls     │── camera_control ────────►│  MotorController      │
│                     │                           │                       │
│  CameraView + HUD   │◄── camera frame ──────────│  CameraProcessor      │
│  TacticalMap        │◄── map_data ──────────────│  WorldMapper          │
│  Telemetry/Altitude │◄── telemetry ─────────────│  SensorManager        │
└─────────────────────┘                           └───────────────────────┘
```

## Configuration

### PID Constants (`config.py`)

```python
CONFIG = {
    'host': 'localhost',
    'port': 8765,
    'frame_interval': 2,       # Send every Nth frame
    'jpeg_quality': 85,        # Camera compression quality
    'k_vertical_thrust': 68.5, # Base hover thrust
    'k_vertical_offset': 0.6,
    'k_vertical_p': 3.0,       # Altitude P gain
    'k_roll_p': 50.0,          # Roll P gain
    'k_pitch_p': 20.0,         # Pitch P gain
}
```

### Control Sensitivity (`src/store/useStore.js`)

```javascript
sensitivity: 0.5  // Range: 0.1 to 1.0
```

## Troubleshooting

**Drone flips immediately** — Check starting position in `flying-drone.wbt`: `translation: 0 0 0.3`, `rotation: 0 0 1 0`

**WebSocket connection fails** — Verify the Python controller is running in the Webots console and port 8765 is not blocked

**No camera feed** — Camera device must be named `'camera'` in Webots; check the Webots console for errors

**Controls not responding** — Browser window must have focus; check `readyState: 1` in browser DevTools

**Tactical map not showing** — Map data is sent once at startup from `WorldMapper`; verify the WebSocket is connected before the world loads

## License

MIT

## Author

Tommy Lough — [GitHub](https://github.com/tommylough)
