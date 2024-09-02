"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
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
} from "@chakra-ui/react";
import { setDoc, doc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../utilities/firebaseClient";
import { onAuthStateChanged } from "firebase/auth";
import Carousel8 from "./Carousel8";

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
  const [userMessage, setUserMessage] = useState("");
  const [selectedImageObject, setSelectedImageObject] = useState(null);
  const [showImageWarning, setShowImageWarning] = useState(false);

  // Firebase Auth State Listener
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user); // Set the user state when signed in
    });

    return () => unsubscribeAuth();
  }, []);

  let avatarUrl = user ? user.photoURL : "/defaultAvatar.png";
  const params = new URLSearchParams();
  params.set("height", "100px");
  params.set("width", "100px");
  params.set("quality", "100");
  params.set("fit", "crop");

  const imageUrls = [
    avatarUrl,
    "/elmo.gif",
    "/animaSola.png",
    "/dracarys.gif",
    "/frank.gif",
    "/homer.gif",
    "/sup.gif",
    "/louise.gif",
    "/smoke.gif",
    "/fever.gif",
    "/thing1.gif",
    // "/sacred.gif",
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
    onOpen();
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

  const handleSaveResult = async () => {
    if (!selectedImage) {
      console.error("No image selected");
      setShowImageWarning(true);
      return;
    }
    setShowImageWarning(false);
    const normalizedSelectedImageUrl = normalizeUrl(selectedImage);
    const normalizedAvatarUrl = normalizeUrl(avatarUrl);

    setSelectedImageObject({
      src: normalizedSelectedImageUrl,
      isFirstImage: normalizedSelectedImageUrl === normalizedAvatarUrl,
    });

    if (!user) {
      console.error("User is not defined");
      setShowLoginError(true);
      return;
    }

    const userName = user.displayName || "Anonymous";
    const userId = user.uid;

    try {
      await setDoc(doc(db, "results", userId), {
        userName,
        image: {
          src: normalizedSelectedImageUrl,
          isFirstImage: normalizedSelectedImageUrl === normalizedAvatarUrl,
        },
        userMessage,
        createdAt: serverTimestamp(),
        burnedAmount: burnedAmount,
      });

      setIsResultSaved(true);
      setSaveMessage(
        "You've been saved!\nAnd you're entered in the next drawing"
      );
      setShowWarning(false);

      onSaveResult({
        userName,
        image: { src: normalizedSelectedImageUrl },
        avatarUrl: normalizedAvatarUrl,
      });
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
          height={"530px"}
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
              Select an image to feature in the main gallery.
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
                onImageSelect={(image) => setSelectedImage(image.url)}
              />
            </div>

            <Input
              mb={-5}
              mt={5}
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              maxLength={40}
              placeholder="Add a message (40 characters max)"
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
              onClick={handleSaveResult}
            >
              <span className="text">Save Result</span>
              <span className="shimmer"></span>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default ImageSelectionModal;
