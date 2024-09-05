"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Alert,
  AlertIcon,
  Input,
  Text,
  Image,
} from "@chakra-ui/react";
import { setDoc, doc, serverTimestamp } from "firebase/firestore";
import {
  getStorage,
  ref,
  deleteObject,
  uploadString,
  getDownloadURL,
} from "firebase/storage";
import { db, auth } from "../utilities/firebaseClient";
import { onAuthStateChanged } from "firebase/auth";
import Carousel8 from "./Carousel8";
import AuthModal from "./AuthModal";
import UploadImage from "./UploadImage";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "../utilities/cropImageUtility";

function ImageSelectionModal({
  isOpen,
  onOpen,
  onClose,
  burnedAmount,
  isResultSaved,
  setIsResultSaved,
  setSaveMessage,
  onSaveResult,
}) {
  const [user, setUser] = useState(null);
  const [showWarning, setShowWarning] = useState(false);
  const [showLoginError, setShowLoginError] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [uploadedImage, setUploadedImage] = useState("");
  const [userMessage, setUserMessage] = useState("");
  const [customName, setCustomName] = useState("");
  const [selectedImageObject, setSelectedImageObject] = useState(null);
  const [showImageWarning, setShowImageWarning] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [frameChoice, setFrameChoice] = useState("frame1");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState(null);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedArea(croppedAreaPixels);
  }, []);
  const handleSave = async () => {
    try {
      const croppedImage = await getCroppedImg(uploadedImage, croppedArea);

      // Initialize Firebase storage
      const storage = getStorage(); // Define storage
      const storageRef = ref(
        storage,
        `userImages/${user.uid}/${Date.now()}.jpg`
      );

      // Upload the cropped image to Firebase Storage
      await uploadString(storageRef, croppedImage, "data_url");
      const downloadURL = await getDownloadURL(storageRef);

      // Save metadata and image URL to Firestore
      const selectedFrame = frameChoice || "frame1";
      const userName = customName || user.displayName || "Anonymous";
      const userId = user.uid;

      await setDoc(doc(db, "results", userId), {
        userName,
        image: {
          src: downloadURL, // Save the cropped image URL
          isFirstImage: downloadURL === avatarUrl, // Check if it’s the first image
          frameChoice: selectedFrame,
        },
        userMessage,
        createdAt: serverTimestamp(),
        burnedAmount: burnedAmount,
      });

      setIsResultSaved(true);
      setSaveMessage(
        "You've been saved and you're entered in the next drawing!"
      );
      onClose();
    } catch (error) {
      console.error("Error cropping or saving the image", error);
    }
  };
  const framePaths = {
    frame1: "/frame1.png", // Replace with actual paths
    frame2: "/frame2.png",
    frame3: "/frame3.png",
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribeAuth();
  }, []);

  let avatarUrl = user ? user.photoURL : "/defaultAvatar.png";
  const params = new URLSearchParams();

  const imageUrls = [
    avatarUrl,
    // "/elmo.gif",
    "/dracarys.gif",
    "/frank.gif",
    "/homer.gif",
    "/sup.gif",
    "/louise.gif",
    "/smoke.gif",
    "/fever.gif",
    "/thing1.gif",
    "/corndog.gif",
    "/thing2.gif",
    "/sponge.gif",
    "/mona.gif",
    "/pikachu.gif",
    "/devito.gif",
    "/thing3.gif",
    "/thisisfine.gif",
    "/candles.gif",
  ];

  avatarUrl = `${avatarUrl}?${params.toString()}`;

  useEffect(() => {
    if (selectedImage) {
      setSelectedImageObject({
        src: selectedImage,
        isFirstImage: selectedImage === avatarUrl,
      });
    }
  }, [selectedImage, avatarUrl]);

  const handleOpen = () => {
    if (!user) {
      setIsAuthModalOpen(true);
    } else {
      onOpen();
    }
  };

  const handleClose = () => {
    if (!isResultSaved) {
      setShowWarning(true);
    } else {
      onClose();
    }
  };

  const normalizeUrl = (url) => {
    try {
      const urlObj = new URL(url);
      return urlObj.origin + urlObj.pathname;
    } catch (error) {
      console.error("Invalid URL", error);
      return url;
    }
  };

  const handleImageSelection = (image) => {
    // Set the selected image's URL directly
    if (image && image.url) {
      setSelectedImage(image.url); // Save only the URL, not the entire image object
      console.log("Selected image from carousel:", image.url);
    } else {
      console.error("No valid image selected.");
    }
  };

  const handleSaveResult = async () => {
    try {
      // If there's an uploaded image, use it. Otherwise, use the selected image or fallback to avatarUrl.
      let imageToSave = uploadedImage || selectedImage || avatarUrl; // Just use `selectedImage`, which is now a URL

      if (!imageToSave) {
        console.error("No valid image selected for saving.");
        return;
      }

      let downloadURL = imageToSave;

      // Handle cropping for uploaded images
      if (uploadedImage && croppedArea) {
        const croppedImageUrl = await getCroppedImg(uploadedImage, croppedArea);

        if (
          typeof croppedImageUrl === "string" &&
          croppedImageUrl.startsWith("data:")
        ) {
          const storage = getStorage();
          const storageRef = ref(
            storage,
            `userImages/${user.uid}/${Date.now()}.jpg`
          );
          await uploadString(storageRef, croppedImageUrl, "data_url");
          downloadURL = await getDownloadURL(storageRef); // Get Firebase URL for the cropped image
        } else {
          throw new Error("Invalid cropped image format.");
        }
      }

      // Check if the saved image is the user's avatar
      const isFirstImage = imageToSave === avatarUrl;

      // Validate required fields before saving
      if (!user || !user.uid || !user.displayName) {
        throw new Error("User information is missing. Cannot save result.");
      }

      if (!burnedAmount || isNaN(burnedAmount)) {
        throw new Error("Burned amount is invalid.");
      }

      const selectedFrame = frameChoice || "frame1";
      const userName = customName || user.displayName || "Anonymous";
      const userId = user.uid;

      // Log data before saving to Firestore
      console.log("Saving result with the following data:", {
        userName,
        image: {
          src: downloadURL,
          isFirstImage, // Whether it's the avatar or not
          frameChoice: selectedFrame,
        },
        userMessage,
        burnedAmount,
      });

      // Save result in Firestore
      await setDoc(doc(db, "results", userId), {
        userName,
        image: {
          src: downloadURL,
          isFirstImage, // Whether it's the avatar or not
          frameChoice: selectedFrame,
        },
        userMessage: userMessage || "",
        createdAt: serverTimestamp(),
        burnedAmount: burnedAmount || 0, // Ensure burnedAmount is valid
      });

      setIsResultSaved(true);
      setSaveMessage("Your image was successfully saved.");
      onClose();
    } catch (error) {
      console.error("Error saving result:", error);
    }
  };
  return (
    <>
      <Button onClick={handleOpen}>Join the Hall of Flame</Button>
      {showLoginError && (
        <Alert status="error">
          <AlertIcon />
          You must be logged in.
        </Alert>
      )}
      <Modal isOpen={isOpen} onClose={handleClose}>
        <ModalOverlay style={{ backdropFilter: "blur(10px)" }} />
        <ModalContent
          bg="#1b1724"
          border="2px"
          borderColor="#8e662b"
          width="30rem"
          maxWidth="50%"
          height="auto"
          maxHeight="90vh"
          overflowY="auto"
        >
          <ModalHeader style={{ textAlign: "center" }} paddingTop={5}>
            <span
              style={{
                fontFamily: "UnifrakturCook",
                fontSize: "1.5rem",
                color: "#8e662b",
              }}
            >
              Than<span style={{ fontFamily: "New Rocker" }}>{"k"}</span>s,{" "}
              <span style={{ fontFamily: "New Rocker" }}>
                {user ? user.displayName : "Guest"}!
              </span>{" "}
              You&apos;re a Saint!
            </span>
            <br />
            <Text fontSize="sm" mt={4} mb={1}>
              Select an image to feature in the main gallery or upload your own.
            </Text>
          </ModalHeader>
          <ModalBody>
            {showWarning && (
              <Alert
                status="warning"
                onClose={() => setShowWarning(false)}
                backgroundColor="#2b8597"
                fontSize={"small"}
                height={"50px"}
              >
                <AlertIcon height="100%" />
                {
                  "You haven't saved your result. Are you sure you want to close?"
                }
                <Button onClick={onClose} marginRight="1rem">
                  Yes
                </Button>
                <Button onClick={() => setShowWarning(false)}>No</Button>
              </Alert>
            )}
            <div style={{ overflow: "hidden" }}>
              <Carousel8
                images={imageUrls.map((url) => ({
                  url: url,
                  content: <img src={url} alt="Carousel item" />,
                }))}
                avatarUrl={avatarUrl}
                onImageSelect={handleImageSelection}
              />
            </div>
            <Text fontSize="sm" mt={4} mb={2}>
              Or upload your own image:
            </Text>

            <Box display="flex" justifyContent="center" mt={2} mb={4}>
              <UploadImage
                onUpload={(url) => {
                  setUploadedImage(url);
                  setSelectedImage(url);
                }}
              />
            </Box>

            {uploadedImage && (
              <>
                <Box
                  style={{
                    position: "relative",
                    width: "200px", // Set this to the width of your frame
                    height: "200px", // Set this to the height of your frame
                    overflow: "hidden", // Ensure the cropper doesn't exceed this container
                    margin: "0 auto", // Center the container
                  }}
                >
                  <Cropper
                    image={uploadedImage}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    onCropChange={setCrop} // Allows panning
                    onZoomChange={setZoom} // Allows zooming
                    onCropComplete={onCropComplete}
                    restrictPosition={false} // Allows free movement
                    style={{ zIndex: 5 }}
                  />
                  <Image
                    src={framePaths[frameChoice]} // Frame choice logic
                    alt="Frame"
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      zIndex: 10, // Make sure the frame has a higher z-index
                      pointerEvents: "none", // Prevent the frame from blocking interactions with the cropper
                    }}
                  />
                </Box>
                <Slider
                  aria-label="zoom-slider"
                  value={zoom}
                  min={0.5}
                  max={1.5}
                  step={0.1}
                  onChange={(val) => setZoom(val)} // This updates the zoom level
                  mt={4}
                >
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb />
                </Slider>
                <Box display="flex" justifyContent="center" mt={4}>
                  <Button
                    size="sm"
                    mr={2}
                    mb={2}
                    onClick={() => setFrameChoice("frame1")}
                  >
                    Frame 1
                  </Button>
                  <Button
                    size="sm"
                    mr={2}
                    onClick={() => setFrameChoice("frame2")}
                  >
                    Frame 2
                  </Button>
                  <Button size="sm" onClick={() => setFrameChoice("frame3")}>
                    Frame 3
                  </Button>
                </Box>
              </>
            )}

            <Input
              mb={2}
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Enter custom name (optional)"
            />
            <Input
              mb={-3}
              mt={2}
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              maxLength={40}
              placeholder="Add a message? (40 char. max)"
            />
          </ModalBody>
          <ModalFooter
            mb={0}
            mt={-3}
            style={{ display: "flex", justifyContent: "center" }}
          >
            {showImageWarning && (
              <Alert
                status="warning"
                onClose={() => setShowWarning(false)}
                backgroundColor="#2b8597"
                fontSize={"small"}
                height={"50px"}
                width={"50%"}
              >
                <AlertIcon height="100%" />
                Please select an image before saving.
              </Alert>
            )}
            <Button
              size={"sm"}
              className="shimmer-button"
              onClick={handleSaveResult} // This will handle the cropped image save
            >
              <span className="text">Save Result</span>
              <span className="shimmer"></span>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
}

export default ImageSelectionModal;
