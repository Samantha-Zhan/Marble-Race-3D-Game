import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

export default function Lights() {
  const light = useRef();
  useFrame((state) => {
    const cameraPosition = state.camera.position;
    light.current.position.z = cameraPosition.z + 1 - 4;
    // only update an object if position/rotation/scale change and they are in the scene
    light.current.target.position.z = cameraPosition.z - 4;
    light.current.target.updateMatrixWorld();
  });
  return (
    <>
      <directionalLight
        ref={light}
        castShadow
        position={[4, 4, 1]}
        intensity={1.5}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={1}
        shadow-camera-far={10}
        shadow-camera-top={10}
        shadow-camera-right={10}
        shadow-camera-bottom={-10}
        shadow-camera-left={-10}
      />
      <ambientLight intensity={0.5} />
    </>
  );
}
