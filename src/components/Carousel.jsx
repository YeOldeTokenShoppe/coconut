"use client";

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
  writeBatch,
  setDoc,
} from "firebase/firestore";
import { auth, db } from "../utilities/firebaseClient.js"; // Ensure Firestore and Firebase Auth are initialized correctly
import {
  Clerk,
  useUser,
  SignedIn,
  SignedOut,
  SignInButton,
  useClerk,
} from "@clerk/nextjs"; // Use Clerk's useUser for user management
import { Button, Image, Input, Text, Heading, Box } from "@chakra-ui/react";
import { useRouter } from "next/router";
// import { useActiveAccount } from "thirdweb/react";
import StyledPopup from "./StyledPopup";
import { signInWithCustomToken } from "firebase/auth";
import axios from "axios";
import { useAuth } from "@clerk/nextjs"; // Add this line if it's missing

const Carousel = ({ images, logos, setCarouselLoaded }) => {
  const { isSignedIn, user, isLoaded } = useUser();
  const { openSignIn } = useClerk();
  const [firebaseUser, setFirebaseUser] = useState(null); // To store Firebase user data
  const [isHovered, setIsHovered] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [riders, setRiders] = useState({});
  const [isRideConfirmationOpen, setIsRideConfirmationOpen] = useState(false);
  const [messages, setMessages] = useState({});
  const [newMessage, setNewMessage] = useState("");
  const [activeBeastId, setActiveBeastId] = useState(null);
  const [isRiding, setIsRiding] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [rideActive, setRideActive] = useState(true);
  const [popupMessage, setPopupMessage] = useState("");
  const router = useRouter();
  const [currentPath, setCurrentPath] = useState("/");
  const MAX_MESSAGE_LENGTH = 100;

  useEffect(() => {
    // Simulate async data or image loading
    const loadCarouselContent = async () => {
      // Example: simulate loading (replace with real logic)
      await new Promise((resolve) => setTimeout(resolve, 500));
      setCarouselLoaded(true); // Notify parent that loading is complete
    };

    loadCarouselContent();
  }, [setCarouselLoaded]);

  useEffect(() => {
    // Ensure we capture the current path correctly, fallback to the root if router is not ready
    const path = router.asPath;
    if (path) {
      setCurrentPath(path);
    }
  }, [router.asPath]);
  // Show popup message logic
  const showPopupMessage = (
    message,
    onConfirm = null,
    onClose = handleClosePopup,
    showSingleButton = false
  ) => {
    setPopupMessage({ message, onConfirm, onClose, showSingleButton });
  };

  // Close popup
  const handleClosePopup = () => setPopupMessage("");

  useEffect(() => {
    const signIntoFirebase = async () => {
      try {
        const { getToken } = useAuth(); // Clerk's useAuth hook
        const token = await getToken({ template: "integration_firebase" });
        console.log("JWT token from Clerk:", token); // Debug: Log JWT token to ensure it’s fetched

        // Attempt to sign in to Firebase with the custom token
        const userCredentials = await signInWithCustomToken(auth, token);
        console.log("Signed into Firebase with user:", userCredentials.user);

        // Update firebaseUser state
        setFirebaseUser(userCredentials.user);

        return userCredentials.user;
      } catch (error) {
        console.error("Error signing into Firebase:", error);
        return null;
      }
    };

    if (isLoaded && isSignedIn && user && !firebaseUser) {
      signIntoFirebase().then((firebaseUser) => {
        if (firebaseUser) {
          console.log("Firebase user:", firebaseUser);
          fetchUserProfile(firebaseUser.uid); // Fetch or create user profile in Firestore
        } else {
          console.error("Failed to sign into Firebase");
        }
      });
    }
  }, [isLoaded, isSignedIn, user, firebaseUser]); // Add firebaseUser as a dependency
  // Fetch or create user profile in Firestore
  const fetchUserProfile = async (userId) => {
    try {
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);

      const userData = {
        userId,
        imageUrl: user.imageUrl || "./defaultAvatar.png", // Fetch from Clerk's user object
        username: user.username || "Anonymous",
        email: user.emailAddresses[0]?.emailAddress || null, // Email address
        provider: user.provider || null, // Add provider field
        identifier: user.externalId || user.id, // Add identifier, fallback to userId if missing
      };

      if (!userDoc.exists()) {
        await setDoc(userDocRef, userData, { merge: true });
      } else {
        await setDoc(userDocRef, userData, { merge: true }); // Update if fields are missing
      }
      setFirebaseUser(userData); // Ensure firebaseUser is updated correctly
    } catch (error) {
      console.error("Error fetching or creating user profile:", error);
    }
  };
  useEffect(() => {
    console.log("firebaseUser:", firebaseUser);
  }, [firebaseUser]);
  const handleRideBeastClick = (image, beastId) => {
    if (isSignedIn) {
      // If signed in, proceed with the ride confirmation
      handleImageClick(image, beastId);
    } else {
      // Show Clerk sign-in modal if not signed in
      openSignIn({ forceRedirectUrl: currentPath });
    }
  };

  const loadMessages = (beastId) => {
    if (!beastId) {
      console.error("Invalid beastId provided to loadMessages");
      return () => {}; // Return a no-op cleanup function
    }

    const messagesQuery = query(
      collection(db, "carouselChat"),
      where("beastId", "==", beastId)
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const beastMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Update the messages state
      setMessages((prevMessages) => ({
        ...prevMessages,
        [beastId]: beastMessages,
      }));
    });

    console.log(`Subscribed to messages for beastId: ${beastId}`);
    return () => {
      console.log(`Unsubscribed from messages for beastId: ${beastId}`);
      unsubscribe();
    };
  };

  const updateBeastChat = async (beastId, riderData, message = "") => {
    try {
      const beastChatRef = doc(db, "carouselChat", beastId);

      // Merge rider data and message
      await setDoc(
        beastChatRef,
        {
          beastId,
          ...riderData,
          message,
          timestamp: serverTimestamp(),
        },
        { merge: true } // Update existing fields, add new ones if missing
      );

      console.log(`Beast chat updated for ${beastId}`);
    } catch (error) {
      console.error(`Failed to update chat for ${beastId}:`, error);
    }
  };
  const confirmRide = async () => {
    if (!user) {
      showPopupMessage("Please sign in to ride the beast.");
      return;
    }

    try {
      const beastId = selectedImage.beastId;

      // Check for and clean up any old rides
      await checkExistingRides();

      // Check if the beast is already occupied
      const beastRef = doc(db, "carouselBeasts", beastId);
      const beastDoc = await getDoc(beastRef);

      if (beastDoc.exists() && beastDoc.data().userId) {
        throw new Error("Beast is already occupied by another rider.");
      }

      const riderData = {
        userId: user.id,
        username: user.username || "Anonymous",
        imageUrl: user.imageUrl || "/defaultAvatar.png",
        timestamp: serverTimestamp() || new Date(), // Add fallback
      };

      // Save the rider to Firestore
      await setDoc(beastRef, riderData);
      console.log("Rider successfully set in Firestore:", riderData);

      // Update state
      setActiveBeastId(beastId);
      setIsRiding(true);
      setIsRideConfirmationOpen(false);
    } catch (error) {
      console.error("Failed to confirm ride:", error);
      showPopupMessage(error.message || "Failed to confirm ride.");
    }
  };
  useEffect(() => {
    const syncState = async () => {
      try {
        const ridersSnapshot = await getDocs(collection(db, "carouselBeasts"));
        const fetchedRiders = {};
        let userActiveBeast = null;

        ridersSnapshot.forEach((doc) => {
          const beastId = doc.id;
          const riderData = doc.data();
          if (riderData.userId) {
            fetchedRiders[beastId] = riderData;
          }

          if (user && riderData.userId === user.id) {
            userActiveBeast = beastId;
          }
        });

        console.log("Synced riders from Firestore:", fetchedRiders);
        setRiders(fetchedRiders);
        setActiveBeastId(userActiveBeast || null);
        setIsRiding(!!userActiveBeast);
      } catch (error) {
        console.error("Error syncing state with Firestore:", error);
      }
    };

    if (isLoaded && isSignedIn) syncState();
  }, [isLoaded, isSignedIn, user]);

  useEffect(() => {
    if (!activeBeastId) return;

    console.log(
      `Setting up listener for messages on beastId: ${activeBeastId}`
    );

    const messagesQuery = query(
      collection(db, "carouselChat"),
      where("beastId", "==", activeBeastId)
    );

    const unsubscribeMessages = onSnapshot(messagesQuery, (querySnapshot) => {
      const newMessages = [];
      querySnapshot.forEach((doc) => {
        newMessages.push(doc.data());
      });

      console.log("New messages received:", newMessages); // Log messages for debugging

      setMessages((prevMessages) => ({
        ...prevMessages,
        [activeBeastId]: newMessages,
      }));
    });

    return () => {
      console.log(
        `Cleaning up listener for messages on beastId: ${activeBeastId}`
      );
      unsubscribeMessages();
    };
  }, [activeBeastId]);
  const handleSendMessage = async (beastId) => {
    if (!newMessage.trim() || !user) {
      showPopupMessage("Please enter a message and ensure you are logged in.");
      return;
    }

    try {
      const messageData = {
        beastId,
        message: newMessage,
        userId: user.id,
        username: user.username || "Anonymous",
        imageUrl: user.imageUrl || "/defaultAvatar.png",
        timestamp: serverTimestamp(),
      };

      // Use setDoc with beastId as the document ID to overwrite previous messages
      const messageRef = doc(db, "carouselChat", beastId);
      await setDoc(messageRef, messageData);

      console.log("Message sent and replaced successfully in Firestore");
      setNewMessage(""); // Clear input
    } catch (error) {
      console.error("Failed to send message:", error);
      showPopupMessage("Failed to send the message. Please try again.");
    }
  };

  const deleteMessagesForBeast = async (beastId) => {
    try {
      const messagesQuery = query(
        collection(db, "carouselChat"),
        where("beastId", "==", beastId)
      );
      const messagesSnapshot = await getDocs(messagesQuery);

      console.log(
        `Found ${messagesSnapshot.size} messages to delete for beastId: ${beastId}`
      );

      if (!messagesSnapshot.empty) {
        const batch = writeBatch(db);

        messagesSnapshot.forEach((doc) => {
          console.log(`Deleting document: ${doc.id}`);
          batch.delete(doc.ref);
        });

        await batch.commit();
        console.log("Batch deletion successful for beastId:", beastId);
      } else {
        console.log("No messages to delete for beastId:", beastId);
      }
    } catch (error) {
      console.error("Error deleting messages for beastId:", beastId, error);
    }
  };
  useEffect(() => {
    if (!isRiding || !activeBeastId) return;

    const intervalId = setInterval(async () => {
      try {
        const beastRef = doc(db, "carouselBeasts", activeBeastId);
        const beastDoc = await getDoc(beastRef);

        if (beastDoc.exists()) {
          const rideData = beastDoc.data();
          const rideStartTime = rideData.timestamp?.toMillis();

          if (!rideStartTime) {
            console.error(
              "Invalid rideStartTime. Skipping expiration check.",
              rideData
            );
            return;
          }

          const currentTime = Date.now();
          const elapsedTime = currentTime - rideStartTime;
          const maxRideTime = 10 * 60 * 1000; // 10 minutes in milliseconds

          if (elapsedTime >= maxRideTime) {
            console.log(
              "Ride expired. Deleting beast and messages:",
              activeBeastId
            );

            await deleteDoc(beastRef);
            await deleteMessagesForBeast(activeBeastId);

            setRiders((prevRiders) => ({
              ...prevRiders,
              [activeBeastId]: null,
            }));

            setMessages((prevMessages) => ({
              ...prevMessages,
              [activeBeastId]: [],
            }));

            setActiveBeastId(null);
            setIsRiding(false);
            setTimeRemaining("Ride has ended");
          } else {
            // Update remaining time display
            const timeLeft = maxRideTime - elapsedTime;
            const minutes = Math.floor(timeLeft / (1000 * 60));
            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
            setTimeRemaining(`${minutes}m ${seconds}s`);
          }
        }
      } catch (error) {
        console.error("Error in ride expiration logic:", error);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [activeBeastId, isRiding]);

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

  const quitRide = async () => {
    if (!activeBeastId || !user) return;

    try {
      const beastRef = doc(db, "carouselBeasts", activeBeastId);

      // Remove the rider from the beast
      await deleteDoc(beastRef);
      console.log(`Deleted Firestore document for beastId: ${activeBeastId}`);

      // Query Firestore for all messages for the current beast
      const messagesQuery = query(
        collection(db, "carouselChat"),
        where("beastId", "==", activeBeastId)
      );
      const messagesSnapshot = await getDocs(messagesQuery);

      // Delete all messages for this beast in Firestore
      const batch = writeBatch(db);
      messagesSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      // Clear messages from local state
      setMessages((prevMessages) => ({
        ...prevMessages,
        [activeBeastId]: [], // Ensure local messages are also cleared
      }));

      setActiveBeastId(null);
      setIsRiding(false);
    } catch (error) {
      console.error("Failed to quit the ride:", error);
      showPopupMessage("Error quitting the ride. Please try again.");
    }
  };

  const checkExistingRides = async () => {
    if (user) {
      try {
        const existingRidesQuery = query(
          collection(db, "carouselBeasts"),
          where("userId", "==", user.id)
        );
        const existingRidesSnapshot = await getDocs(existingRidesQuery);

        // Iterate through existing rides and delete them
        for (const rideDoc of existingRidesSnapshot.docs) {
          if (rideDoc.id !== activeBeastId) {
            // Skip active beast
            console.log(`Deleting old ride for beast: ${rideDoc.id}`);
            await deleteDoc(rideDoc.ref);
          }
        }

        // Update local state to reflect the changes
        setRiders((prevRiders) =>
          Object.fromEntries(
            Object.entries(prevRiders).map(([key, value]) =>
              value?.userId === user.id ? [key, null] : [key, value]
            )
          )
        );
      } catch (error) {
        console.error("Error checking existing rides:", error);
      }
    }
  };

  useEffect(() => {
    const unsubscribeRiders = onSnapshot(
      collection(db, "carouselBeasts"),
      (snapshot) => {
        const updatedRiders = {};
        snapshot.forEach((doc) => {
          const data = doc.data();
          console.log(`Firestore document change: ${doc.id}`, data); // Log every change
          updatedRiders[doc.id] = data;
        });
        setRiders(updatedRiders);
      }
    );

    return () => unsubscribeRiders();
  }, []);
  const handleCloseChatBox = () => {
    if (rideActive) {
      // Show a confirmation popup only if the ride is still active
      showPopupMessage("Are you sure you want to end the ride?", () => {
        quitRide(); // Quit the ride if confirmed
        setIsRiding(false); // Ensure the state is updated correctly
        setActiveBeastId(null);
      });
    } else {
      // Directly close the chat box if the ride has ended
      setIsRiding(false);
      setActiveBeastId(null);
    }
  };
  const handleImageClick = (image, beastId) => {
    setSelectedImage({ ...image, beastId });
    setIsRideConfirmationOpen(true); // Open the ride confirmation prompt
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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
      }}
    >
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

              return (
                <div
                  key={beastId}
                  className="element"
                  data-item={isEven ? "logo" : ""}
                  style={{ position: "absolute", "--item": index + 1 }}
                >
                  <div className="element2">
                    <div className="rider-beast-group">
                      <div
                        className="beast"
                        style={{ backgroundImage: `url(${image.src})` }}
                        onClick={() => handleRideBeastClick(image, beastId)}
                      >
                        {rider && (
                          <div className="rider-container">
                            <p className="rider-name">{rider.username}</p>
                            <img
                              src={rider.imageUrl}
                              alt={rider.username}
                              className="rider-avatar"
                            />
                          </div>
                        )}
                      </div>

                      {beastMessages.length > 0 && (
                        <div className="message-bubble">
                          <p>
                            {beastMessages[beastMessages.length - 1].message}
                          </p>
                        </div>
                      )}
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
                className="clickable-overlay"
                onClick={() => setIsRideConfirmationOpen(false)} // Close pop-up when clicking outside
                style={{
                  position: "fixed",
                  top: "-25rem",
                  left: 0,
                  width: "100vw",
                  height: "100vh",
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  zIndex: 999,
                }}
              ></div>

              {/* Pop-up box */}
              <div
                style={{
                  backgroundColor: "pink",
                  border: "3px solid goldenrod",
                  position: "absolute",
                  padding: "1rem",
                  // gap: "10px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  zIndex: 1000,
                  textAlign: "center",
                  borderRadius: "10px",
                }}
                onClick={(e) => e.stopPropagation()} // Prevent click from closing pop-up
              >
                <Heading>{selectedImage.title}</Heading>
                <Image
                  src={selectedImage.src}
                  alt={selectedImage.title}
                  style={{
                    width: "8rem",
                    height: "8rem",
                    objectFit: "contain",
                  }}
                />
                <p>Ride this beast?</p>
                <div
                  style={{
                    marginTop: "10px",
                    display: "flex",
                    gap: "10px",
                    justifyContent: "center",
                  }}
                >
                  <Button
                    onClick={confirmRide}
                    style={{
                      padding: "5px 10px",
                      backgroundColor: "#ffffff",
                      border: "none",
                    }}
                  >
                    Yes
                  </Button>
                  <Button
                    onClick={() => setIsRideConfirmationOpen(false)}
                    style={{
                      padding: "5px 10px",
                      backgroundColor: "#ffffff",
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

        {isRiding && activeBeastId && (
          <div
            className="chat-box-container"
            style={{
              backgroundColor: "#ffc3ec",
              border: "1px solid black",
              padding: "10px",
              position: "fixed",
              zIndex: 9999,
              fontSize: "12px",
              width: "300px",
              left: "50%",
              transform: "translateX(-50%)",
              top: "20rem",
              borderRadius: "10px",
            }}
          >
            <button
              onClick={handleCloseChatBox}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "none",
                border: "none",
                fontSize: "16px",
                cursor: "pointer",
              }}
            >
              ×
            </button>

            <Heading
              mt={1}
              mb={1}
              lineHeight={0.9}
              style={{
                fontSize: "2em",
                overflowWrap: "normal",
                zIndex: "1",
              }}
            >
              Chat Box
            </Heading>

            <div
              style={{
                marginTop: "10px",
                display: "flex",
                alignItems: "center",
                width: "90%",
              }}
            >
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newMessage.trim() !== "") {
                    handleSendMessage(activeBeastId);
                  }
                }}
                disabled={!rideActive}
                style={{
                  backgroundColor: "white",
                  width: "100%",
                  marginRight: "10px",
                  color: "black",
                }}
              />
              <Button
                onClick={() => handleSendMessage(activeBeastId)}
                disabled={!rideActive || newMessage.trim() === ""}
                style={{
                  background: "none",
                  border: "none",
                  cursor: rideActive ? "pointer" : "not-allowed",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="currentColor"
                  className="bi bi-send"
                  viewBox="0 0 16 16"
                >
                  <path d="M15.854.146a.5.5 0 0 1 .057.638l-6 9a.5.5 0 0 1-.888-.07L7.06 6.196 1.423 4.602a.5.5 0 0 1 .013-.975l14-4a.5.5 0 0 1 .418.519z" />
                  <path d="M6.832 10.179a.5.5 0 0 1 .683.183L12 16a.5.5 0 0 1-.853.354L6.832 10.18z" />
                </svg>
              </Button>
            </div>
            <p>Time Remaining: {timeRemaining}</p>
          </div>
        )}

        {popupMessage && (
          <StyledPopup
            message={popupMessage.message} // Access the message property
            onClose={handleClosePopup}
            onConfirm={popupMessage.onConfirm} // Pass the confirm function if applicable
          />
        )}
      </div>
      <Box
        width="80%"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        padding="1rem"
        zIndex={-1}
        marginTop="20rem"
        gap=".9rem"
        style={{
          visibility: isRiding ? "hidden" : "visible", // Toggle visibility
          height: isRiding ? "0" : "auto", // Maintain layout space when hidden
          overflow: "hidden", // Prevent any content from showing if hidden
          transition: "visibility 0s, height 0.3s ease-in-out", // Smooth transition
        }}
      >
        <Text
          fontSize="2rem"
          fontWeight="bold"
          fontFamily="UnifrakturCook"
          lineHeight="1"
          color="#c48901"
          marginBottom="-.5rem"
        >
          RL80 Tokens Are Your Ticket to Ride!
        </Text>
        <Text
          as="h2"
          fontSize="2.5rem"
          fontWeight="bold"
          fontFamily="Oleo Script"
          lineHeight="1"
          marginBottom="-.5rem"
        ></Text>
        <Text>
          {" "}
          Charter a wild ride on the charts with your frens and fellow token
          holders! Must be at least 36" tall and hold RL80 or PY80 tokens. 10
          minutes per ride. Your username and avatar will be displayed live!
          Click on any available beast to ride.
        </Text>
      </Box>
    </div>
  );
};

export default Carousel;
