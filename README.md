# Drone Interface

A real-time drone control interface built with React Three Fiber and Webots. Control a DJI Mavic 2 Pro quadcopter simulation through an interactive web interface with live camera feed and sensor-stabilized flight.

![Drone Interface](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## Features

- 🚁 **Real-time Drone Control** - Fly a simulated DJI Mavic 2 Pro with keyboard controls
- 📹 **Live Camera Feed** - Stream video from the drone's front camera via WebSocket
- 🎮 **6-Axis Control** - Full control over altitude, pitch, roll, and yaw
- 🔄 **Auto-Stabilization** - PID-controlled flight using IMU, GPS, and gyro sensors
- 🎨 **3D Visualization** - React Three Fiber canvas for future HUD elements
- 📊 **Real-time Telemetry** - Live altitude, roll, and pitch data streaming

## Tech Stack

**Frontend:**
- React 18
- React Three Fiber (@react-three/fiber, @react-three/drei)
- Zustand (state management)
- Vite (build tool)
- Tailwind CSS

**Backend:**
- Python 3
- Webots R2025a (robotics simulator)
- WebSockets (asyncio, websockets)
- Pillow (image processing)

## Prerequisites

- **Node.js** 18+ and npm/yarn
- **Python** 3.8+
- **Webots** R2025a or later
- **Python packages:**
  ```bash
  pip install websockets pillow --break-system-packages
  ```

## Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd robot-interface
   ```

2. **Install Node dependencies:**
   ```bash
   yarn install
   # or
   npm install
   ```

3. **Verify Webots installation:**
   - Webots should be installed at `/Applications/Webots.app` (macOS)
   - Ensure the Mavic2Pro robot model is available

## Running the Project

### 1. Start Webots Simulation

**Option A: Using Webots GUI**
```bash
open /Applications/Webots.app
```
Then open `./webots/worlds/flying-drone.wbt`

**Option B: Command line (headless)**
```bash
/Applications/Webots.app/Contents/MacOS/webots \
  --stream \
  --mode=run \
  --extern-urls \
  ./webots/worlds/flying-drone.wbt
```

The Python controller will automatically start and you'll see:
```
INFO:__main__:WebSocket running on ws://localhost:8765
INFO:__main__:Drone ready!
```

### 2. Start React Development Server

In a new terminal:
```bash
yarn dev
# or
npm run dev
```

Navigate to `http://localhost:5173` (or the port shown in your terminal)

### 3. Connect and Fly!

Once both servers are running, the interface will automatically connect. You should see:
- "Connected to Webots Python controller" in browser console
- Live camera feed in the interface
- The drone will automatically take off and stabilize

## Controls

| Key | Action |
|-----|--------|
| **↑** | Increase altitude |
| **↓** | Decrease altitude |
| **W** | Pitch forward (move forward) |
| **S** | Pitch backward (move backward) |
| **A** | Roll left (strafe left) |
| **D** | Roll right (strafe right) |
| **Q** | Yaw left (rotate counter-clockwise) |
| **E** | Yaw right (rotate clockwise) |

The drone uses PID stabilization, so it will automatically level itself when you release controls.

## Project Structure

```
robot-interface/
├── src/
│   ├── components/
│   │   ├── WebotsConnector.jsx    # WebSocket connection manager
│   │   ├── SimulationControls.jsx  # Keyboard input handler
│   │   ├── CameraView.jsx          # Live camera feed display
│   │   └── Experience.jsx          # R3F 3D scene
│   ├── store/
│   │   └── useStore.js             # Zustand state management
│   ├── App.jsx                     # Main application component
│   └── main.jsx                    # Application entry point
├── webots/
│   ├── controllers/
│   │   └── flying/
│   │       └── flying.py           # Python drone controller
│   └── worlds/
│       └── flying-drone.wbt        # Webots world file
├── public/                         # Static assets
└── package.json
```

## How It Works

### Architecture

```
┌─────────────────┐     WebSocket      ┌──────────────────┐
│  React Frontend │◄──────(8765)──────►│ Python Controller│
│                 │                     │    (Webots)      │
│  - Keyboard     │    Commands         │                  │
│  - Camera View  │◄───────────────────│  - IMU/GPS/Gyro  │
│  - Telemetry    │    Camera + Data    │  - PID Control   │
└─────────────────┘                     │  - Motor Control │
                                        └──────────────────┘
```

### Control Flow

1. **User Input** → Keyboard events captured in React
2. **Command Generation** → Converted to vertical/roll/pitch/yaw values
3. **WebSocket Transmission** → JSON commands sent to Python controller
4. **Sensor Reading** → IMU, GPS, gyro values read from Webots
5. **PID Stabilization** → Control algorithms compute motor adjustments
6. **Motor Actuation** → Propeller velocities set on drone
7. **Feedback Loop** → Camera and telemetry streamed back to UI

### Stabilization System

The drone uses a PID (Proportional-Integral-Derivative) control system based on the official DJI Mavic 2 Pro controller:

- **Roll/Pitch Stabilization:** Maintains level flight using IMU and gyroscope
- **Altitude Control:** GPS-based altitude holding with cubic scaling
- **User Commands:** Applied as "disturbances" on top of stabilization

PID Constants (tunable in `flying.py`):
```python
'k_vertical_thrust': 68.5,  # Base hover thrust
'k_vertical_p': 3.0,        # Altitude PID gain
'k_roll_p': 50.0,           # Roll PID gain
'k_pitch_p': 20.0,          # Pitch PID gain
```

## Configuration

### Adjust Control Sensitivity

**In React** (`src/store/useStore.js`):
```javascript
export const useDroneStore = zustandCreate((set) => ({
  sensitivity: 0.5, // Range: 0.1 to 1.0
  // ...
}))
```

**In Python** (`webots/controllers/flying/flying.py`):
```python
current_disturbances['roll'] = cmd['roll'] * -0.8
current_disturbances['pitch'] = cmd['pitch'] * -1.2
current_disturbances['yaw'] = cmd['yaw'] * -1.3
```

### Camera Quality

In `flying.py` CONFIG:
```python
CONFIG = {
    'frame_interval': 2,    # Send every Nth frame (2 = 30fps)
    'jpeg_quality': 85,     # JPEG compression quality (1-100)
}
```

## Troubleshooting

### Drone Flips Over Immediately
- **Check starting position:** Drone should start on ground with `translation: 0 0 0.3` and `rotation: 0 0 1 0`
- Edit `flying-drone.wbt` or use Webots UI to reset position

### WebSocket Connection Fails
- Verify Python controller is running (check Webots console)
- Ensure port 8765 is not blocked by firewall
- Check browser console for connection errors

### No Camera Feed
- Camera device is named `'camera'` in Webots
- Verify camera is enabled in controller
- Check browser console for WebSocket messages

### Controls Not Responding
- Browser window must have focus
- Check keyboard event listeners in browser DevTools
- Verify WebSocket shows `readyState: 1` (OPEN)

### Drone Drifts/Unstable
- Adjust PID constants in `flying.py` CONFIG
- Reduce disturbance multipliers
- Check sensor readings in Webots console

## Future Enhancements

- [ ] Visual HUD with altitude/heading display in R3F scene
- [ ] Waypoint navigation system
- [ ] Autonomous flight modes (orbit, follow, return-to-home)
- [ ] Multiple drone support
- [ ] Joystick/gamepad support
- [ ] Recording and playback of flight paths
- [ ] Obstacle avoidance using LIDAR
- [ ] First-person view (FPV) mode

## Development

### Building for Production
```bash
yarn build
# or
npm run build
```

Output will be in `dist/` directory.

### Code Style
- React components use functional components with hooks
- Python follows PEP 8 style guide
- Semicolons omitted in JavaScript (per Vite config)

## License

MIT License - feel free to use this project for learning or commercial purposes.

## Acknowledgments

- Based on the official [Webots Mavic 2 Pro example](https://cyberbotics.com/doc/guide/mavic-2-pro)
- PID control system adapted from Cyberbotics' sample controller
- Built as part of exploring 3D web interfaces for robotics

## Author

Tommy Lough - [GitHub Profile](https://github.com/tommylough)

---

**Questions or Issues?** Please open an issue on GitHub or reach out!
