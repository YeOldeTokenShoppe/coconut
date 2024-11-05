import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, OrbitControls, useAnimations } from "@react-three/drei";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "../utilities/firebaseClient";
import * as THREE from "three";

function Model({ url, scale, userData, setTooltipData }) {
  const modelRef = useRef();
  const gltf = useGLTF(url);
  const { actions, mixer } = useAnimations(gltf.animations, modelRef);

  useEffect(() => {
    if (modelRef.current) {
      const box = new THREE.Box3().setFromObject(modelRef.current);
      const center = box.getCenter(new THREE.Vector3());
      modelRef.current.position.sub(center);
      modelRef.current.scale.set(3 * scale, 3 * scale, 3 * scale);

      const action = actions["Take 001"];
      if (action) {
        action.reset();
        action.setEffectiveTimeScale(0.5);
        action.setLoop(THREE.LoopRepeat);
        action.play();
      }

      modelRef.current.traverse((child) => {
        if (child.name.startsWith("ZFlame")) {
          const index = parseInt(child.name.replace("ZFlame", ""), 10);
          const user = userData[index];
          child.visible = Boolean(user); // Toggle visibility
        }
      });
    }

    return () => {
      if (mixer) mixer.stopAllAction();
    };
  }, [gltf, userData, actions, mixer, scale]);

  useFrame(({ camera, size }) => {
    if (modelRef.current) {
      const tempV = new THREE.Vector3();
      const tooltips = [];

      modelRef.current.traverse((child) => {
        if (child.name.startsWith("ZFlame") && child.visible) {
          child.getWorldPosition(tempV);
          tempV.project(camera);

          const x = (0.5 + tempV.x / 2) * size.width;
          const y = (0.5 - tempV.y / 2) * size.height;

          const index = parseInt(child.name.replace("ZFlame", ""), 10);
          const user = userData[index];
          if (user) {
            tooltips.push({
              userName: user.userName,
              imageSrc: user.image?.src || "",
              position: { x, y },
            });
          }
        }
      });

      setTooltipData(tooltips);
    }
  });

  return (
    <primitive
      ref={modelRef}
      object={gltf.scene}
      position={[1, 0, 12]}
      scale={3 * scale}
      rotation={[-0.01, Math.PI / -3.9, 0]}
    />
  );
}

function GLBViewer() {
  const [isClient, setIsClient] = useState(false);
  const [userData, setUserData] = useState([]);
  const [tooltipData, setTooltipData] = useState([]);

  useEffect(() => {
    setIsClient(true);

    const fetchData = async () => {
      const q = query(collection(db, "results"), orderBy("createdAt", "desc"));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const results = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          userName: doc.data().userName,
          image: doc.data().image || {},
        }));
        setUserData(results.slice(0, 5));
      });

      return () => unsubscribe();
    };

    fetchData().catch(console.error);
  }, []);

  if (!isClient || userData.length === 0) return null;

  return (
    <div
      style={{
        position: "relative",
        width: "70vw",
        height: "100vh",
        zIndex: "1",
      }}
    >
      <Canvas
        style={{ width: "100%", height: "100%" }}
        camera={{ position: [10, 5, -30], fov: 30 }}
        gl={{
          antialias: true,
          pixelRatio: Math.min(window.devicePixelRatio, 2),
        }}
      >
        <ambientLight intensity={0.75} />
        {/* <pointLight position={[2, 13, 15]} /> */}
        {/* <directionalLight position={[5, 16, 15]} castShadow /> */}
        {/* <directionalLight position={[2, 1, 25]} castShadow /> */}
        <directionalLight position={[7, 0, 2]} castShadow />
        <Model
          url="/superCandle.glb"
          scale={0.9}
          userData={userData}
          setTooltipData={setTooltipData}
        />
        <OrbitControls
          enableDamping
          dampingFactor={0.1}
          maxPolarAngle={Math.PI}
          minPolarAngle={0}
          enableZoom={false}
          enablePan={false}
          target={[0, 0, 0]}
        />
      </Canvas>

      <div className="tooltip-wrapper">
        {tooltipData.map((tooltip, index) => (
          <div
            key={index}
            className="tooltip-container"
            style={{
              left: `${tooltip.position.x}px`,
              top: `${tooltip.position.y - 150}px`,
            }}
          >
            <div className="avatar-container">
              {tooltip.imageSrc.endsWith(".mp4") ? (
                <video
                  src={tooltip.imageSrc}
                  className="avatar-media video"
                  autoPlay
                  loop
                  muted
                />
              ) : (
                <img
                  src={tooltip.imageSrc}
                  alt={`${tooltip.userName}'s avatar`}
                  className="avatar-media"
                />
              )}
            </div>
            <div className="tooltip-text">{tooltip.userName}</div>
          </div>
        ))}
      </div>

      <style>{`
        .tooltip-wrapper {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .tooltip-container {
          position: absolute;
          transform: translate(-50%, -50%);
          pointer-events: auto;
        }

        .avatar-container {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 2px solid white;
          overflow: hidden;
          cursor: pointer;
        }

        .avatar-media {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
        }

        .avatar-media.video {
          transform: scale(1.8);
        }

        .tooltip-text {
          position: absolute;
          left: 50%;
          bottom: 100%;
          transform: translateX(-50%);
          margin-bottom: 8px;
          padding: 4px 8px;
          background-color: rgba(0, 0, 0, 0.7);
          color: white;
          font-size: 12px;
          white-space: nowrap;
          border-radius: 4px;
          opacity: 0;
          transition: opacity 0.2s ease;
          pointer-events: none;
        }

        .tooltip-container:hover .tooltip-text {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}

export default GLBViewer;
