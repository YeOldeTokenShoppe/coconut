import React, { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

function Model({ url }) {
  const group = useRef();
  const { scene, nodes, materials } = useGLTF(url);

  // Assuming "ScreenMesh" is the name of the screen in your model
  const screenMesh = nodes.ScreenMesh; // Adjust this based on your model's structure

  // Apply emissive color and intensity to simulate glow on the screens
  if (screenMesh) {
    screenMesh.material = new THREE.MeshStandardMaterial({
      color: screenMesh.material.color, // Keep original color
      emissive: new THREE.Color(0xffffff), // Set emissive color to white (can change to other colors)
      emissiveIntensity: 8, // Adjust intensity of the glow (increase or decrease as needed)
    });
    screenMesh.material.needsUpdate = true;
  }

  return (
    <group ref={group}>
      <primitive object={scene} />
    </group>
  );
}

export default function GLBModel() {
  return (
    <Canvas>
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.3} />
      <Model url="/old_computers.glb" />
      <OrbitControls />
    </Canvas>
  );
}
