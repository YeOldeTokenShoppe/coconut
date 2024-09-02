import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { db, auth } from "../utilities/firebaseClient";
import AuthModal from "./AuthModal";
import { Button } from "@chakra-ui/react";

const Carousel = ({ images }) => {
  const [user, setUser] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [riders, setRiders] = useState({});
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      setUser(user);
    });
  }, []);

  const handleImageClick = async (image, beastId) => {
    if (!user) {
      setIsAuthModalOpen(true); // Open the AuthModal if not signed in
      return;
    }

    setSelectedImage({ ...image, beastId });
  };

  const handleRideBeast = async (beastId) => {
    if (!user) {
      setIsAuthModalOpen(true); // Open the AuthModal if not signed in
      return;
    }

    try {
      // Fetch any existing rides for this user
      const ridesQuery = query(
        collection(db, "carouselBeasts"),
        where("userId", "==", user.uid)
      );
      const existingRides = await getDocs(ridesQuery);

      // If the user is already riding a beast, delete the previous ride
      if (!existingRides.empty) {
        existingRides.forEach(async (doc) => {
          try {
            await deleteDoc(doc.ref); // Remove the previous ride
          } catch (deleteError) {
            console.error("Failed to delete previous ride:", deleteError);
          }
        });
      }

      const newRiderData = {
        userId: user.uid,
        avatarUrl: user.photoURL || "/defaultAvatar.png",
        username: user.displayName || "Anonymous",
      };

      await runTransaction(db, async (transaction) => {
        const beastRef = doc(db, "carouselBeasts", beastId);
        const beastDoc = await transaction.get(beastRef);

        if (!beastDoc.exists()) {
          transaction.set(beastRef, {
            userId: newRiderData.userId,
            avatarUrl: newRiderData.avatarUrl,
            username: newRiderData.username,
            timestamp: serverTimestamp(),
          });
        } else {
          if (
            !beastDoc.data().userId ||
            beastDoc.data().userId === newRiderData.userId
          ) {
            transaction.update(beastRef, {
              userId: newRiderData.userId,
              avatarUrl: newRiderData.avatarUrl,
              username: newRiderData.username,
              timestamp: serverTimestamp(),
            });
          } else {
            throw new Error("Beast is already occupied");
          }
        }
      });

      setRiders((prevRiders) => ({
        ...prevRiders,
        [beastId]: newRiderData,
      }));
    } catch (error) {
      console.error("Failed to ride beast:", error);
      alert("Failed to ride beast. Please try again.");
    }
  };

  useEffect(() => {
    const intervalId = setInterval(async () => {
      for (let index = 0; index < images.length; index++) {
        const beastId = `beast${index + 1}`;
        const beastRef = doc(db, "carouselBeasts", beastId);
        const beastDoc = await getDoc(beastRef);
        if (beastDoc.exists() && beastDoc.data().timestamp) {
          const currentTime = Date.now();
          const rideTime = beastDoc.data().timestamp.toMillis();
          const timeElapsed = currentTime - rideTime;
          if (timeElapsed > 10 * 60 * 1000) {
            await deleteDoc(beastRef);
            setRiders((prevRiders) => ({
              ...prevRiders,
              [beastId]: null,
            }));
          }
        }
      }
    }, 60000);

    return () => clearInterval(intervalId);
  }, [images]);

  useEffect(() => {
    const unsubscribeSnapshots = images.map((_, index) => {
      const beastId = `beast${index + 1}`;
      const beastRef = doc(db, "carouselBeasts", beastId);
      return onSnapshot(beastRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          setRiders((prevRiders) => ({
            ...prevRiders,
            [beastId]: docSnapshot.data(),
          }));
        }
      });
    });

    return () => unsubscribeSnapshots.forEach((unsub) => unsub());
  }, [images]);

  return (
    <div className="carousel-container">
      <main>
        <div
          id="carousel"
          style={{
            "--rotation-time": "30s",
            "--elements": images.length,
            animationPlayState: isHovered ? "paused" : "running",
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {images.map((image, index) => {
            const beastId = `beast${index + 1}`;
            const rider = riders[beastId];

            return (
              <div
                className="element"
                style={{ "--item": index + 1 }}
                data-item={index + 1}
                key={index}
              >
                <div className="rider-container">
                  {rider && (
                    <>
                      <p className="rider-name">{rider.username}</p>
                      <img
                        src={rider.avatarUrl}
                        alt={rider.username}
                        className="rider-avatar"
                      />
                    </>
                  )}
                </div>
                <div
                  className="beast"
                  style={{ backgroundImage: `url(${image.src})` }}
                  onClick={() => handleImageClick(image, beastId)}
                ></div>
              </div>
            );
          })}
        </div>

        {selectedImage && (
          <div
            style={{
              backgroundColor: "pink",
              border: "2px solid goldenrod",
              marginTop: "2rem",
              padding: "1rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <h5 style={{ lineHeight: "1" }}>{selectedImage.title}</h5>
            <img
              src={selectedImage.src}
              alt={selectedImage.title}
              style={{ width: "100px", height: "100px" }}
            />
            <Button
              onClick={() => handleRideBeast(selectedImage.beastId)}
              style={{
                marginTop: "10px",
                padding: "5px 10px",
                backgroundColor: riders[selectedImage.beastId]
                  ? "gray"
                  : "goldenrod",
                border: "none",
                cursor: riders[selectedImage.beastId]
                  ? "not-allowed"
                  : "pointer",
              }}
              disabled={!!riders[selectedImage.beastId]}
            >
              {riders[selectedImage.beastId] ? "Beast Unavailable" : "Ride?"}
            </Button>
          </div>
        )}
      </main>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export default Carousel;
