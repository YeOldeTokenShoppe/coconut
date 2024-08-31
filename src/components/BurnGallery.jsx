"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Button,
  Flex,
  Heading,
  Text,
  Grid,
  GridItem,
  Badge,
  Avatar,
  Stat,
  StatGroup,
  StatLabel,
  StatNumber,
  StatHelpText,
} from "@chakra-ui/react";
import Image from "next/image";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { useUser, useClerk } from "@clerk/nextjs";
import Candle from "./Candle";
import { db } from "../utilities/firebaseClient";
import dynamic from "next/dynamic";
import { resolveMethod, createThirdwebClient, getContract } from "thirdweb";
import { useReadContract } from "thirdweb/react";
import { defineChain } from "thirdweb/chains";
import { utils } from "ethers";
import { ethers } from "ethers";
import styled from "styled-components";

const BurnModal = dynamic(() => import("./BurnModal"), {
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
const ImageSelectionModal = dynamic(() => import("./ImageSelectionModal"), {
  ssr: false,
});

const BurnGallery = () => {
  const router = useRouter();
  const [isBurnModalOpen, setIsBurnModalOpen] = useState(false);
  const { user, isSignedIn } = useUser();
  const clerk = useClerk();

  useEffect(() => {
    const openModal = router.query.burnModal === "open";
    setIsBurnModalOpen(openModal && isSignedIn);
  }, [router.query.burnModal, isSignedIn]);

  const handleOpenBurnModal = () => {
    if (!isSignedIn) {
      clerk.openSignIn({
        redirectUrl: `${window.location.origin}/gallery?burnModal=open`,
      });
    } else if (!isBurnModalOpen) {
      setIsBurnModalOpen(true);
    }
  };
  useEffect(() => {
    // Logic to handle user data
    if (user) {
      const originalAvatarUrl = user.imageUrl; // Ensure this is the unmodified URL
      // Process originalAvatarUrl for backend or critical operations
    }
  }, [user]);
  useEffect(() => {
    if (isBurnModalOpen && router.query.burnModal !== "open") {
      router.push("/gallery?burnModal=open", undefined, { shallow: true });
    } else if (!isBurnModalOpen && router.query.burnModal === "open") {
      router.push("/gallery", undefined, { shallow: true });
    }
  }, [isBurnModalOpen]);

  const handleCloseBurnModal = () => {
    setIsBurnModalOpen(false);
    router.push("/gallery", undefined, { shallow: true }); // Reset the URL
  };

  const ImageBox = ({ image }) => {
    let imageUrl = image.src;
    const params = new URLSearchParams();
    params.set("height", "400");
    params.set("width", "400");
    params.set("quality", "1000");
    params.set("fit", "crop");
    imageUrl = `${imageUrl}?${params.toString()}`;
    return (
      <Box
        textAlign="center"
        mb={4}
        position="relative"
        width="100%"
        height="auto"
        p={2}
      >
        {image.type && (
          <Badge
            colorScheme={image.type === "Top Burner" ? "purple" : "green"}
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
          display="inline-block"
          width="100%"
          height="auto"
          boxSize="9rem"
          top="1rem"
        >
          {image.isComposite ? (
            <Box
              position="relative"
              display="inline-block"
              width="100%"
              height="auto"
              boxSize="8.5rem"
            >
              <Image
                src="/frame.png"
                alt="Frame"
                position="absolute"
                top="0"
                layout="fill"
                objectFit="contain"
                zIndex="200"
                unoptimized
              />
              <Avatar
                src={imageUrl} // Use the modified URL here
                alt={image.alt}
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
                width="calc(100% - 3rem)"
                height="auto"
                zIndex="-1"
              />
            </Box>
          ) : (
            <Image
              src={imageUrl} // And here
              alt={image.alt}
              layout="fill"
              loading="lazy"
              unoptimized
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
          top="1rem"
        >
          {image.userName}
          <br />
          Burned: {image.burnedAmount} tokens
          <br />
          {image.message && (
            <Text color="lt grey" fontWeight="normal">
              "{image.message}"
            </Text> // Change 'blue' to your desired color
          )}
        </Text>
      </Box>
    );
  };
  const {
    data: tokensBurned,
    isLoading,
    error,
  } = useReadContract({
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
          alt: doc.data().image.alt,
          message: doc.data().userMessage,
          userName: doc.data().userName,
          burnedAmount: doc.data().burnedAmount,
          createdAt: doc.data().createdAt,
          isComposite: doc.data().image.isFirstImage || false,
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

  function formatAndWrapNumber(number) {
    // Convert the number to a string and add commas as thousands separators
    let formattedNumber = number.toLocaleString();

    // Add a zero-width space after each character
    let breakableNumber = formattedNumber.split("").join("\u200B");

    return breakableNumber;
  }

  const combinedImages = [...topBurners, ...recentSubmissions].slice(0, 6);

  useEffect(() => {
    console.log("Top Burners:", topBurners);
    console.log("Recent Submissions:", recentSubmissions);
  }, [topBurners, recentSubmissions]);

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
      width: calc(50% - 20px); // Subtract margins
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
                      display: "flex", // This will make the div a flex container
                      justifyContent: "center", // This will center the image horizontally
                      alignItems: "center", // This will center the image vertically
                      // top: "-1rem",
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
                        // top: "10%",
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
                    className="gradient-background1"
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
                    <AccordionItem>
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
                            For every 1000 tokens burned, you'll gain one entry
                            to the weekly drawing for 50% of the weekly token
                            tax treasury.
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
                      {/* Button to open the InfoModal */}
                      <Button
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
              height: "80vh",
              width: "auto",
              overflow: "hidden", // Prevents overflow of the background
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: "url(/purple.jpg)",
                opacity: 0.5,
                backgroundRepeat: "repeat",
                backgroundSize: "cover", // Cover the entire area
                zIndex: 0, // Ensure it's behind other content
                pointerEvents: "none", // Ensure the background doesn't interfere with user interactions
                border: "3px solid black",
              }}
            />
            <Grid
              height={"75%"}
              templateColumns={{
                base: "repeat(1, 1fr)",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
              }}
              gap={4}
            >
              {combinedImages.map((image, index) => (
                <ImageBox
                  style={{ position: "relative", top: "1rem" }}
                  key={index}
                  image={image}
                  badgeType={image.type}
                />
              ))}
            </Grid>
            <Flex justifyContent="center" alignItems="center">
              <div
                style={{
                  position: "relative",
                  bottom: "1rem !important",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <h1 className="thelma1">
                  Saints
                  <br />
                  <span style={{ fontSize: "2rem" }}>of </span>RL80
                </h1>
              </div>
            </Flex>
          </GridItem>
        </Grid>

        <Grid>
          <GridItem>
            <Flex
              wrap="wrap" // Allow wrapping of items
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
                  height: "auto", // Allow height to adjust based on content
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
                      : formatAndWrapNumber(
                          Number(utils.formatUnits(tokensBurned, "ether"))
                        )}
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
          <BurnModal isOpen={isBurnModalOpen} onClose={handleCloseBurnModal} />
        )}
      </Box>
    </>
  );
};

export default BurnGallery;
