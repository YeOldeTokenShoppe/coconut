import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, OrbitControls, Environment } from "@react-three/drei";
import {
  Physics,
  useBox,
  usePointToPointConstraint,
} from "@react-three/cannon";
import * as THREE from "three";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

function Model({ url, scale, swingRef }) {
  const gltf = useGLTF(url);
  const mixerRef = useRef();

  useEffect(() => {
    if (swingRef.current && gltf.animations.length) {
      mixerRef.current = new THREE.AnimationMixer(gltf.scene);

      // Find the correct animation by name
      const animationClip = gltf.animations.find((clip) =>
        clip.name.startsWith("Take 001")
      );

      if (animationClip) {
        const action = mixerRef.current.clipAction(animationClip);
        action.play();
      }

      // Center the swing object if needed
      const box = new THREE.Box3().setFromObject(swingRef.current);
      const center = box.getCenter(new THREE.Vector3());
      swingRef.current.position.sub(center);

      gltf.scene.traverse((child) => {
        if (child.isMesh) {
          if (child.material.name === "flame") {
            child.material.emissive = new THREE.Color(0xff8e3a);
            child.material.emissiveIntensity = 10;
          } else {
            child.material.metalness = 0.001;
            child.material.roughness = 0.009;
          }
        }
      });
    }
  }, [gltf]);
  // Update the mixer on each frame
  useFrame((_, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }
  });

  return (
    <primitive
      ref={swingRef}
      object={gltf.scene}
      scale={scale}
      position={[1, 0, 12]}
      rotation={[0.0, Math.PI / -2.9, 0]}
    />
  );
}

function PhysicsChandelier({ url, scale }) {
  const [swingRef, api] = useBox(() => ({
    mass: 1,
    position: [0, -5, 0],
    damping: 0.9, // Increase damping for gradual slow down
  }));
  const pivotRef = useRef();
  const swaySpeed = 0.1; // Speed of sway
  const swayAmplitude = 0.002; // Amplitude for subtle sway

  // Constraint to anchor the chandelier in place and pull it back to center
  usePointToPointConstraint(pivotRef, swingRef, {
    pivotA: [0, 0, 0],
    pivotB: [0, 5, 0],
  });

  // Apply subtle continuous sway to simulate a draft
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    const swayForce = swayAmplitude * Math.sin(time * swaySpeed);
    api.applyForce([swayForce, 0, swayForce], [0, 0, 0]);
  });

  // Apply a stronger impulse on click to simulate a push
  const handlePointerDown = () => {
    api.applyImpulse([1.5, 0, -1.5], [0, 0, 0]); // Stronger force to simulate a "push"
  };

  return (
    <>
      <mesh ref={pivotRef} position={[0, 5, 0]} />
      <mesh ref={swingRef} onPointerDown={handlePointerDown}>
        <Model url={url} scale={scale} swingRef={swingRef} />
      </mesh>
    </>
  );
}

function Chandelier() {
  const [isClient, setIsClient] = useState(false);
  const [scale, setScale] = useState(1);
  const [cameraSettings, setCameraSettings] = useState({
    position: [10, -10, -20],
    fov: 30,
  });

  useEffect(() => {
    setIsClient(true);
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        // Phone-sized screens
        setCameraSettings({
          position: [5, -5, -10],
          fov: 45,
        });
        setScale(1.5); // Adjust scale for phone-sized screens
      } else if (width >= 768 && width < 1024) {
        // Tablet-sized screens in portrait mode
        setCameraSettings({
          position: [7, -7, -15],
          fov: 35,
        });
        setScale(2); // Adjust scale for tablet-sized screens in portrait mode
      } else if (width >= 1024 && width < 1366) {
        // Tablet-sized screens in portrait mode
        setCameraSettings({
          position: [7, -7, -15],
          fov: 35,
        });
        setScale(1.5);
      } else {
        // Larger screens
        setCameraSettings({
          position: [10, -10, -20],
          fov: 30,
        });
        setScale(2.5); // Default scale for larger screens
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!isClient) return null;

  return (
    <div className="canvas-container">
      <Canvas
        camera={{ position: cameraSettings.position, fov: cameraSettings.fov }}
        gl={{
          antialias: true,
          pixelRatio: Math.min(window.devicePixelRatio, 2),
        }}
      >
        <ambientLight intensity={1} color="#ffffff" />
        <pointLight position={[10, 10, 10]} intensity={2.5} color="#ffffff" />
        <spotLight
          position={[5, 10, 15]}
          angle={0.3}
          penumbra={0.5}
          intensity={2}
          castShadow
        />
        <spotLight
          position={[-5, 10, 1]}
          angle={0.3}
          penumbra={0.5}
          intensity={2}
          castShadow
        />
        <directionalLight position={[3, 5, 5]} castShadow intensity={1.5} />
        <spotLight
          position={[0, 20, 10]}
          angle={0.5}
          penumbra={0.5}
          intensity={1.5}
          castShadow
        />
        {/* Apply physics to the chandelier */}
        <Physics gravity={[0, -9.8, 0]}>
          <PhysicsChandelier url="/chandelier1.glb" scale={scale} />
        </Physics>

        {/* Postprocessing effects */}
        <EffectComposer>
          <Bloom
            intensity={0.0005}
            luminanceThreshold={0.9}
            luminanceSmoothing={0.9}
          />
        </EffectComposer>
        <Environment preset="night" />

        <OrbitControls
          enableDamping={true}
          dampingFactor={0.1}
          maxPolarAngle={Math.PI}
          minPolarAngle={0}
          minAzimuthAngle={-Infinity}
          maxAzimuthAngle={Infinity}
          enableZoom={false}
          enablePan={false}
          target={[0, 0, 0]}
        />
      </Canvas>
    </div>
  );
}

export default Chandelier;
