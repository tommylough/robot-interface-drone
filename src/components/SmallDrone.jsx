import { useRef, useEffect, forwardRef } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'

const filePath = '/models/drone.glb'

const SmallDrone = forwardRef((props, ref) => {
  const model = useGLTF(filePath)
  const { scene, animations } = model
  const { actions } = useAnimations(animations, scene)

  useEffect(() => {
    const action = actions.Wings
    if (action) {
      action.timeScale = 0.8
      action.play()
    }
  }, [actions])

  return (
    <group ref={ref} {...props} dispose={null}>
      <primitive object={scene} />
    </group>
  )
})

export default SmallDrone

useGLTF.preload(filePath)
