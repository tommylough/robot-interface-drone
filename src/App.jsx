import { Canvas } from '@react-three/fiber'
import { Stats } from '@react-three/drei'
import WebotsConnector from './components/WebotsConnector'
import Experience from './components/Experience'
import SimulationControls from './components/SimulationControls'
import CameraView from './components/CameraView'
import TelemetryDisplay from './components/TelemetryDisplay'
import FlightControls from './components/FlightControls'
import CameraControls from './components/CameraControls'

export default function App() {
  return (
    <div className="h-screen w-full relative bg-slate-900">
      <WebotsConnector />

      <Canvas
        className="!absolute !inset-0 !z-0"
        style={{ pointerEvents: 'auto' }}
        camera={{
          fov: 45,
          near: 0.1,
          far: 200,
          position: [-4, 3, 6],
        }}
      >
        <Experience />
        <Stats className="!left-auto !right-4 !top-4" />
      </Canvas>

      <div className="absolute top-4 left-4 z-20 pointer-events-auto space-y-4 max-w-md">
        <h1 className="text-red-500 font-bold text-2xl">Robot Interface</h1>
        <FlightControls />
        <SimulationControls />
        <TelemetryDisplay />
        <CameraControls />
        <CameraView />
      </div>
    </div>
  )
}
