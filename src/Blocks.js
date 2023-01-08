import { reconciler } from "@react-three/fiber";
import * as THREE from "three";
export default function Block({
  geometry = new THREE.BoxGeometry(1, 1, 1),
  material = new THREE.MeshStandardMaterial({ color: "slategrey" }),
  position = [0, 0, 0],
  scale = [1, 1, 1],
  isCastShadow = true,
  rotation = [0, 0, 0],
}) {
  return (
    <group position={position} scale={scale}>
      {isCastShadow ? (
        <mesh
          geometry={geometry}
          material={material}
          position={[0, -0.1, 0]}
          rotation={rotation}
          receiveShadow
          castShadow
        ></mesh>
      ) : (
        <mesh
          geometry={geometry}
          material={material}
          position={[0, -0.1, 0]}
          rotation={rotation}
          receiveShadow
        ></mesh>
      )}
    </group>
  );
}
