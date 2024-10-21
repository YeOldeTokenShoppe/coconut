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
import Candle from "../components/Candle";
import { useUser, useClerk } from "@clerk/nextjs";

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
  const { user } = useUser();
  const { openSignIn } = useClerk();
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
  const [isFlameVisible, setIsFlameVisible] = useState(true);

  const [currentPath, setCurrentPath] = useState("/");

  useEffect(() => {
    // Ensure we capture the current path correctly, fallback to the root if router is not ready
    const path = router.asPath;
    if (path) {
      setCurrentPath(path);
    }
  }, [router.asPath]);

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

  const avatarUrl = user ? user.imageUrl : "/defaultAvatar.png"; // Define avatarUrl here

  const handleOpenBurnModal = () => {
    if (!user) {
      openSignIn({ forceRedirectUrl: currentPath });
    } else {
      setIsBurnModalOpen(true); // Open the BurnModal if signed in
      router.push("/gallery?burnModal=open", undefined, { shallow: true });
    }
  };

  const handleOpenImageSelectionModal = () =>
    setIsImageSelectionModalOpen(true);
  const handleCloseImageSelectionModal = () =>
    setIsImageSelectionModalOpen(false);

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
        {image.type && (
          <Badge
            colorScheme={image.type === "Top Burner" ? "purple" : "cyan"}
            variant="solid"
            position="absolute"
            top="1rem"
            left="50%"
            transform="translateX(-50%)"
            m="1"
            zIndex="docked"
          >
            {image.type}
          </Badge>
        )}
        <Box
          position="relative"
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          width={"10rem"} // Adjust size for avatar or other images
          height="auto"
        >
          {/* Conditionally display the frame if it's not a video or PNG image */}
          {!image.isVideo && !image.isPng && frameChoice && frameSrc && (
            <Image
              src={frameSrc}
              alt="Frame"
              position="absolute"
              top="1rem"
              left="0"
              width="10rem"
              height="10rem"
              objectFit="contain"
              zIndex="6"
            />
          )}

          {/* Display the image, video, or PNG */}
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
          ) : image.isPng ? (
            <Image
              src={imageUrl}
              alt={image.alt || "PNG image"}
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
                width: isAvatar ? "calc(50% - 6.7rem)" : "70%", // Adjust the image size within the frame
                height: "auto",
                zIndex: "5",
                borderRadius: isAvatar ? "50%" : "50%", // Circular border for avatars
                position: "relative",
                top: isAvatar ? "2.5rem" : "2.5rem", // Adjust the position for avatars
              }}
            />
          )}
        </Box>
        <Box
          mt={image.isVideo || image.isPng ? 2 : "4.5rem"} // Adjust margin-top based on whether it's a video or PNG
          zIndex={image.isVideo || image.isPng ? "5" : "7"} // Ensure text is above the frame/image composite
        >
          <Text
            fontSize="small"
            fontWeight="bold"
            lineHeight="normal"
            textAlign="center"
          >
            {image.userName}
            <br />
            Burned: {image.burnedAmount} tokens
            <br />
            {image.message && (
              <Text color="lt grey" fontWeight="normal">
                "{image.message}"
              </Text>
            )}
          </Text>
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
        console.log("Results:", results);
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
          {/* First Section */}
          <GridItem
            colSpan={{ base: 12, sm: 12, md: 4 }}
            mb={{ base: "4em", md: "8em" }}
          >
            <div style={{ position: "relative", zIndex: 0 }}>
              <div style={{ zIndex: 1 }}>
                <Box>
                  <div
                    style={{
                      position: "relative",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <a
                      href="https://rl80.xyz"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "block",
                        width: "100%",
                        height: "100%",
                      }}
                    >
                      <video
                        src="/space4.mp4"
                        autoPlay
                        loop
                        muted
                        playsInline
                        style={{
                          width: "100%",
                          height: "auto",
                          zIndex: "1",
                          cursor: "pointer",
                        }}
                      />
                    </a>
                    <Badge
                      colorScheme="green"
                      variant={"solid"}
                      size={"3xl"}
                      style={{
                        position: "absolute",
                        top: "-10px", // Adjust as needed
                        left: "50%",
                        transform: "translateX(-50%)",
                        // backgroundColor: "green",
                        // color: "white",
                        // padding: "2px 2px",
                        // borderRadius: "5px",
                        // fontSize: "1rem", // Adjust as needed
                        zIndex: "2",
                      }}
                    >
                      Scenic Route
                    </Badge>
                  </div>
                  <Text
                    fontSize="large"
                    lineHeight={1}
                    mb={-3}
                    mt={3}
                    zIndex={1}
                    bgColor={"black"}
                  >
                    Fortune Favors the Brave! Click on the moon to earn a 20%
                    staking premium by taking the scenic route.
                  </Text>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center", // Center the candles horizontally
                      alignItems: "flex-end", // Align candles to the bottom
                      marginBottom: "2rem",
                      marginTop: "-12rem",
                    }}
                  >
                    <div
                      style={{
                        position: "relative",
                        zIndex: "2",
                        left: "3rem",
                      }}
                    >
                      <Candle size={0.6} isFlameVisible={isFlameVisible} />
                    </div>
                    <div
                      style={{
                        position: "relative",
                        // height: "7.5rem",
                        zIndex: "2",
                        left: "-1.2rem",
                      }}
                    >
                      <Candle size={0.4} isFlameVisible={isFlameVisible} />
                    </div>
                    <div
                      style={{
                        position: "relative",
                        // height: "8.5rem",
                        zIndex: "2",
                        left: "-2.5rem",
                      }}
                    >
                      <Candle size={0.5} isFlameVisible={isFlameVisible} />
                    </div>
                  </div>
                  <Heading
                    lineHeight={0.9}
                    style={{
                      fontSize: "2.5em",
                      overflowWrap: "normal",
                      zindex: "1",
                    }}
                  >
                    Bless us, RL80!
                  </Heading>
                  <Text fontSize="xlarge" lineHeight={1.1} mb={2} zIndex={1}>
                    Enter the virtuous cycle by staking{" "}
                    <span style={{ fontFamily: "Oleo Script" }}>RL80</span>{" "}
                    tokens to earn reward tokens that you can use to buy green
                    candles or redeem for more RL80 tokens!
                    {/* and heaping blessings
                    on your fellow bag-holders. */}
                  </Text>
                  {/* <Text fontSize="small" lineHeight={1} mb={"3rem"} zIndex={1}>
                    Average cost to participate is currently under 0.5 cents USD
                  </Text> */}

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
                  <Flex justify="center" mt={5} mb={5}>
                    <div>
                      <Button
                        width="100%"
                        className="burnButton"
                        onClick={handleOpenBurnModal}
                      >
                        Burn Tokens
                      </Button>
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
              // height: "80vh",
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
                // bottom={0}
                // left={"30%"}
                marginTop="-1rem"
              >
                <h1 className="thelma1">
                  BurnerBoard
                  {/* <br /> */}
                  {/* <span style={{ fontSize: "2rem" }}>of </span>RL80 */}
                </h1>
                {/* </div> */}
              </Flex>
            </GridItem>
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
      </Box>
    </>
  );
};

export default BurnGallery;
