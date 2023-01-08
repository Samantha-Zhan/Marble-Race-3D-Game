import Block from "./Blocks";
import * as THREE from "three";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, Float } from "@react-three/drei";

THREE.ColorManagement.legacyMode = false;
const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const discGeometry = new THREE.RingGeometry(1, 1.5, 32);
const floor1Material = new THREE.MeshStandardMaterial({ color: "limegreen" });
const floor2Material = new THREE.MeshStandardMaterial({
  color: "greenyellow",
});
const obstacleMaterial = new THREE.MeshStandardMaterial({
  color: "orangered",
  side: THREE.DoubleSide,
});
const wallMaterial = new THREE.MeshStandardMaterial({ color: "slategrey" });

function SpecialBlock({ position = [0, 0, 0] }) {
  return (
    <Block
      geometry={boxGeometry}
      scale={[4, 0.2, 4]}
      material={floor1Material}
      isCastShadow={false}
      position={position}
    />
  );
}

function NormalBlock() {
  return (
    <Block
      geometry={boxGeometry}
      scale={[4, 0.2, 4]}
      material={floor2Material}
      isCastShadow={false}
    />
  );
}

function SpinnerBlock({ position = [0, 0, 0] }) {
  const obstacle = useRef();

  const [speed] = useState(
    () => (Math.random() >= 0.5 ? -1 : 1) * (Math.random() + 0.2)
  );

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    const rotation = new THREE.Quaternion();
    rotation.setFromEuler(new THREE.Euler(0, time * speed, 0));
    obstacle.current.setNextKinematicRotation(rotation);
  }, []);

  return (
    <group position={position}>
      <RigidBody friction={0} ref={obstacle} type="kinematicPosition">
        <mesh
          geometry={boxGeometry}
          material={obstacleMaterial}
          position={[0, 0.25, 0]}
          scale={[3.5, 0.3, 0.3]}
          restitution={0.2}
          receiveShadow
          castShadow
        />
      </RigidBody>
      <NormalBlock />
    </group>
  );
}

function AxeBlock({ position = [0, 0, 0] }) {
  const obstacle = useRef();

  const [speed] = useState(
    () => (Math.random() >= 0.5 ? -1 : 1) * (Math.random() + 0.2)
  );

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    obstacle.current.setNextKinematicTranslation({
      x: position[0] + Math.sin(time) * 1.25,
      y: position[1] + 0.5,
      z: position[2],
    });
  }, []);

  return (
    <group position={position}>
      <RigidBody ref={obstacle} friction={0} type="kinematicPosition">
        <mesh
          geometry={boxGeometry}
          material={obstacleMaterial}
          position={[0, 0.3, 0]}
          scale={[1.5, 1.5, 0.3]}
          restitution={0.2}
          receiveShadow
          castShadow
        />
      </RigidBody>
      <NormalBlock />
    </group>
  );
}

function LimboBlock({ position = [0, 0, 0] }) {
  const obstacle = useRef();

  const [timeOffset] = useState(() => Math.random() * Math.PI * 2);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    obstacle.current.setNextKinematicTranslation({
      x: position[0],
      y: position[1] + Math.sin(time + timeOffset) + 1,
      z: position[2],
    });
  }, []);

  return (
    <group position={position}>
      <RigidBody ref={obstacle} friction={0} type="kinematicPosition">
        <mesh
          geometry={boxGeometry}
          material={obstacleMaterial}
          position={[0, 0.25, 0]}
          scale={[4, 0.3, 0.3]}
          restitution={0.2}
          receiveShadow
          castShadow
        />
      </RigidBody>
      <NormalBlock />
    </group>
  );
}

