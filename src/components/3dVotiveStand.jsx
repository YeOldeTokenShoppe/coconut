import React, { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";

function Model({ url }) {
  const { scene } = useGLTF(url); // Load the GLB model
  return <primitive object={scene} />;
}

export default function ThreeDVotiveStand() {
  // useEffect(() => {
  //   // Simulate async data or image loading
  //   const loadVotiveContent = async () => {
  //     // Example: simulate loading (replace with real logic)
  //     await new Promise((resolve) => setTimeout(resolve, 500));
  //     setVotiveLoaded = { setVotiveLoaded }; // Notify parent that loading is complete
  //   };

  //   loadVotiveContent();
  // }, [setVotiveLoaded]);
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "black",
      }}
    >
      <Canvas camera={{ position: [0, 2, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[0, 5, 5]} />
        <Model url="/ultima3.glb" />
        <OrbitControls />
      </Canvas>
    </div>
  );
}
