import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, OrbitControls, useAnimations } from "@react-three/drei";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "../utilities/firebaseClient";
import * as THREE from "three";

function Model({ url, scale, userData, setTooltipData }) {
  const modelRef = useRef();
  const gltf = useGLTF(url);
  const { actions, mixer } = useAnimations(gltf.animations, modelRef);
  const { camera, size } = useThree();
  const [debugSpheres, setDebugSpheres] = useState([]);
  const [modelScale, setModelScale] = useState(0.75);
  const containerRef = useRef(null);

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  const handlePointerMove = (event) => {
    const canvas = event.target;
    const rect = canvas.getBoundingClientRect();

    // Calculate mouse position
    mouse.x = ((event.clientX - rect.left) / canvas.clientWidth) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / canvas.clientHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    // Collect all debug spheres
    const debugSpheres = [];
    modelRef.current?.traverse((object) => {
      if (object.userData?.isDebugSphere) {
        debugSpheres.push(object);
      }
    });

    console.log("Mouse position:", mouse.x, mouse.y);
    console.log("Number of debug spheres:", debugSpheres.length);

    // Make debug spheres temporarily visible and larger for testing
    debugSpheres.forEach((sphere) => {
      sphere.material.opacity = 0;
      sphere.scale.set(1, 1, 1);
    });

    const intersects = raycaster.intersectObjects(debugSpheres, true);
    console.log("Intersections found:", intersects.length);

    if (intersects.length > 0) {
      const intersectedSphere = intersects[0].object;
      console.log("Intersected sphere userData:", intersectedSphere.userData);

      // Get screen position
      const worldPos = new THREE.Vector3();
      intersectedSphere.getWorldPosition(worldPos);

      // Get the screen coordinates
      const screenPos = worldPos.clone();
      screenPos.project(camera);

      const screenX = (0.5 + screenPos.x / 2) * size.width;
      const screenY = (0.5 - screenPos.y / 2) * size.height;

      console.log("Screen position:", screenX, screenY);

      setTooltipData([
        {
          userName: intersectedSphere.userData.userName,
          position: {
            x: screenX,
            y: screenY,
          },
        },
      ]);
    } else {
      setTooltipData(null);
    }
  };

  const adjustCameraFOV = () => {
    const width = window.innerWidth;
    return width < 768 ? 50 : width < 1200 ? 50 : 40;
  };

  // useEffect(() => {
  //   const handleResize = () => {
  //     // Update container size
  //     if (containerRef.current) {
  //       containerRef.current.style.width = "90vw";
  //       containerRef.current.style.height = `${Math.min(
  //         window.innerHeight * 0.6,
  //         600
  //       )}px`;
  //     }
  //   };

  //   window.addEventListener("resize", handleResize);
  //   handleResize();

  //   return () => window.removeEventListener("resize", handleResize);
  // }, []);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setModelScale(1); // Set scale to 1 for phone-sized screens
      } else {
        setModelScale(0.75); // Set scale to 0.75 for larger screens
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (modelRef.current) {
      const box = new THREE.Box3().setFromObject(modelRef.current);
      const center = box.getCenter(new THREE.Vector3());
      modelRef.current.position.sub(center);
      modelRef.current.scale.set(scale, scale, scale);

      const action = actions["Take 001"];
      if (action) {
        action.reset();
        action.setEffectiveTimeScale(0.5);
        action.setLoop(THREE.LoopRepeat);
        action.play();
      }

      // Randomly assign candles for each user in `userData`
      const candleIndexes = Array.from({ length: 52 }, (_, i) => i);
      const assignedIndexes = [];
      while (assignedIndexes.length < userData.length) {
        const randomIndex = Math.floor(Math.random() * candleIndexes.length);
        assignedIndexes.push(candleIndexes.splice(randomIndex, 1)[0]);
      }

      // Inside the Model component's useEffect, update the flame setup section:
      // First, let's store candle positions in a map
      const candlePositions = new Map();
      let userIndex = 0;

      // First pass: store candle positions
      modelRef.current.traverse((child) => {
        if (child.name.startsWith("ZCandle")) {
          child.visible = true;

          const candleIndex = parseInt(child.name.replace("ZCandle", ""), 10);

          if (
            assignedIndexes.includes(candleIndex) &&
            userIndex < userData.length
          ) {
            const user = userData[userIndex];
            if (user) {
              child.userData.isMelting = true;
              child.userData.initialHeight = child.scale.y;
              child.userData.userName = user.userName;
              // Store the candle's position
              candlePositions.set(candleIndex, {
                x: child.position.x,
                y: child.position.y,
                z: child.position.z,
                userName: user.userName,
              });
              userIndex++;
            }
          }
        }
      });

      modelRef.current.traverse((child) => {
        if (child.name.startsWith("ZFlame")) {
          child.visible = false;

          const flameIndex = parseInt(child.name.replace("ZFlame", ""), 10);

          if (
            assignedIndexes.includes(flameIndex) &&
            assignedIndexes.indexOf(flameIndex) < userData.length
          ) {
            const correspondingUser =
              userData[assignedIndexes.indexOf(flameIndex)];

            // Get the stored candle position
            const candlePos = candlePositions.get(flameIndex);

            if (candlePos) {
              child.visible = true;
              child.userData.isFlame = true;
              child.userData.userName = correspondingUser.userName;

              // Set flame position to match candle
              child.position.set(candlePos.x, candlePos.y, candlePos.z);

              const debugGeometry = new THREE.SphereGeometry(0.1, 16, 16);

              const debugMaterial = new THREE.MeshBasicMaterial({
                color: "black",
                transparent: true,
                opacity: 0,
                depthTest: false,
                depthWrite: false,
              });
              const debugSphere = new THREE.Mesh(debugGeometry, debugMaterial);

              // Position the debug sphere at the candle's position
              debugSphere.position.set(
                candlePos.x,
                candlePos.y + child.scale.y * 10 + 0.2,
                candlePos.z
              );

              debugSphere.raycast = THREE.Mesh.prototype.raycast;
              debugSphere.userData = {
                userName: correspondingUser.userName,
                candleIndex: flameIndex,
                isDebugSphere: true,
              };

              debugSphere.renderOrder = 999;

              // Store reference to debug sphere
              child.userData.debugSphere = debugSphere;
              modelRef.current.add(debugSphere);

              console.log(
                "Added debug sphere for flame:",
                flameIndex,
                "user:",
                correspondingUser.userName,
                "position:",
                debugSphere.position.toArray(),
                "candle position:",
                [candlePos.x, candlePos.y, candlePos.z]
              );
            }
          }
        }
      });

      // Add event listeners
      const canvas = document.querySelector("canvas");
      if (canvas) {
        canvas.style.cursor = "pointer";
        canvas.addEventListener("pointermove", handlePointerMove);
        canvas.addEventListener("click", handlePointerMove);
      }

      // Cleanup function
      return () => {
        const canvas = document.querySelector("canvas");
        if (canvas) {
          canvas.removeEventListener("pointermove", handlePointerMove);
          canvas.removeEventListener("click", handlePointerMove);
        }
        // Clean up debug spheres
        modelRef.current?.traverse((child) => {
          if (child.name.startsWith("ZFlame") && child.userData?.debugSphere) {
            modelRef.current.remove(child.userData.debugSphere);
          }
        });
        if (mixer) mixer.stopAllAction();
      };
    }
  }, [gltf, userData, actions, mixer, scale]);

  useFrame((_, delta) => {
    if (modelRef.current) {
      modelRef.current.traverse((child) => {
        if (child.name.startsWith("ZCandle") && child.userData?.isMelting) {
          if (child.scale.y > 0.01) {
            child.scale.y -= 0.005 * delta; //adjust the speed of isMelting

            // Find corresponding flame and debug sphere using userName
            const userName = child.userData.userName;
            modelRef.current.traverse((flame) => {
              if (
                flame.name.startsWith("ZFlame") &&
                flame.userData?.isFlame &&
                flame.userData.userName === userName
              ) {
                // Calculate new Y position
                const newY = child.position.y + child.scale.y * 10;

                // Update flame position
                flame.position.y = newY;

                // Update debug sphere position and scale
                if (flame.userData.debugSphere) {
                  const debugSphere = flame.userData.debugSphere;
                  const spherePos = debugSphere.position;

                  // Option 1: Update position and scale of elongated shape
                  // spherePos.x = flame.position.x;
                  // spherePos.y = newY - child.scale.y * 5; // Position in middle of height
                  // spherePos.z = flame.position.z;
                  // debugSphere.scale.y = child.scale.y * 10; // Adjust length based on candle height

                  // Or Option 2: Update cylinder height dynamically
                  // if using CylinderGeometry:
                  const newHeight = child.scale.y * 15;
                  debugSphere.geometry = new THREE.CylinderGeometry(
                    0.2,
                    0.2,
                    newHeight,
                    8
                  );
                  spherePos.y = newY - newHeight / 2;
                }
              }
            });
          }
        }
      });
    }
  });

  debugSpheres.forEach((sphere) => {
    sphere.material.opacity = 0.0;
    // Scale only X and Z for hover effect
    sphere.scale.set(1.1, sphere.scale.y, 1.1);
  });

  return (
    <primitive
      ref={modelRef}
      object={gltf.scene}
      position={[-4, -1, 1]}
      scale={modelScale}
      rotation={[-0.02, Math.PI / 0.55, -0.02]}
      onClick={(e) => {
        e.stopPropagation();
        handlePointerMove(e.nativeEvent);
      }}
      onPointerMove={(e) => {
        e.stopPropagation();
        handlePointerMove(e.nativeEvent);
      }}
    />
  );
}

