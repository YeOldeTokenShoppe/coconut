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

  const handleCloseBurnModal = () => {
    setIsBurnModalOpen(false);
    router.push("/gallery", undefined, { shallow: true });
  };

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
    const frameChoice = image.frameChoice || "frame1"; // Default frame choice for avatar images

    const frameSrc = {
      frame1: "/frame1.png",
      frame2: "/frame2.png",
      frame3: "/frame3.png",
    }[frameChoice];

    const isCompositeImage =
      image.isFirstImage || image.src.includes("userImages"); // For avatar or uploaded images
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
            colorScheme={image.type === "Top Burner" ? "purple" : "green"}
            variant="solid"
            position="absolute"
            top="0%"
            left="50%"
            transform="translateX(-50%)"
            m="1"
            zIndex="1000"
          >
            {image.type}
          </Badge>
        )}

        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          width="100%"
          height="auto"
          boxSize={isAvatar ? "9.5rem" : "auto"} // Smaller box size for avatars, original size for others
          mb={2}
          position="relative"
        >
          {/* Display the frame for composite images (avatars or uploaded images) */}
          {isCompositeImage && frameSrc && (
            <Image
              src={frameSrc}
              alt="Frame"
              layout="fill"
              objectFit="contain"
              position="absolute"
              top="0"
              zIndex="6"
            />
          )}

          {/* Display the selected image */}
          {imageUrl && (
            <Image
              src={imageUrl || "/defaultAvatar.png"}
              alt={image.alt || "User image"}
              style={{
                position: isAvatar ? "absolute" : "relative", // Avatar images need absolute positioning
                top: isAvatar ? "60%" : "0", // Only apply top adjustment for avatar images
                left: isAvatar ? "50%" : "0", // Only apply left adjustment for avatar images
                transform: isAvatar ? "translate(-50%, -50%)" : "none", // Only apply transform for avatars
                width: isAvatar ? "calc(100% - 1.5rem)" : "100%", // Avatar images are smaller, others fill the container
                height: "auto",
                zIndex: "5",
                borderRadius: isAvatar ? "50%" : "0%", // Apply circular border-radius only for avatars
              }}
            />
          )}
        </Box>

        <Text
          fontSize="small"
          fontWeight="bold"
          lineHeight="normal"
          textAlign="center"
          display="flex"
          flexDirection="column"
          justifyContent="center"
          position="relative"
          marginTop="1.5rem"
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

  const combinedImages = [...topBurners, ...recentSubmissions].slice(0, 6);

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
                      src="/purgatory.png"
                      alt=""
                      width={200}
                      height={200}
                      style={{
                        borderRadius: "50%",
                        border: "3px solid gold",
                        opacity: 0.8,
                        zindex: "-1",
                        position: "relative",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      marginBottom: "0rem",
                      height: "10rem",
                      zindex: "1",
                      position: "relative",
                      bottom: "-1px",
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
                    <span style={{ fontFamily: "Oleo Script" }}>RL80</span>
                  </Heading>
                  <Text
                    fontSize="xlarge"
                    lineHeight={1.1}
                    mb={"3rem"}
                    zIndex={1}
                  >
                    Burn some tokens and enjoy instant glory and a chance to win
                    Our Lady's treasury.
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
                const frameChoice = image.frameChoice || "frame1";

                return (
                  <ImageBox
                    key={index}
                    image={{
                      ...image,
                      isFirstImage, // Add this to ensure logic for profile image is applied
                      frameChoice: image.frameChoice || "frame1", // Default to frame1
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
