"use client";
import React, { useState, useEffect } from "react";
import {
  Button,
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Box,
  Image as ChakraImage,
  Text,
} from "@chakra-ui/react";
import { useDisconnect } from "thirdweb/react";
import { ethers } from "ethers";
import { useActiveAccount, TransactionButton } from "thirdweb/react";
import ConnectButton2 from "./ConnectButton2";
import { burn } from "thirdweb/extensions/erc20";
import { CONTRACT } from "../utilities/constants";
import ImageSelectionModal from "./ImageSelectionModal";
import TokenText from "./TokenText";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../utilities/firebaseClient";
import AuthModal from "./AuthModal";
import { doc, getDoc } from "firebase/firestore"; // For Firestore document access
import { db } from "../utilities/firebaseClient"; // Ensure this points to your Firebase config file

function BurnModal({
  isOpen,
  onClose,
  onTransactionComplete,
  selectedImage,
  setSelectedImage,
  burnedAmount,
  setBurnedAmount,
  setIsResultSaved,
  setSaveMessage,
  isResultSaved, // Accept isResultSaved as a prop
  saveMessage, // Accept saveMessage as a prop
}) {
  const account = useActiveAccount();
  const signer = account?.address || "";
  const { disconnect } = useDisconnect();
  const [isFlameVisible, setIsFlameVisible] = useState(false);
  const [value, setValue] = useState(1000);
  const [transactionStatus, setTransactionStatus] = useState("idle");
  const [transactionCompleted, setTransactionCompleted] = useState(false);
  const [isImageSelectionModalOpen, setIsImageSelectionModalOpen] =
    useState(false);

  const [userConfirmed, setUserConfirmed] = useState(false);
  const [user, setUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false); // Added for AuthModal
  const [errorMessage, setErrorMessage] = useState(null);
  const [userName, setUserName] = useState("");
  const [userMessage, setUserMessage] = useState("");
  const [CustomName, setCustomName] = useState("");
  const [frameChoice, setFrameChoice] = useState("");
  const [zoom, setZoom] = useState(1);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [croppedArea, setCroppedArea] = useState(null);
  const shouldShowFrame = (imageUrl) => {
    return (
      imageUrl.includes("userImages") ||
      imageUrl === avatarUrl ||
      selectedImage.isFirstImage
    );
  };

  let avatarUrl = user ? user.photoURL : "/defaultAvatar.png"; // Fallback to default if user has no profile image
  useEffect(() => {
    console.log("Selected Image in BurnModal after save:", selectedImage);
  }, [selectedImage]);
  const getFormattedImageUrl = (url) => {
    if (!url) return "";
    // Only add `?alt=media` for Firebase URLs
    if (url.includes("firebasestorage")) {
      return url.includes("alt=media") ? url : `${url}&alt=media`;
    }
    return url; // Return the URL as-is for external links (like Twitter)
  };

  // Firebase Auth State Listener
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user); // Set the user state when signed in
      setUserName(user ? user.displayName || "Anonymous" : ""); // Set userName based on the user state
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://platform.twitter.com/widgets.js";
    script.async = true;
    document.body.appendChild(script);

    // Clean up script when component unmounts
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    const handleFetchImage = async () => {
      try {
        const userId = user.uid;
        const resultRef = doc(db, "results", userId);
        const resultSnap = await getDoc(resultRef);
        if (resultSnap.exists()) {
          const resultData = resultSnap.data();
          let imageUrl = resultData.image.src;

          // If the image URL is a Twitter image, adjust to fetch the "bigger" size
          if (imageUrl.includes("pbs.twimg.com/profile_images")) {
            // Replace "_normal" with "_bigger" to get a higher quality profile image
            imageUrl = imageUrl.replace("_normal", "_bigger");
          }

          // Set the selected image with the correct frame and profile image URL
          setSelectedImage({ ...resultData.image, src: imageUrl });
          console.log("Image fetched for BurnModal:", imageUrl);
        }
      } catch (error) {
        console.error("Error fetching saved image:", error);
      }
    };

    if (transactionStatus === "completed" && isResultSaved) {
      handleFetchImage(); // Fetch the image from Firestore once the save is confirmed
    }
  }, [transactionStatus, isResultSaved]);

  // Ensure the fetched image is displayed correctly, including the frame
  {
    selectedImage && selectedImage.src && (
      <Box
        as="img"
        src={getFormattedImageUrl(selectedImage.src)}
        alt="Selected"
        position="absolute"
        top="60%"
        left="50%"
        transform="translate(-50%, -50%)"
        width="calc(100% - 2rem)"
        height="auto"
        zIndex="-1"
        borderRadius={selectedImage.isFirstImage ? "50%" : "0"}
      />
    );
  }

  const handleClose = () => {
    // Reset the image and any other states here
    setSelectedImage(null);
    setIsResultSaved(false);

    // Close the modal
    onClose();
  };

  const handleOpenImageSelectionModal = () => {
    if (user) {
      setIsImageSelectionModalOpen(true);
    } else {
      setIsAuthModalOpen(true); // Open AuthModal if not signed in
    }
  };

  const handleCloseImageSelectionModal = () => {
    // Close the modal
    setIsImageSelectionModalOpen(false);

    // Reset the relevant states to initial values
    setSelectedImage(null); // Clear the selected image
    // setUploadedImage(null);
    setUserMessage(""); // Reset the user message
    setCustomName(""); // Reset custom name
    setFrameChoice("frame1"); // Reset frame to default
    setIsResultSaved(false); // Reset result saved status
    setSaveMessage(""); // Clear save message
    setCrop({ x: 0, y: 0 }); // Reset crop values
    setZoom(1); // Reset zoom
    setCroppedArea(null); // Clear cropped area
    setBurnedAmount(0); // Reset burned amount
  };
  const handleSaveResult = ({ userName, image, userMessage }) => {
    console.log(`Saving Result - Image URL: ${image.src}`);
    setUserName(userName);
    setSelectedImage(image); // Assuming `image` has an `isFirstImage` property
    setUserMessage(userMessage);
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} size="md" motionPreset="2">
        <ModalOverlay style={{ backdropFilter: "blur(8px)" }} />
        <ModalContent
          bg="#1b1724"
          borderRadius="lg"
          border="2px"
          borderColor="#8e662b"
        >
          <ModalHeader
            fontSize="2.3rem"
            mb={3}
            mt={4}
            fontFamily={"UnifrakturCook"}
            color="#8e662b"
            style={{ borderBottom: "1px solid #8e662b" }}
          >
            {transactionStatus === "completed"
              ? "Transaction Complete!"
              : "Burn an Offering?"}
          </ModalHeader>

          {transactionStatus === "completed" && (
            <Text fontSize="large" align={"center"} ml={7} mr={7}>
              Your transaction has been completed successfully.
            </Text>
          )}
          <ModalBody
            className={
              transactionStatus === "completed" && isResultSaved
                ? ""
                : isFlameVisible
                ? "gradient-background"
                : ""
            }
          >
            {transactionStatus === "pending" && (
              <Flex
                justifyContent="center"
                alignItems="center"
                flexDirection="column"
                marginTop="3rem"
              >
                <TokenText />
                <Text className="blink" style={{ fontSize: "20px" }}>
                  Please wait - transaction pending...
                </Text>
              </Flex>
            )}
            {transactionStatus === "failed" && (
              <div>
                <p>Transaction failed:</p>
                <p>{errorMessage}</p> {/* Display the error message */}
              </div>
            )}
            {(transactionStatus !== "completed" || !isResultSaved) &&
              transactionStatus !== "pending" && (
                <div className="holder">
                  <div className="candle">
                    <div className="thread"></div>
                    {isFlameVisible && (
                      <>
                        <div className="blinking-glow"></div>
                        <div className="glow"></div>
                        <div className="flame"></div>
                      </>
                    )}
                  </div>
                </div>
              )}
            {transactionStatus === "completed" && isResultSaved && (
              <div style={{ textAlign: "center" }}>
                <p>{`Thanks, ${userName}!`}</p>

                <Box
                  position="relative"
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  boxSize="9rem"
                  mb="8"
                  mt="5"
                >
                  {/* Display frame only if it's an image and not a video */}
                  {selectedImage &&
                    !selectedImage.isVideo && // Ensure it's not a video
                    selectedImage.frameChoice &&
                    shouldShowFrame(selectedImage.src) && (
                      <ChakraImage
                        src={`/${selectedImage.frameChoice}.png`} // Apply the correct frame
                        alt="Frame"
                        position="absolute"
                        top="0"
                        left="0"
                        width="100%"
                        height="100%"
                        objectFit="contain"
                        zIndex="200"
                        unoptimized
                      />
                    )}

                  {/* Display the selected image or video */}
                  {selectedImage && selectedImage.src && (
                    <>
                      {selectedImage.isVideo ? (
                        <Box
                          position="relative"
                          width="100%"
                          height="auto"
                          display="flex"
                          justifyContent="center"
                          alignItems="center"
                        >
                          <Box
                            as="video"
                            src={getFormattedImageUrl(selectedImage.src)} // Use formatted URL for video
                            autoPlay
                            loop
                            muted
                            playsInline
                            style={{
                              position: "absolute",
                              // top: "50%",
                              left: "80%",

                              width: "100%", // Ensure full width
                              height: "auto", // Maintain aspect ratio
                              zIndex: "1",
                            }}
                          />
                        </Box>
                      ) : (
                        <Box
                          as="img"
                          src={getFormattedImageUrl(selectedImage.src)} // Use the formatted URL for images
                          alt="Selected Image"
                          style={{
                            width: "calc(100% - 2rem)", // Adjust the width for images
                            height: "auto",
                            zIndex: "1",
                            borderRadius: selectedImage.isFirstImage
                              ? "50%"
                              : "0", // Apply border radius for avatar images
                          }}
                        />
                      )}
                    </>
                  )}
                </Box>
                <p>{userMessage}</p>
                <p>{saveMessage}</p>
              </div>
            )}
            {transactionStatus === "idle" && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  flexDirection: "column",
                  alignItems: "center",
                  paddingTop: "20px",
                }}
              >
                <p>Choose token amount to burn.</p>
                <NumberInput
                  size="lg"
                  maxW={32}
                  defaultValue={1000}
                  min={0}
                  step={1000}
                  value={value}
                  onChange={(valueAsString, valueAsNumber) =>
                    setValue(valueAsNumber)
                  }
                >
                  <NumberInputField color="white" />
                  <NumberInputStepper>
                    <NumberIncrementStepper color="white" />
                    <NumberDecrementStepper color="white" />
                  </NumberInputStepper>
                </NumberInput>
              </div>
            )}
          </ModalBody>
          <ModalFooter justifyContent="center">
            {!account ? (
              <ConnectButton2 />
            ) : transactionStatus !== "completed" && !isResultSaved ? (
              // Show burn button until the transaction is completed
              <TransactionButton
                className="burnButton"
                transaction={() =>
                  burn({
                    contract: CONTRACT,
                    amount: ethers.utils.parseUnits(value.toString(), "ether"),
                  })
                }
                onTransactionSent={() => {
                  setTransactionStatus("pending");
                }}
                onTransactionConfirmed={(receipt) => {
                  setIsFlameVisible(true);
                  setTransactionStatus("completed");
                  setTransactionCompleted(true);
                  setBurnedAmount(value);

                  console.log("Image after transaction:", selectedImage); // Debug log

                  if (typeof onTransactionComplete === "function") {
                    onTransactionComplete();
                  }
                }}
                onError={(error) => {
                  setTransactionStatus("failed");
                  setErrorMessage(error.message); // Set the error message
                  console.error("Transaction failed:", error);
                }}
              >
                {transactionStatus === "pending"
                  ? "Transaction Pending..."
                  : transactionStatus === "failed"
                  ? "Transaction Failed"
                  : "Burn Offering"}
                <span className="shimmer"></span>
              </TransactionButton>
            ) : transactionCompleted && !isResultSaved ? (
              // Show 'Join the Hall of Flame' button after transaction is completed but before saving the image
              <Button
                className="shimmer-button"
                onClick={handleOpenImageSelectionModal}
              >
                <span className="text">
                  Join the <br />
                  Hall of Flame
                </span>
                <span className="shimmer"></span>
              </Button>
            ) : (
              // Show 'Return to Gallery' button after the image is saved
              <Button mt={0} className="shimmer-button" onClick={handleClose}>
                Return to Gallery
                <span className="shimmer"></span>
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
        <ImageSelectionModal
          isOpen={isImageSelectionModalOpen}
          setIsImageSelectionModalOpen={setIsImageSelectionModalOpen} // Pass the setter function
          onClose={handleCloseImageSelectionModal}
          setSelectedImage={setSelectedImage}
          burnedAmount={burnedAmount}
          setIsResultSaved={setIsResultSaved}
          setSaveMessage={setSaveMessage}
          onSaveResult={(savedImage) => {
            console.log("Saving image in BurnModal:", savedImage); // Debug log
            setSelectedImage(savedImage); // Set the image in BurnModal
          }}
        />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      </Modal>
    </>
  );
}

export default BurnModal;
