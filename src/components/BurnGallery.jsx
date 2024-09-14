"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Accordion,
  Avatar,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Link,
  Box,
  Button,
  Flex,
  Heading,
  Image,
  Text,
  Grid,
  GridItem,
  Badge,
  Stat,
  StatGroup,
  StatLabel,
  StatNumber,
  StatHelpText,
} from "@chakra-ui/react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db, auth } from "../utilities/firebaseClient";
import dynamic from "next/dynamic";
import { resolveMethod, createThirdwebClient, getContract } from "thirdweb";
import { useReadContract } from "thirdweb/react";
import { defineChain } from "thirdweb/chains";
import { utils, ethers } from "ethers";
import styled from "styled-components";
import { onAuthStateChanged } from "firebase/auth";
import AuthModal from "./AuthModal";
import Candle from "../components/Candle";

const BurnModal = dynamic(() => import("./BurnModal"), {
  ssr: false,
});
const ImageSelectionModal = dynamic(() => import("./ImageSelectionModal"), {
  ssr: false,
});

const infuraKey = process.env.NEXT_PUBLIC_INFURA_KEY;
const provider = new ethers.providers.JsonRpcProvider(
  `https://sepolia.infura.io/v3/${infuraKey}`
);

const CLIENT_ID = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;

const client = createThirdwebClient({ clientId: CLIENT_ID });

const contract = getContract({
  client: client,
  chain: defineChain(11155111),
  address: "0xde7Cc5B93e0c1A2131c0138d78d0D0a33cc36e42",
});

