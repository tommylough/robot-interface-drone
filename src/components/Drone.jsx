//import { useTelemetryStore } from '../store/useStore'
import SmallDrone from './SmallDrone'
import { Canvas } from '@react-three/fiber'
import { Float, Environment } from '@react-three/drei'

const Drone = () => {
  //const { telemetry } = useTelemetryStore()
  return (
    <Canvas
      className="inset-0! z-0!"
      style={{ pointerEvents: 'auto' }}
      camera={{
        fov: 45,
        near: 0.1,
        far: 200,
      }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <Environment preset="city" background blur={1} />
      <Float>
        <SmallDrone scale={6} />
      </Float>
    </Canvas>
  )
}

export default Drone
