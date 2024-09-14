import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  addDoc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { db, auth } from "../utilities/firebaseClient";
import AuthModal from "./AuthModal";
import { Button, Input } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { writeBatch } from "firebase/firestore";

const Carousel = ({ images, logos }) => {
  const [user, setUser] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [riders, setRiders] = useState({});
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const router = useRouter();
  const currentUrl = router.asPath;
  const [isRideConfirmationOpen, setIsRideConfirmationOpen] = useState(false);
  const [messages, setMessages] = useState({});
  const [newMessage, setNewMessage] = useState("");
  const [activeBeastId, setActiveBeastId] = useState(null);
  const [isRiding, setIsRiding] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null); // Track the remaining time

  useEffect(() => {
    auth.onAuthStateChanged(async (user) => {
      setUser(user);

      if (user) {
        // Check if the user is already riding a beast
        const ridesQuery = query(
          collection(db, "carouselBeasts"),
          where("userId", "==", user.uid)
        );
        const existingRides = await getDocs(ridesQuery);

        // If a ride is found, restore the state
        if (!existingRides.empty) {
          const existingRideId = existingRides.docs[0].id; // Get the current ride beastId
          setActiveBeastId(existingRideId); // Restore active beast
          setIsRiding(true); // Restore riding state

          // Restore the rider data in the state (optional)
          const rideData = existingRides.docs[0].data();
          setRiders((prevRiders) => ({
            ...prevRiders,
            [existingRideId]: rideData,
          }));
        }
      }
    });
  }, []);

  const closeAuthModal = () => setIsAuthModalOpen(false);

  const confirmRide = async () => {
    setIsRideConfirmationOpen(false); // Close the ride confirmation prompt
    if (!user) {
      setIsAuthModalOpen(true); // Open the AuthModal if not signed in
      return;
    }

    try {
      const beastId = selectedImage.beastId;

      // Fetch any existing rides for this user
      const ridesQuery = query(
        collection(db, "carouselBeasts"),
        where("userId", "==", user.uid)
      );
      const existingRides = await getDocs(ridesQuery);

      // If the user is already riding a beast, switch rides
      if (!existingRides.empty) {
        const existingRideId = existingRides.docs[0].id; // Get the current ride beastId

        // Delete the existing ride from Firestore (since they chose to switch)
        await deleteDoc(doc(db, "carouselBeasts", existingRideId));

        // Remove the existing ride from the state
        setRiders((prevRiders) => ({
          ...prevRiders,
          [existingRideId]: null, // Clear the previous rider from the state
        }));

        // Query and delete all messages related to the old beast
        const messagesQuery = query(
          collection(db, "carouselChat"),
          where("beastId", "==", existingRideId)
        );
        const messagesSnapshot = await getDocs(messagesQuery);

        // Use writeBatch to delete all previous messages
        const batch = writeBatch(db);
        messagesSnapshot.forEach((doc) => {
          batch.delete(doc.ref);
        });
        await batch.commit();

        // Optionally clear the previous messages from local state
        setMessages((prevMessages) => ({
          ...prevMessages,
          [existingRideId]: [],
        }));
      }

      const newRiderData = {
        userId: user.uid,
        avatarUrl: user.photoURL || "/defaultAvatar.png",
        username: user.displayName || "Anonymous",
      };

      // Start the transaction for the new ride
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

      // After confirming the ride, set the new rider in the state
      setRiders((prevRiders) => ({
        ...prevRiders,
        [beastId]: newRiderData, // Set the new beast as the rider's active ride
      }));

      setIsRiding(true);
      setActiveBeastId(beastId); // Set active beast for chat
      setSelectedImage(null); // Clear the selected image to hide the modal box
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

          const totalTime = 10 * 60 * 1000; // 10 minutes in milliseconds
          const timeLeft = totalTime - timeElapsed;

          // Update time remaining for the active rider
          if (activeBeastId === beastId) {
            if (timeLeft > 0) {
              const minutes = Math.floor(timeLeft / (1000 * 60));
              const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
              setTimeRemaining(`${minutes}m ${seconds}s`);
            } else {
              setTimeRemaining("Ride has ended");
            }
          }

          // If the ride time has passed 10 minutes, delete the rider and messages
          if (timeElapsed > 10 * 60 * 1000) {
            // Delete the rider from the beast
            await deleteDoc(beastRef);
            setRiders((prevRiders) => ({
              ...prevRiders,
              [beastId]: null,
            }));

            // Query and delete all messages for this beast
            const messagesQuery = query(
              collection(db, "carouselChat"),
              where("beastId", "==", beastId)
            );
            const messagesSnapshot = await getDocs(messagesQuery);

            // Use writeBatch instead of db.batch
            const batch = writeBatch(db);

            messagesSnapshot.forEach((doc) => {
              batch.delete(doc.ref);
            });

            // Commit the batch delete
            await batch.commit();

            // Optionally clear messages from local state
            setMessages((prevMessages) => ({
              ...prevMessages,
              [beastId]: [],
            }));
          }
        }
      }
    }, 1000); // Update every second for time tracking

    return () => clearInterval(intervalId);
  }, [images, activeBeastId]);
  // Handle real-time message updates
  useEffect(() => {
    images.forEach((_, index) => {
      const beastId = `beast${index + 1}`;
      const q = query(
        collection(db, "carouselChat"),
        where("beastId", "==", beastId)
      );
      onSnapshot(q, (snapshot) => {
        const chatMessages = snapshot.docs.map((doc) => doc.data());
        setMessages((prevMessages) => ({
          ...prevMessages,
          [beastId]: chatMessages,
        }));
      });
    });
  }, [images]);

  const handleImageClick = (image, beastId) => {
    setSelectedImage({ ...image, beastId });
    setIsRideConfirmationOpen(true); // Open the ride confirmation prompt
  };

  const handleSendMessage = async (beastId) => {
    if (newMessage.trim() === "" || !user) return;

    try {
      // Query for the user's previous message for the same beast
      const previousMessageQuery = query(
        collection(db, "carouselChat"),
        where("beastId", "==", beastId),
        where("riderId", "==", user.uid)
      );

      const previousMessagesSnapshot = await getDocs(previousMessageQuery);

      // Delete the previous message if it exists
      const batch = writeBatch(db);
      previousMessagesSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit(); // Commit the batch to delete previous messages

      // Add the new message
      await addDoc(collection(db, "carouselChat"), {
        message: newMessage,
        riderId: user.uid,
        riderName: user.displayName || "Anonymous",
        avatarUrl: user.photoURL || "/defaultAvatar.png",
        timestamp: serverTimestamp(),
        beastId,
      });

      setNewMessage(""); // Clear the input after sending the message

      console.log("Message sent successfully");
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Error sending message, please try again.");
    }
  };
  const quitRide = async () => {
    if (!activeBeastId || !user) return; // Ensure there is an active ride

    try {
      const beastRef = doc(db, "carouselBeasts", activeBeastId);

      // Remove the rider from the beast
      await deleteDoc(beastRef);

      // Update the state to reflect the rider has quit
      setRiders((prevRiders) => ({
        ...prevRiders,
        [activeBeastId]: null,
      }));

      // Optionally clear the messages for the beast
      const messagesQuery = query(
        collection(db, "carouselChat"),
        where("beastId", "==", activeBeastId)
      );
      const messagesSnapshot = await getDocs(messagesQuery);

      const batch = writeBatch(db);
      messagesSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      setMessages((prevMessages) => ({
        ...prevMessages,
        [activeBeastId]: [],
      }));

      // Clear the active beast state
      setActiveBeastId(null);
      alert("You have quit the ride.");
    } catch (error) {
      console.error("Failed to quit the ride:", error);
      alert("Error quitting the ride. Please try again.");
    }
  };

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
            const beastMessages = messages[beastId] || [];
            const isEven = index % 2 === 1;
            const handleLogoClick = (index) => {
              const logo = logos[Math.floor(index / 2)];
              if (logo && logo.link) {
                window.open(logo.link, "_blank"); // Open the link in a new tab
              }
            };
            return (
              <div
                key={beastId}
                className="element"
                data-item={isEven ? "logo" : ""}
                style={{ position: "absolute", "--item": index + 1 }}
              >
                {" "}
                {/* Invisible clickable overlay div */}
                {isEven && (
                  <div
                    className="clickable-overlay"
                    onClick={() => handleLogoClick(index)}
                  >
                    TEST
                  </div>
                )}
                <div className="element2">
                  <div className="rider-beast-group">
                    {rider && (
                      <div className="rider-container">
                        <p className="rider-name">{rider.username}</p>
                        <img
                          src={rider.avatarUrl}
                          alt={rider.username}
                          className="rider-avatar"
                        />
                      </div>
                    )}
                    {beastMessages.length > 0 && (
                      <div className="message-container">
                        {beastMessages.map((msg, i) => (
                          <div
                            key={`${beastId}-msg-${i}`}
                            className="message-bubble"
                          >
                            <p>{msg.message}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    <div
                      className="beast"
                      style={{ backgroundImage: `url(${image.src})` }}
                      onClick={() => handleImageClick(image, beastId)}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {selectedImage && isRideConfirmationOpen && (
          <div>
            {/* Overlay div */}
            <div
              className="overlay"
              onClick={() => setIsRideConfirmationOpen(false)} // Close pop-up when clicking outside
              style={{
                position: "fixed",
                top: "-25rem",
                left: 0,
                width: "100vw",
                height: "100vh",
                backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent overlay
                zIndex: 999, // Ensure it's behind the modal but above other elements
              }}
            ></div>

            {/* Pop-up box */}
            <div
              style={{
                backgroundColor: "pink",
                border: "2px solid goldenrod",
                padding: "1rem",
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)", // Center the box
                zIndex: 1000, // Ensure it's above the overlay
                textAlign: "center", // Center content
              }}
              onClick={(e) => e.stopPropagation()} // Prevent click from closing pop-up
            >
              <h5>{selectedImage.title}</h5>
              <img
                src={selectedImage.src}
                alt={selectedImage.title}
                style={{ width: "100px", height: "100px" }}
              />

              {/* Conditionally show "Switch Rides?" */}
              {isRiding ? (
                <p>Switch Rides?</p>
              ) : (
                <p>Would you like to ride this beast?</p>
              )}

              <div
                style={{
                  marginTop: "10px",
                  display: "flex",
                  gap: "10px",
                  justifyContent: "center",
                  zIndex: "1001",
                }}
              >
                {/* Yes Button */}
                <Button
                  onClick={confirmRide}
                  style={{
                    padding: "5px 10px",
                    backgroundColor: "goldenrod",
                    border: "none",
                  }}
                >
                  Yes
                </Button>

                {/* No Button */}
                <Button
                  onClick={() => setIsRideConfirmationOpen(false)} // Close pop-up on "No"
                  style={{
                    padding: "5px 10px",
                    backgroundColor: "gray",
                    border: "none",
                  }}
                >
                  No
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
      {user && isRiding && activeBeastId && (
        <div className="chat-box-container">
          <h4>Chat for Beast: {activeBeastId}</h4>
          <p>Time Remaining: {timeRemaining}</p> {/* Show the time remaining */}
          <Input
            color={"black"}
            placeholder="Type your comment..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <Button onClick={() => handleSendMessage(activeBeastId)}>Send</Button>
          {/* Quit Ride Button */}
          <Button
            onClick={quitRide}
            style={{
              marginTop: "10px",
              backgroundColor: "red",
              color: "white",
            }}
          >
            Quit Ride
          </Button>
        </div>
      )}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        redirectTo={currentUrl}
      />
    </div>
  );
};

export default Carousel;