const BurnGallery = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isBurnModalOpen, setIsBurnModalOpen] = useState(false);
  const [isImageSelectionModalOpen, setIsImageSelectionModalOpen] =
    useState(false);
  const [isResultSaved, setIsResultSaved] = useState(false); // Define isResultSaved here
  const [saveMessage, setSaveMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const currentUrl = router.asPath;
  const [burnedAmount, setBurnedAmount] = useState(0); // Already defined in BurnGallery
  const [images, setImages] = useState([]);

  const getFormattedImageUrl = (url) => {
    if (!url) return "";
    // Only modify Twitter URLs to get the 'bigger' size
    if (url.includes("pbs.twimg.com")) {
      return url.replace("_normal", ""); // Replace '_normal' with '_bigger' for a larger version
    }
    // Only add `?alt=media` for Firebase URLs
    if (url.includes("firebasestorage")) {
      return url.includes("alt=media") ? url : `${url}&alt=media`;
    }
    return url; // Return external URLs as-is
  };
  const displayImageWithFrame = (imageData) => {
    const { src, frameChoice } = imageData;
    return (
      <Box position="relative">
        <Image
          src={`/${frameChoice}.png`} // Apply the correct frame
          alt="Frame"
          position="absolute"
          top="0"
          zIndex="1"
        />
        <ChakraImage
          src={getFormattedImageUrl(src)}
          alt="Image"
          position="relative"
          zIndex="0"
        />
      </Box>
    );
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user); // Set user state when signed in
    });

    return () => unsubscribeAuth(); // Clean up on unmount
  }, []);

  const avatarUrl = user ? user.photoURL : "/defaultAvatar.png"; // Define avatarUrl here

  const handleOpenBurnModal = () => {
    if (!user) {
      console.log("Button clicked");
      setIsAuthModalOpen(true); // Open the AuthModal if not signed in
    } else {
      setIsBurnModalOpen(true); // Open the BurnModal if signed in
      router.push("/gallery?burnModal=open", undefined, { shallow: true });
    }
  };

  const handleOpenImageSelectionModal = () =>
    setIsImageSelectionModalOpen(true);
  const handleCloseImageSelectionModal = () =>
    setIsImageSelectionModalOpen(false);

  // const handleCloseBurnModal = () => {
  //   // Reset all necessary states related to the burning process
  //   setIsBurnModalOpen(false);
  //   setIsResultSaved(false); // Reset result saved state
  //   setSaveMessage(""); // Clear save message
  //   setBurnedAmount(0); // Reset the burned amount
  //   setSelectedImage(null); // Reset selected image
  //   setShowImageWarning(false); // Reset any warnings
  //   setUploadedImage(null); // Clear any uploaded image if needed
  //   router.push("/gallery", undefined, { shallow: true }); // Return to gallery
  // };

  useEffect(() => {
    if (isBurnModalOpen && router.query.burnModal !== "open") {
      router.push("/gallery?burnModal=open", undefined, { shallow: true });
    } else if (!isBurnModalOpen && router.query.burnModal === "open") {
      router.push("/gallery", undefined, { shallow: true });
    }
  }, [isBurnModalOpen]);

  const handleSignIn = (userInfo) => {
    // Update the user state after successful sign-in
    setUser(userInfo);
    setIsSignedIn(true);
    setIsAuthModalOpen(false); // Close the AuthModal
  };

  const ImageBox = ({ image }) => {
    const imageUrl = getFormattedImageUrl(image.src);
    const frameChoice = image.frameChoice; // Use the frameChoice from Firestore

    const frameSrc = {
      frame0: "/frame0.png",
      frame1: "/frame1.png",
      frame2: "/frame2.png",
      frame3: "/frame3.png",
    }[frameChoice];

    const isAvatar = image.isFirstImage; // Specifically for the user's avatar image

    return (
      <Box
        textAlign="center"
        mb={4}
        position="relative"
        width="100%"
        height="auto"
        p={2}
        display="flex"
        flexDirection="column"
        alignItems="center"
      >
        {/* Frame and Image Container */}
        <Box
          position="relative"
          display="flex"
          justifyContent="center"
          alignItems="center"
          width={isAvatar ? "9rem" : "auto"} // Adjust size for avatar or other images
          height={isAvatar ? "9rem" : "auto"} // Keep the frame size consistent
        >
          {/* Conditionally display the frame if it's not a video */}
          {!image.isVideo && frameChoice && frameSrc && (
            <Image
              src={frameSrc}
              alt="Frame"
              position="absolute"
              top="0"
              left="0"
              width="100%"
              height="100%"
              objectFit="contain"
              zIndex="6"
            />
          )}

          {/* Display the image or video */}
          {image.isVideo ? (
            <video
              src={imageUrl}
              autoPlay
              loop
              muted
              playsInline
              style={{
                width: "100%",
                height: "auto",
                zIndex: "5",
              }}
            />
          ) : (
            <Image
              src={imageUrl || "/defaultAvatar.png"}
              alt={image.alt || "User image"}
              style={{
                width: isAvatar ? "80%" : "100%", // Adjust the image size within the frame
                height: "auto",
                zIndex: "5",
                borderRadius: isAvatar ? "50%" : "0", // Circular border for avatars
              }}
            />
          )}
        </Box>
      </Box>
    );
  };
  const { data: tokensBurned, isLoading } = useReadContract({
    contract: contract,
    method: resolveMethod("getBurnedTokens"),
    params: [],
  });

  const totalSupply = 10000000000; // 10 billion
  let burnedPercentage = 0;

  if (tokensBurned) {
    burnedPercentage =
      (Number(utils.formatUnits(tokensBurned, "ether")) / totalSupply) * 100;
  }

  const [topBurners, setTopBurners] = useState([]);
  const [recentSubmissions, setRecentSubmissions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const q = query(collection(db, "results"), orderBy("createdAt", "desc"));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const results = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          src: doc.data().image.src,
          alt: doc.data().image.alt || "User image",
          message: doc.data().userMessage,
          userName: doc.data().userName,
          burnedAmount: doc.data().burnedAmount,
          createdAt: doc.data().createdAt,
          isComposite: doc.data().image.isFirstImage || false,
          frameChoice: doc.data().image.frameChoice || "frame1",
          type: "recent",
        }));

        const sortedByAmount = [...results].sort((a, b) => {
          if (b.burnedAmount === a.burnedAmount) {
            return a.createdAt - b.createdAt;
          }
          return b.burnedAmount - a.burnedAmount;
        });

        const topBurners = sortedByAmount
          .slice(0, 3)
          .map((image) => ({ ...image, type: "Top Burner" }));

        const recentSubmissions = results
          .filter((r) => !topBurners.some((tb) => tb.id === r.id))
          .slice(0, 3)
          .map((image) => ({ ...image, type: "New Burner" }));

        setTopBurners(topBurners);
        setRecentSubmissions(recentSubmissions);
      });
      return () => unsubscribe();
    };

    fetchData().catch(console.error);
  }, []);

  const combinedImages = [...topBurners, ...recentSubmissions].map((image) => ({
    ...image,
    isVideo: image.src.endsWith(".mp4"), // Explicitly set if the image is a video
    frameChoice: image.frameChoice || (image.isFirstImage ? "frame1" : null), // Set frameChoice only if it's the first image
  }));

  function formatAndWrapNumber(number) {
    // Convert the number to a string and add commas as thousands separators
    let formattedNumber = number.toLocaleString();

    // Add a zero-width space after each character
    let breakableNumber = formattedNumber.split("").join("\u200B");

    return breakableNumber;
  }

  const ResponsiveStatGroup = styled(StatGroup)`
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;

    @media (max-width: 600px) {
      flex-direction: row;
    }
  `;
  const ResponsiveStat = styled(Stat)`
    flex-basis: 50%;

    @media (max-width: 600px) {
      margin: 10px;
      width: calc(50% - 20px);
    }
  `;
  return (
    <>
      <Box py="0" mb="5em">
        <Grid templateColumns="repeat(12, 1fr)" gap={6}>
          <GridItem colSpan={{ base: 12, sm: 12, md: 4 }} mb={"8em"}>
            <div style={{ position: "relative", zIndex: 0 }}>
              <div style={{ zIndex: 1 }}>
                <Box maxWidth="50ch" height="80vh">
                  <div
                    style={{
                      position: "relative",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Image
                      src="/devotional.png"
                      alt=""
                      width={300}
                      zIndex={-1}
                      height={"auto"}
                      style={{
                        // borderRadius: "50%",
                        // border: "3px solid gold",
                        opacity: 0.8,

                        position: "relative",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      marginBottom: "0rem",
                      height: "3rem",
                      zindex: "1",
                      position: "relative",
                      bottom: "8rem",
                    }}
                  >
                    <Candle />
                  </div>
                  <Heading
                    lineHeight={0.9}
                    style={{
                      fontSize: "2.5em",
                      overflowWrap: "normal",
                      zindex: "1",
                    }}
                  >
                    Bless us,{" "}
                    <span style={{ fontFamily: "Oleo Script" }}>RL80</span>!
                  </Heading>
                  <Text fontSize="xlarge" lineHeight={1.1} mb={2} zIndex={1}>
                    Enter the virtuous cycle by burning some{" "}
                    <span style={{ fontFamily: "Oleo Script" }}>RL80</span>{" "}
                    tokens at the alt-coin altar and enjoy instant veneration
                    and glory while reducing token supply.
                    {/* and heaping blessings
                    on your fellow bag-holders. */}
                  </Text>
                  <Text fontSize="small" lineHeight={1} mb={"3rem"} zIndex={1}>
                    Average cost to participate is currently under 0.5 cents USD
                  </Text>

                  <Accordion allowToggle mt={3}>
                    <AccordionItem border="none">
                      <h2>
                        <AccordionButton>
                          <Box flex="1" textAlign="center" fontSize="1.3rem">
                            Read the Deets
                          </Box>
                          <AccordionIcon />
                        </AccordionButton>
                      </h2>
                      <AccordionPanel pb={4}>
                        <ul style={{ fontSize: "0.8rem", lineHeight: "1.2" }}>
                          <li>
                            You'll be prompted to log in to your social media
                            account or email, so your name can be announced if
                            you win.
                          </li>
                          <li>You'll need a wallet with RL80 tokens.</li>
                          <li>
                            {" "}
                            Enter any amount of tokens to burn, but it is
                            recommended that you burn only a minimal amount, as
                            sometimes the transaction can fail. Burning RL80
                            tokens should primarily be a symbolic gesture rather
                            than a painful sacrifice.
                          </li>

                          <li>
                            {" "}
                            For every 1000 tokens burned, you'll gain one entry
                            to the weekly drawing for 50% of the weekly token
                            tax treasury. You can check the amount{" "}
                            <Link
                              href="#"
                              color="blue.500"
                              _hover={{ color: "blue.700" }}
                            >
                              here
                            </Link>
                          </li>
                          <li>
                            After the transaction is complete, you'll be
                            presented with the option to be added to the
                            gallery.
                          </li>
                          <li>
                            The top 3 burners will remain eligible to win for
                            subsequent drawings, as long as they remain in the
                            top 3.
                          </li>
                        </ul>
                      </AccordionPanel>
                    </AccordionItem>
                  </Accordion>
                  <Flex justify="center" mt={3}>
                    <div>
                      <Button
                        className="burnButton"
                        onClick={handleOpenBurnModal}
                      >
                        Burn Tokens
                      </Button>

                      {isAuthModalOpen && (
                        <AuthModal
                          isOpen={isAuthModalOpen}
                          onClose={() => setIsAuthModalOpen(false)}
                          onSignInSuccess={() => {
                            setIsAuthModalOpen(false); // Close the AuthModal
                            setIsBurnModalOpen(true); // Open the BurnModal
                            router.push("/gallery?burnModal=open", undefined, {
                              shallow: true,
                            });
                          }}
                          redirectTo={router.asPath} // Optional: fallback in case onSignInSuccess is not triggered
                        />
                      )}
                    </div>
                  </Flex>
                </Box>
              </div>
            </div>
          </GridItem>

          <GridItem
            colSpan={{ base: 12, sm: 12, md: 8 }}
            mb={"5em"}
            style={{
              position: "relative",
              height: "80vh",
              width: "auto",
              overflow: "hidden",
            }}
          >
            <Grid
              height={"75%"}
              templateColumns={{
                base: "repeat(1, 1fr)",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
              }}
              gap={4}
            >
              {combinedImages.map((image, index) => {
                // Ensure the frame and composite logic are passed correctly
                const isFirstImage =
                  image.isFirstImage || image.src === avatarUrl; // Compare with avatarUrl if needed
                const isVideo = image.isVideo; // Check if it's a video
                const frameChoice = isVideo
                  ? null
                  : image.frameChoice || "frame1"; // Only apply frame if it's not a video

                return (
                  <ImageBox
                    key={index}
                    image={{
                      ...image,
                      isFirstImage, // Ensure logic for profile image is applied
                      frameChoice, // Apply the frame only when appropriate (not for videos)
                      isVideo, // Pass the video flag
                    }}
                    avatarUrl={avatarUrl} // Pass avatarUrl to ImageBox
                  />
                );
              })}
            </Grid>
            <GridItem>
              <Flex
                justifyContent="center"
                alignItems="center"
                position="relative"
                bottom={0}
                // left={"30%"}
              >
                {/* <div
                style={{
                  position: "relative",
                  bottom: "1rem !important",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              > */}
                <h1 className="thelma1">
                  Saints
                  <br />
                  <span style={{ fontSize: "2rem" }}>of </span>RL80
                </h1>
                {/* </div> */}
              </Flex>
            </GridItem>
          </GridItem>
        </Grid>

        <Grid>
          <GridItem>
            <Flex
              wrap="wrap"
              justify="space-around"
              mt={20}
              gap="10px"
              width="100%"
            >
              <StatGroup
                style={{
                  border: "1px solid #8e662b",
                  borderRadius: "10px",
                  padding: ".5rem",
                  width: "100%",
                  height: "auto",
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "space-around",
                }}
              >
                <Stat
                  style={{
                    width: "150px",
                    margin: "10px",
                  }}
                >
                  <StatLabel mb={2}>Tokens Burned</StatLabel>
                  <StatNumber mb={2}>
                    {isLoading || tokensBurned === undefined
                      ? "Loading..."
                      : Number(
                          utils.formatUnits(tokensBurned, "ether")
                        ).toLocaleString()}
                  </StatNumber>
                  <StatHelpText bottom={0}>
                    {isLoading
                      ? "Loading..."
                      : `${burnedPercentage.toFixed(2)}% of total supply`}
                  </StatHelpText>
                </Stat>
                <Stat
                  style={{
                    width: "150px",
                    margin: "10px",
                  }}
                >
                  <StatLabel mb={2}>Number of Entries</StatLabel>
                  <StatNumber>389</StatNumber>
                  <StatHelpText mt={2}>RL80 Tokens</StatHelpText>
                </Stat>
                <Stat
                  style={{
                    width: "150px",
                    margin: "10px",
                  }}
                >
                  <StatLabel mb={2}>Current Prize Pool</StatLabel>
                  <StatNumber>
                    {isLoading ? "Loading..." : "10,000,000"}
                  </StatNumber>
                  <StatHelpText>RL80 Tokens</StatHelpText>
                </Stat>
                <Stat
                  style={{
                    width: "150px",
                    margin: "10px",
                    textAlign: "center",
                  }}
                >
                  <StatLabel mb={2} textAlign={"center"}>
                    Next Drawing
                  </StatLabel>
                  <StatNumber fontSize={"2.2rem"} textAlign={"center"}>
                    ⏳
                  </StatNumber>
                  <StatHelpText fontSize={"1.5rem"} mb={1} textAlign={"center"}>
                    5<span style={{ fontSize: "1rem" }}>{" days "}</span>4
                    <span style={{ fontSize: "1rem" }}>{" hours "}</span>31
                    <span style={{ fontSize: "1rem" }}>{" min"}</span>
                  </StatHelpText>
                </Stat>
              </StatGroup>
            </Flex>
          </GridItem>
        </Grid>

        {isBurnModalOpen && (
          <BurnModal
            isOpen={isBurnModalOpen}
            onClose={() => setIsBurnModalOpen(false)}
            selectedImage={selectedImage}
            setSelectedImage={setSelectedImage}
            burnedAmount={burnedAmount} // Pass the burnedAmount value
            setBurnedAmount={setBurnedAmount} // Pass the setter function
            setIsResultSaved={setIsResultSaved}
            setSaveMessage={setSaveMessage}
            isResultSaved={isResultSaved}
            saveMessage={saveMessage}
          />
        )}
        {/* <ImageSelectionModal
          isOpen={isImageSelectionModalOpen}
          onOpen={handleOpenImageSelectionModal}
          onClose={handleCloseImageSelectionModal}
          setSelectedImage={setSelectedImage}
          burnedAmount={burnedAmount}
          setBurnedAmount={setBurnedAmount}
          setIsResultSaved={setIsResultSaved}
          setSaveMessage={setSaveMessage}
          onSaveResult={(savedImage) => {
            setSelectedImage(savedImage); // Update selectedImage here
          }}
        /> */}
      </Box>
    </>
  );
};

export default BurnGallery;
