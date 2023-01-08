import { OrbitControls } from "@react-three/drei";
import { Debug, Physics } from "@react-three/rapier";
import Level from "./Level.js";
import Lights from "./Lights.js";
import Player from "./Player.jsx";
import useGame from "./stores/useGame.js";

export default function Experience() {
  const blocksCount = useGame((state) => {
    console.log(state);
    return state.blocksCount;
  });
  return (
    <>
      <Physics>
        <Debug />
        <Lights />
        <Level count={blocksCount} />
        <Player />
      </Physics>
    </>
  );
}