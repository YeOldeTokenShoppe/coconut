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

const Carousel = ({ images, logos }) => {
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

    return () => unsubscribe(); // Return the unsubscribe function for cleanup
  };
  const confirmRide = async () => {
    setIsRideConfirmationOpen(false);

    if (!user) {
      showPopupMessage("Please sign in to ride the beast.");
      return;
    }

    try {
      const beastId = selectedImage.beastId;
      const newRiderData = {
        userId: user.id,
        imageUrl: user.imageUrl,
        username: user.username || "Anonymous",
      };

      console.log("Setting active beast ID:", beastId); // Log the beast ID

      // Update local state immediately to show the avatar and username
      setRiders((prevRiders) => ({
        ...prevRiders,
        [beastId]: newRiderData,
      }));
      setActiveBeastId(beastId); // Ensure this is correctly set
      setIsRiding(true);
      setSelectedImage(null);

      // Check if the user is already riding any beast
      const existingRidesQuery = query(
        collection(db, "carouselBeasts"),
        where("userId", "==", user.id)
      );
      const existingRidesSnapshot = await getDocs(existingRidesQuery);

      // If the user is already riding another beast, remove the existing ride
      if (!existingRidesSnapshot.empty) {
        const existingRideRef = existingRidesSnapshot.docs[0].ref;
        await deleteDoc(existingRideRef);
      }

      await runTransaction(db, async (transaction) => {
        const beastRef = doc(db, "carouselBeasts", beastId);
        const beastDoc = await transaction.get(beastRef);

        if (!beastDoc.exists() || !beastDoc.data().userId) {
          transaction.set(beastRef, {
            ...newRiderData,
            timestamp: serverTimestamp(),
          });
        } else {
          throw new Error("Beast is already occupied by another rider.");
        }
      });

      // Load messages for this beast
      loadMessages(beastId); // Ensure this is called correctly

      console.log("Rider set successfully:", newRiderData);
    } catch (error) {
      console.error("Failed to ride beast:", error);
      showPopupMessage("Failed to ride beast. Please try again.");
      setRiders((prevRiders) => ({
        ...prevRiders,
        [selectedImage.beastId]: null,
      }));
      setIsRiding(false);
      setActiveBeastId(null);
    }
  };
  useEffect(() => {
    if (!activeBeastId) {
      console.log("No active beast ID, skipping chat box");
      return;
    }

    console.log("Listening for messages for beast ID:", activeBeastId);

    const messagesQuery = query(
      collection(db, "carouselChat"),
      where("beastId", "==", activeBeastId)
    );

    const unsubscribeMessages = onSnapshot(messagesQuery, (querySnapshot) => {
      const newMessages = [];
      querySnapshot.forEach((doc) => {
        newMessages.push(doc.data());
      });

      console.log("New messages received:", newMessages);

      setMessages((prevMessages) => ({
        ...prevMessages,
        [activeBeastId]: newMessages,
      }));
    });

    return () => unsubscribeMessages(); // Cleanup listener on component unmount
  }, [activeBeastId]);
  const handleSendMessage = async (beastId) => {
    if (newMessage.trim() === "" || !user) {
      showPopupMessage("Please enter a message and ensure you are logged in.");
      return;
    }

    if (newMessage.length > MAX_MESSAGE_LENGTH) {
      showPopupMessage(
        `Message is too long. Maximum length is ${MAX_MESSAGE_LENGTH} characters.`
      );
      return;
    }

    try {
      // Query to find the user's previous message for the same beast
      const previousMessageQuery = query(
        collection(db, "carouselChat"),
        where("beastId", "==", beastId),
        where("riderId", "==", user.id)
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
        riderId: user.id,
        riderName: user.username || "Anonymous",
        imageUrl: user.imageUrl || "/defaultAvatar.png",
        timestamp: serverTimestamp(),
        beastId,
      });

      console.log("Message sent successfully to Firestore");
      setNewMessage(""); // Clear the input after sending the message
    } catch (error) {
      console.error("Failed to send message:", error);
      showPopupMessage("Failed to send the message. Please try again.");
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
              setIsRiding(false); // This hides the chat box when time is up
              setActiveBeastId(null);
            }
          }

          // Remove rider and messages if ride time exceeds 10 minutes
          if (timeElapsed > totalTime) {
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

            // Use writeBatch for efficient deletions
            const batch = writeBatch(db);
            messagesSnapshot.forEach((doc) => {
              batch.delete(doc.ref);
            });
            await batch.commit();

            // Clear messages from local state
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

  const quitRide = async () => {
    if (!activeBeastId || !user) return;

    try {
      const beastRef = doc(db, "carouselBeasts", activeBeastId);

      // Remove the rider from the beast
      await deleteDoc(beastRef);

      setRiders((prevRiders) => ({
        ...prevRiders,
        [activeBeastId]: null,
      }));

      // Query Firestore for all messages for the current beast from this user
      const messagesQuery = query(
        collection(db, "carouselChat"),
        where("beastId", "==", activeBeastId),
        where("riderId", "==", user.id) // Find all messages by the current user
      );
      const messagesSnapshot = await getDocs(messagesQuery);

      // Delete all messages for this user on the current beast
      const batch = writeBatch(db);
      messagesSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      setMessages((prevMessages) => ({
        ...prevMessages,
        [activeBeastId]: [], // Clear local state as well
      }));

      setActiveBeastId(null);
      setIsRiding(false);
    } catch (error) {
      console.error("Failed to quit the ride:", error);
      showPopupMessage("Error quitting the ride. Please try again.");
    }
  };
  useEffect(() => {
    if (!activeBeastId) return;

    const messagesQuery = query(
      collection(db, "carouselChat"),
      where("beastId", "==", activeBeastId)
    );

    const unsubscribeMessages = onSnapshot(messagesQuery, (querySnapshot) => {
      const newMessages = [];
      querySnapshot.forEach((doc) => {
        newMessages.push(doc.data());
      });

      console.log("New messages received:", newMessages); // Log messages here

      // Update the messages state
      setMessages((prevMessages) => ({
        ...prevMessages,
        [activeBeastId]: newMessages,
      }));
    });

    return () => unsubscribeMessages(); // Cleanup listener on component unmount
  }, [activeBeastId]);
  // Ensure that no other instances of the user's avatar remain:
  useEffect(() => {
    const checkExistingRides = async () => {
      if (user) {
        const existingRidesQuery = query(
          collection(db, "carouselBeasts"),
          where("userId", "==", user.id)
        );
        const existingRidesSnapshot = await getDocs(existingRidesQuery);

        // Remove all instances where the user is riding
        existingRidesSnapshot.forEach(async (doc) => {
          await deleteDoc(doc.ref);
        });

        // Update the local state to reflect these changes
        setRiders((prevRiders) =>
          Object.fromEntries(
            Object.entries(prevRiders).map(([key, value]) =>
              value?.userId === user.id ? [key, null] : [key, value]
            )
          )
        );
      }
    };

    checkExistingRides();
  }, [user, activeBeastId]);
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
                  border: "2px solid goldenrod",
                  position: "absolute",
                  padding: "1rem",
                  gap: "10px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  zIndex: 1000,
                  textAlign: "center",
                }}
                onClick={(e) => e.stopPropagation()} // Prevent click from closing pop-up
              >
                <h4>{selectedImage.title}</h4>
                <Image
                  src={selectedImage.src}
                  alt={selectedImage.title}
                  style={{
                    width: "100px",
                    height: "100px",
                    objectFit: "contain",
                  }}
                />
                <p>Would you like to ride this beast?</p>
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

        {/* Chat box and other conditional rendering */}
        {isRiding && activeBeastId && (
          <div
            className="chat-box-container"
            style={{
              backgroundColor: "#ffc3ec",
              border: "1px solid black",
              padding: "10px",
              marginTop: "20px",
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
                  width: "90%",
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
          Join your friends and fellow token-holders for a wild ride with RL80's
          collection of creatures through the ups and downs of the markets. Must
          be at least 36" tall and hold RL80 or PY80 tokens. 10 minutes per
          ride. Your username and avatar will be displayed live! Click on any
          available beast to ride.
        </Text>
      </Box>
    </div>
  );
};

export default Carousel;
