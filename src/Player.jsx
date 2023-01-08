import { useKeyboardControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { RigidBody, useRapier } from "@react-three/rapier";
import { useEffect, useRef, useState } from "react";
import useGame from "./stores/useGame";
import * as THREE from "three";

export default function Player() {
  const object = useRef();
  const [subscribeKeys, getKeys] = useKeyboardControls();
  const { rapier, world } = useRapier();
  const worldRaw = world.raw();

  const start = useGame((state) => state.start);
  const restart = useGame((state) => state.restart);
  const end = useGame((state) => state.end);
  const blockCount = useGame((state) => state.blocksCount);

  const [smoothedCameraPosition] = useState(
    () => new THREE.Vector3(-10, -10, -10)
  );
  const [smoothedCameraTarget] = useState(() => new THREE.Vector3());

  const jump = () => {
    const state = useGame.getState();
    if (state.phase === "ended") {
      return;
    }
    // test collision, if distance too high, disable jump
    const origin = object.current.translation();
    origin.y -= 0.31;
    const rayDirection = { x: 0, y: -1, z: 0 };
    const ray = new rapier.Ray(origin, rayDirection);
    const hit = worldRaw.castRay(ray, 10, true); // true treat everything as solid
    if (hit.toi < 0.15) {
      object.current.applyImpulse({ x: 0, y: 0.5, z: 0 });
    }
  };

  const reset = () => {
    // put back at origin; remove translation force; remove angular force
    object.current.setTranslation({ x: 0, y: 1, z: 0 });
    object.current.setLinvel({ x: 0, y: 0, z: 0 });
    object.current.setAngvel({ x: 0, y: 0, z: 0 });
  };

  useEffect(() => {
    const unsubscribeReset = useGame.subscribe(
      (state) => state.phase,
      (phase) => {
        if (phase === "ready") {
          reset();
        }
      }
    );

    const unsubscribeAny = subscribeKeys(() => {
      start();
    });

    const unsubscribeJump = subscribeKeys(
      (state) => state.jump,
      (value) => {
        if (value) jump();
      }
    );
    return () => {
      unsubscribeJump();
      unsubscribeAny();
      unsubscribeReset();
    };
  }, []);

  useFrame((state, delta) => {
    const gameState = useGame.getState();
    if (gameState.phase != "ended") {
      const { forward, backward, leftward, rightward } = getKeys();
      const impulse = { x: 0, y: 0, z: 0 };
      const torque = { x: 0, y: 0, z: 0 };
      const impulseStrength = 0.5 * delta;
      const torqueStrength = 0.5 * delta;
      if (forward) {
        impulse.z -= impulseStrength;
        torque.x -= torqueStrength;
      }
      if (leftward) {
        impulse.x -= impulseStrength;
        torque.z += torqueStrength;
      }
      if (rightward) {
        impulse.x += impulseStrength;
        torque.z -= torqueStrength;
      }
      if (backward) {
        impulse.z += impulseStrength;
        torque.x += torqueStrength;
      }

      object.current.applyImpulse(impulse);
      object.current.applyTorqueImpulse(torque);

      // camera
      const objectPosition = object.current.translation();
      const cameraPosition = new THREE.Vector3();
      cameraPosition.copy(objectPosition);
      cameraPosition.z += 2.25;
      cameraPosition.y += 0.65;
      const cameraTarget = new THREE.Vector3();
      cameraTarget.copy(objectPosition);
      cameraTarget.y += 0.25;

      smoothedCameraPosition.lerp(cameraPosition, 5 * delta);
      smoothedCameraTarget.lerp(cameraTarget, 5 * delta);

      state.camera.position.copy(smoothedCameraPosition);
      state.camera.lookAt(smoothedCameraTarget);

      if (objectPosition.z < -(blockCount * 4 + 2)) {
        end();
      }

      if (objectPosition.y < -4) {
        restart();
      }
    }
  });
  return (
    <RigidBody
      ref={object}
      colliders="ball"
      restitution={0.2}
      friction={3}
      position-y={1}
      linearDamping={0.5}
      angularDamping={0.5}
    >
      <mesh castShadow>
        <icosahedronGeometry args={[0.3, 1]} />
        <meshStandardMaterial flatShading color="mediumpurple" />
      </mesh>
    </RigidBody>
  );
}
