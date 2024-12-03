import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import {
  Physics,
  useBox,
  useSphere,
  usePointToPointConstraint,
} from "@react-three/cannon";
import * as THREE from "three";

function Model({ url, scale }) {
  const gltf = useGLTF(url);
  const mixerRef = useRef();

  useEffect(() => {
    if (gltf.animations.length) {
      mixerRef.current = new THREE.AnimationMixer(gltf.scene);
      const animationClip = gltf.animations.find((clip) =>
        clip.name.startsWith("Take 001")
      );
      if (animationClip) {
        const action = mixerRef.current.clipAction(animationClip);
        action.play();
      }
    }
  }, [gltf]);

  useFrame((_, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }
  });

  return (
    <primitive
      object={gltf.scene}
      scale={3.9 * scale}
      rotation={[0.0, Math.PI / -2.9, 0]}
    />
  );
}
function ResponsiveCamera() {
  const { camera, size } = useThree();

  useEffect(() => {
    camera.fov = size.width > 1024 ? 50 : size.width > 768 ? 60 : 75; // Adjust FOV for smaller screens
    camera.updateProjectionMatrix(); // Apply the changes
  }, [size]);

  return null;
}

function PhysicsChandelier({ url }) {
  const fixedRef = useRef(null);
  const chandelierRef = useRef(null);
  const { camera } = useThree();
  const [isDragging, setIsDragging] = useState(false);
  const { size } = useThree();
  const [scale, setScale] = useState(1);

  // useEffect(() => {
  //   // Adjust scale based on viewport width
  //   const newScale = size.width > 1024 ? 1 : size.width > 768 ? 0.8 : 0.6; // Example breakpoints
  //   setScale(newScale);
  // }, [size]);

  const draftTimeRef = useRef(0);
  const anchorPosition = [0, 9.6, 0];
  const chandelierPosition = [0, 5.6, 0];

  // Create truly static anchor with high mass and no movement
  const [fixed] = useSphere(() => ({
    args: [0.1],
    position: anchorPosition,
    mass: 0,
    type: "Static",
    allowSleep: false,
    fixedRotation: true,
    collisionResponse: false,
  }));

  // Create dynamic body for chandelier
  const [chandelier, chandelierApi] = useBox(() => ({
    args: [6, 3, 6],
    position: chandelierPosition,
    mass: 10,
    linearDamping: 0.9,
    angulardamping: 1.99,
    allowSleep: false,
  }));

  // Create strong constraint between fixed point and chandelier
  usePointToPointConstraint(fixed, chandelier, {
    pivotA: [0, 0, 0], // Anchor point
    pivotB: [0, 9.6, 0], // Top of chandelier
    maxForce: 1000, // Increased for stronger connection
  });
  useFrame((state, delta) => {
    draftTimeRef.current += delta;

    // Gentler draft effect
    const baseStrength = 15;
    const xWave = Math.sin(draftTimeRef.current * 0.5);
    const zWave = Math.cos(draftTimeRef.current * 0.3);

    // Gentler random gusts
    if (Math.random() < 0.03) {
      const gustStrength = baseStrength * 1.5;
      chandelierApi.applyForce(
        [
          (Math.random() - 0.5) * gustStrength,
          0,
          (Math.random() - 0.5) * gustStrength,
        ],
        [0, 0, 0]
      );
    }

    // Constant gentle draft
    chandelierApi.applyForce(
      [xWave * baseStrength, 0, zWave * baseStrength],
      [0, 0, 0]
    );

    // Rotation with better constraints
    const rotationStrength = 0.3;
    const rotationWave = Math.sin(draftTimeRef.current * 0.2);

    chandelierApi.applyTorque([0, rotationWave * rotationStrength, 0]);

    // Get current position and velocity
    const position = chandelierRef.current?.position;
    if (position) {
      // Apply centering force if too far from rest position
      const distanceFromCenter = Math.sqrt(
        Math.pow(position.x, 2) + Math.pow(position.z, 2)
      );

      if (distanceFromCenter > 2) {
        const centeringForce = 50 * distanceFromCenter;
        chandelierApi.applyForce(
          [-position.x * centeringForce, 0, -position.z * centeringForce],
          [0, 0, 0]
        );
      }
    }
  });

  const handlePointerDown = (e) => {
    e.stopPropagation();

    if (e.buttons === 2) {
      // Right click for push
      const pushStrength = 200;
      chandelierApi.applyImpulse(
        [
          (Math.random() - 0.5) * pushStrength,
          0,
          (Math.random() - 0.5) * pushStrength,
        ],
        [0, 0, 0]
      );
    } else {
      // Left click for drag
      setIsDragging(true);
      document.body.style.cursor = "grabbing";
    }
  };

  const handlePointerMove = (e) => {
    if (isDragging) {
      e.stopPropagation();
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      const vector = new THREE.Vector3(x, y, 0).unproject(camera);

      chandelierApi.applyForce([vector.x * 200, 0, vector.z * 200], [0, 0, 0]);
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    document.body.style.cursor = "auto";
  };

  useEffect(() => {
    const handleGlobalPointerUp = () => {
      setIsDragging(false);
      document.body.style.cursor = "auto";
    };

    window.addEventListener("pointerup", handleGlobalPointerUp);
    return () => window.removeEventListener("pointerup", handleGlobalPointerUp);
  }, []);

  return (
    <>
      {/* Static anchor visualization */}
      <mesh ref={fixed} position={anchorPosition}>
        <sphereGeometry args={[0.2]} />
        <meshStandardMaterial
        // color="red"
        // emissive="red"
        // emissiveIntensity={2}
        />
      </mesh>

      {/* Physics body and visual mesh */}
      <group
        ref={chandelier}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Debug box */}

        {/* The actual chandelier model */}
        <Model url={url} scale={scale} />
      </group>
    </>
  );
}

function Scene() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Canvas camera={{ position: [15, 0, 15], fov: 40 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[7, 0, 2]} castShadow />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <ResponsiveCamera />
        <spotLight
          position={[0, 15, 0]}
          angle={0.5}
          penumbra={0.5}
          intensity={2}
          castShadow
        />

        <Physics
          gravity={[0, -100, 0]}
          defaultContactMaterial={{
            friction: 0.5,
            restitution: 0,
            contactEquationStiffness: 1e6,
            contactEquationRelaxation: 10,
          }}
          iterations={20} // Increased iterations for stability
          tolerance={0.001} // Better precision
        >
          <PhysicsChandelier url="/chandelier2.glb" scale={1} />
        </Physics>

        <OrbitControls
          enableDamping
          dampingFactor={0.1}
          target={[0, 5.6, 0]}
          maxPolarAngle={Math.PI / 1.5}
          enableZoom={false}
        />
      </Canvas>
    </div>
  );
}

export default Scene;
