"use client";
import React, { useState, useEffect, useRef } from "react";
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

const normalizeUrl = (url) => {
  try {
    const urlObj = new URL(url);
    return urlObj.origin + urlObj.pathname; // This will ignore search and hash
  } catch (error) {
    console.error("Error normalizing URL:", error);
    return url; // Fallback to the original URL if there's an error
  }
};

function BurnModal({ isOpen, onClose, onTransactionComplete }) {
  const account = useActiveAccount();
  const signer = account?.address || "";
  const { disconnect } = useDisconnect();
  const [isFlameVisible, setIsFlameVisible] = useState(false);
  const [value, setValue] = useState(1000);
  const [transactionStatus, setTransactionStatus] = useState("idle");
  const [transactionCompleted, setTransactionCompleted] = useState(false);
  const [isImageSelectionModalOpen, setIsImageSelectionModalOpen] =
    useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [burnedAmount, setBurnedAmount] = useState(0);
  const [isResultSaved, setIsResultSaved] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [userConfirmed, setUserConfirmed] = useState(false);
  const [user, setUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false); // Added for AuthModal
  const [errorMessage, setErrorMessage] = useState(null);
  const [userName, setUserName] = useState("");
  const [userMessage, setUserMessage] = useState("");
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

  const handleClose = () => {
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
    setIsImageSelectionModalOpen(false);
  };

  const handleSaveResult = ({ userName, image, userMessage }) => {
    console.log(`Saving Result - Image URL: ${image.src}`);
    setUserName(userName);
    setSelectedImage(image); // Assuming `image` has an `isFirstImage` property
    setUserMessage(userMessage);
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="md" motionPreset="2">
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
          {transactionStatus === "idle" && (
            <Text fontSize="small" align={"left"} ml={7} mr={7}>
              Enter any amount of tokens to burn, but it is recommended that you
              burn only a minimal amount, as sometimes the process can fail to
              complete. Burning RL80 tokens should primarily be a symbolic
              gesture rather than a painful sacrifice. Every 1000 tokens burned
              is an entry for the week's treasury giveaway. The top 3 burners
              will remain eligible for subsequent drawings as long as they
              remain in the top 3. Have fun!
            </Text>
          )}
          {transactionStatus === "completed" && (
            <Text fontSize="small" align={"center"} ml={7} mr={7}>
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
                  display="inline-block"
                  boxSize="9rem"
                  mb="8"
                  mt="5"
                >
                  {console.log("isFirstImage:", selectedImage.isFirstImage)}{" "}
                  {/* Debugging */}
                  {selectedImage.isFirstImage && (
                    <ChakraImage
                      src="/frame.png"
                      alt="Frame"
                      position="absolute"
                      top="0"
                      objectFit="contain"
                      zIndex="200"
                      unoptimized
                    />
                  )}
                  <Box
                    as="img"
                    src={selectedImage.src}
                    alt="Selected"
                    position="absolute"
                    top="60%"
                    left="50%"
                    transform="translate(-50%, -50%)"
                    width="calc(100% - 2rem)"
                    height="auto"
                    zIndex="-1"
                  />
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
                  : "Burn Tokens"}
                <span className="shimmer"></span>
              </TransactionButton>
            ) : transactionCompleted && !isResultSaved ? (
              <Button
                className="shimmer-button burnButton pulse"
                onClick={handleOpenImageSelectionModal}
              >
                <span className="text">
                  Join the <br />
                  Hall of Flame
                </span>
                <span className="shimmer"></span>
              </Button>
            ) : (
              <Button mt={0} className="shimmer-button" onClick={handleClose}>
                Return to Gallery
                <span className="shimmer"></span>
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
        <ImageSelectionModal
          isOpen={isImageSelectionModalOpen}
          onOpen={handleOpenImageSelectionModal}
          onClose={handleCloseImageSelectionModal}
          setSelectedImage={setSelectedImage}
          burnedAmount={burnedAmount}
          setIsResultSaved={setIsResultSaved}
          setSaveMessage={setSaveMessage}
          onSaveResult={handleSaveResult} // Pass the new prop
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