function ThreeDVotiveStand() {
  const [isClient, setIsClient] = useState(false);
  const [userData, setUserData] = useState([]);
  const [tooltipData, setTooltipData] = useState(null);
  const [modelScale, setModelScale] = useState(0.75);
  const containerRef = useRef(null);

  // Adjust camera FOV based on screen width
  const adjustCameraFOV = () => {
    const width = window.innerWidth;
    return width < 768 ? 80 : width < 1200 ? 50 : 40;
  };

  useEffect(() => {
    const handleResize = () => {
      // Update container size
      if (containerRef.current) {
        const width = window.innerWidth;
        if (width < 768) {
          containerRef.current.style.width = "100vw";
          containerRef.current.style.height = "100vh";
          containerRef.current.style.display = "flex";
          containerRef.current.style.justifyContent = "center";
          containerRef.current.style.alignItems = "center";
          setModelScale(3.5);
        } else {
          containerRef.current.style.width = "60vw";
          containerRef.current.style.height = "90vh";
          containerRef.current.style.display = "block";
          containerRef.current.style.margin = "0 auto";
          containerRef.current.style.position = "relative";
          // containerRef.current.style.left = "10%";
          setModelScale(0.5);
        }
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setIsClient(true);

    const fetchData = async () => {
      const q = query(collection(db, "results"), orderBy("createdAt", "desc"));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const results = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          userName: doc.data().userName,
        }));
        setUserData(results.slice(0, 5));
      });

      return () => unsubscribe();
    };

    fetchData().catch(console.error);
  }, []);

  if (!isClient || userData.length === 0) return null;

  return (
    <div ref={containerRef} className="votiveContainer">
      <Canvas
        style={{ width: "100vw", height: "100vh" }}
        camera={{
          position: [-2, -1, 4],
          fov: adjustCameraFOV(),
        }}
        gl={{
          antialias: true,
          pixelRatio: Math.min(window.devicePixelRatio, 2),
        }}
      >
        <ambientLight intensity={0.2} />
        <directionalLight position={[5, 15, -5]} castShadow />
        <Model
          // url="/votiveHolder5.glb"
          url="/tradingDesk.glb"
          scale={0.08}
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

      {tooltipData?.map((tooltip, index) => (
        <div
          key={index}
          className="tooltip-container"
          style={{
            position: "absolute",
            left: `${tooltip.position.x}px`,
            top: `${tooltip.position.y - 50}px`,
            transform: "translate(-50%, -100%)",
            transition: "all 0.2s ease-in-out",
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            color: "white",
            padding: "8px 12px",
            borderRadius: "4px",
            pointerEvents: "none",
            zIndex: 1000,
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
            fontSize: "14px",
            fontWeight: "600",
            letterSpacing: "0.02em",
            minWidth: "100px",
            textAlign: "center",
          }}
        >
          {tooltip.userName}
        </div>
      ))}
    </div>
  );
}

export default ThreeDVotiveStand;