function DoubleDiscBlock({ position = [0, 0, 0] }) {
  const obstacle = useRef();

  return (
    <group position={position}>
      <RigidBody ref={obstacle} friction={0} type="kinematicPosition">
        <mesh
          geometry={discGeometry}
          material={obstacleMaterial}
          position={[-1.5, 1.5, 1]}
          scale={[1, 1, 1]}
          restitution={0.2}
          receiveShadow
          castShadow
        />
      </RigidBody>

      <NormalBlock />
      {/* <RigidBody ref={obstacle} type="kinematicPosition">
        <mesh
          geometry={discGeometry}
          material={obstacleMaterial}
          position={[-1, 0.25, 1]}
          scale={[1.5, 0.25, 1.5]}
          rotation-x={Math.PI * 0.5}
          restitution={0.2}
          friction={0}
          receiveShadow
          castShadow
        />
      </RigidBody>

      <RigidBody ref={obstacle} type="kinematicPosition">
        <mesh
          geometry={discGeometry}
          material={obstacleMaterial}
          position={[1, 0.25, -1]}
          scale={[1.5, 0.25, 1.5]}
          rotation-x={Math.PI * 0.5}
          restitution={0.2}
          friction={0}
          receiveShadow
          castShadow
        />
      </RigidBody>
      <NormalBlock /> */}
    </group>
  );
}

function EndBlock({ position = [0, 0, 0] }) {
  const heart = useGLTF("./heart.gltf");
  heart.scene.children.forEach((mesh) => {
    mesh.castShadow = true;
  });
  const heartObj = useRef();
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const rotation = new THREE.Quaternion();
    rotation.setFromEuler(new THREE.Euler(0, time, 0));
    heartObj.current.setNextKinematicRotation(rotation);
  }, []);

  return (
    <group position={position}>
      <SpecialBlock />
      <Float speed={8} rotationIntensity={0.1}>
        <RigidBody
          ref={heartObj}
          type="fixed"
          colliders="hull"
          position-y={0.75}
          restitution={0.2}
          friction={0}
        >
          <primitive object={heart.scene} />
        </RigidBody>
      </Float>
    </group>
  );
}

function Wall({ length = 1 }) {
  return (
    <Block
      geometry={boxGeometry}
      scale={[0.3, 1.5, length * 4]}
      position={[2.15, 0.75, -(length * 2) + 2]}
      material={wallMaterial}
      isCastShadow={true}
    />
  );
}

function Bounds({ length = 1 }) {
  return (
    <group>
      <RigidBody type="fixed" restitution={0.2} friction={0}>
        <Block
          geometry={boxGeometry}
          scale={[0.3, 1.5, length * 4]}
          position={[2.15, 0.75, -(length * 2) + 2]}
          material={wallMaterial}
          isCastShadow={false}
        />
        <Block
          geometry={boxGeometry}
          scale={[0.3, 1.5, length * 4]}
          position={[-2.15, 0.75, -(length * 2) + 2]}
          material={wallMaterial}
          isCastShadow={false}
        />
        <Block
          geometry={boxGeometry}
          scale={[4, 1.5, 0.3]}
          position={[0, 0.75, -(length * 4) + 2]}
          material={wallMaterial}
          isCastShadow={false}
        />
        <CuboidCollider
          args={[2, 0.1, 2 * length]}
          position={[0, 0, -(length * 2) + 2]}
          restitution={0.2}
          friction={1}
        />
      </RigidBody>
    </group>
  );
}

export default function Level({
  count = 5,
  types = [AxeBlock, LimboBlock, SpinnerBlock],
}) {
  const blocks = useMemo(() => {
    const blocks = [];
    for (let i = 0; i < count; i++) {
      const typeIndex = Math.floor(Math.random() * types.length);
      blocks.push(types[typeIndex]);
    }
    return blocks;
  }, []);
  console.log(blocks);
  return (
    <>
      <SpecialBlock />
      {blocks.map((Block, index) => (
        <Block key={index} position={[0, 0, -4 * (index + 1)]} />
      ))}
      <EndBlock position={[0, 0.1, -4 * (count + 1)]} />
      <Bounds length={count + 2} />
    </>
  );
}
