import React, { useEffect, useState, useRef } from "react";
import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionIcon,
  AccordionPanel,
  Avatar,
  Badge,
  Box,
  Flex,
  Heading,
  Link,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Text,
  Center,
  Button,
  Tooltip,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverCloseButton,
  Stack,
  useClipboard,
  useBreakpointValue,
  IconButton,
  useMediaQuery,
} from "@chakra-ui/react";
import { WarningIcon, CopyIcon, CheckIcon } from "@chakra-ui/icons";
import Image from "next/image";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import styled from "styled-components";
import { chain } from "../utilities/chain";
import { ConnectButton } from "thirdweb";
import { client } from "../utilities/client";
import { ThirdwebProvider, PayEmbed } from "thirdweb/react";
import { ethereum, sepolia } from "thirdweb/chains";
import { darkTheme, MediaRenderer } from "thirdweb/react";
// import Carnival from "./Carnival";
import TextMarquee from "./TextMarquee";
import {
  createWallet,
  walletConnect,
  inAppWallet,
  base,
} from "thirdweb/wallets";
import { useConnect, useActiveAccount, useActiveWallet } from "thirdweb/react";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../utilities/firebaseClient";
import Coin from "./Coin";
// import { TwitterTweetEmbed } from "react-twitter-embed";
import TokenText from "./TokenText";
import RotatingText from "./RotatingText";

import RotatingBadge from "./RotatingBadge";
// import StarComponent2 from "./Stars2";
import SliderRevolutionCarousel from "./SliderRevolutionCarousel";
import dynamic from "next/dynamic";
const BurningEffect = dynamic(() => import("../components/BurningEffect"), {
  ssr: false,
});

// const StarComponent2 = dynamic(() => import("./Stars2"), {
//   ssr: false,
// });
const StarComponent = dynamic(() => import("./StarComponent"), {
  ssr: false,
});
const StarComponent2 = dynamic(() => import("./StarComponent2"), {
  ssr: false,
});
const SafariStarComponent = dynamic(() => import("./SafariStarComponent"), {
  ssr: false,
});
import SpinningTextRing from "./SpinningTextRing";

const isChrome = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  const isSafari = /^((?!chrome|android).)*safari/.test(userAgent);
  return (
    userAgent.indexOf("chrome") > -1 &&
    userAgent.indexOf("edge") === -1 &&
    !isSafari
  );
};

const StyledText = styled(Text)`
  font-family: "Roboto", sans-serif;
`;
const ListItem = styled.li`
  &::before {
    content: "✨";
    padding-right: 10px;
  }
`;

const useOutsideClick = (refs, handler) => {
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        refs.every((ref) => ref.current && !ref.current.contains(event.target))
      ) {
        handler();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [refs, handler]);
};

const Hero = () => {
  const coinRef = useRef(null);

  useEffect(() => {
    if (
      (typeof window !== "undefined" && !coinRef.current) ||
      window.innerWidth <= 550
    ) {
      return;
    }

    const sparkle = coinRef.current;

    const MAX_STARS = 60;
    const STAR_INTERVAL = 16;

    const MAX_STAR_LIFE = 3;
    const MIN_STAR_LIFE = 1;

    const MAX_STAR_SIZE = 40;
    const MIN_STAR_SIZE = 20;

    const MIN_STAR_TRAVEL_X = 100;
    const MIN_STAR_TRAVEL_Y = 100;

    const randomLimitedColor = () => {
      const randomHue = (() => {
        const ranges = [
          { min: 200, max: 250 }, // Blues
          { min: 250, max: 290 }, // Violets/Purples
          { min: 45, max: 60 }, // Yellows and Golds
        ];
        const range = ranges[Math.floor(Math.random() * ranges.length)];
        return (
          Math.floor(Math.random() * (range.max - range.min + 1)) + range.min
        );
      })();

      return `hsla(${randomHue}, 100%, 50%, 1)`;
    };

    const Star = class {
      constructor() {
        this.size = this.random(MAX_STAR_SIZE, MIN_STAR_SIZE);

        this.x = this.random(
          sparkle.offsetWidth * 0.75,
          sparkle.offsetWidth * 0.25
        );
        this.y = sparkle.offsetHeight / 2 - this.size / 2;

        this.x_dir = this.randomMinus();
        this.y_dir = this.randomMinus();

        this.x_max_travel =
          this.x_dir === -1 ? this.x : sparkle.offsetWidth - this.x - this.size;
        this.y_max_travel = sparkle.offsetHeight / 2 - this.size;

        this.x_travel_dist = this.random(this.x_max_travel, MIN_STAR_TRAVEL_X);
        this.y_travel_dist = this.random(this.y_max_travel, MIN_STAR_TRAVEL_Y);

        this.x_end = this.x + this.x_travel_dist * this.x_dir;
        this.y_end = this.y + this.y_travel_dist * this.y_dir;

        this.life = this.random(MAX_STAR_LIFE, MIN_STAR_LIFE);

        this.star = document.createElement("div");
        this.star.classList.add("star");

        this.star.style.setProperty("--start-left", this.x + "px");
        this.star.style.setProperty("--start-top", this.y + "px");

        this.star.style.setProperty("--end-left", this.x_end + "px");
        this.star.style.setProperty("--end-top", this.y_end + "px");

        this.star.style.setProperty("--star-life", this.life + "s");
        this.star.style.setProperty("--star-life-num", this.life);

        this.star.style.setProperty("--star-size", this.size + "px");
        this.star.style.setProperty("--star-color", randomLimitedColor());
      }

      draw() {
        sparkle.appendChild(this.star);
      }

      pop() {
        sparkle.removeChild(this.star);
      }

      random(max, min) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
      }

      randomMinus() {
        return Math.random() > 0.5 ? 1 : -1;
      }
    };

    let current_star_count = 0;
    const intervalId = setInterval(() => {
      if (current_star_count >= MAX_STARS) {
        return;
      }

      current_star_count++;

      const newStar = new Star();
      newStar.draw();

      setTimeout(() => {
        current_star_count--;
        newStar.pop();
      }, newStar.life * 1000);
    }, STAR_INTERVAL);

    return () => {
      clearInterval(intervalId);
    };
  }, []);
  const [isLargerThan768] = useMediaQuery("(min-width: 37rem)");
  const [isChromeBrowser, setIsChromeBrowser] = useState(false);
  const [isSmallScreen] = useMediaQuery("(max-width: 600px)");
  useEffect(() => {
    setIsChromeBrowser(isChrome());
  }, []);
  const account = useActiveAccount();
  const flexDirection = useBreakpointValue({ base: "column", sm: "row" });

  const tokenAddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
  const { hasCopied, onCopy } = useClipboard(tokenAddress);

  const [openPopover, setOpenPopover] = useState(null);

  const handleOpen = (id) => {
    setOpenPopover(id);
  };

  const handleClose = () => {
    setOpenPopover(null);
  };

  const popoverRefs = [useRef(), useRef(), useRef()];

  useOutsideClick(popoverRefs, handleClose);

  const [topBurner, setTopBurner] = useState(null);
  const [marqueeImages, setMarqueeImages] = useState([]);
  const listItemStyle = {
    paddingLeft: "30px",
    textIndent: "-1px",
    background: `url(/goldStar2.png) no-repeat`,
    backgroundSize: "20px 20px",
    marginBottom: "1rem", // Add space between list items
  };

  useEffect(() => {
    const fetchData = async () => {
      const q = query(
        collection(db, "results"),
        orderBy("burnedAmount", "desc"),
        limit(1)
      );
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const result = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          src: doc.data().image.src,
          alt: doc.data().image.alt,
          message: doc.data().userMessage,
          userName: doc.data().userName,
          burnedAmount: doc.data().burnedAmount,
          isComposite: doc.data().image.isFirstImage || false,
        }))[0];
        setTopBurner(result);
      });
      return () => unsubscribe();
    };

    fetchData().catch(console.error);
  }, []);

  useEffect(() => {
    const fetchMarqueeData = async () => {
      const q = query(
        collection(db, "results"),
        orderBy("createdAt", "desc"),
        limit(100)
      );
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
        }));

        // Sort by burnedAmount to get top burners
        const sortedByAmount = [...results].sort(
          (a, b) => b.burnedAmount - a.burnedAmount
        );

        // Top 3 burners
        const topBurners = sortedByAmount
          .slice(0, 3)
          .map((image) => ({ ...image, type: "Top Burner" }));

        // Most recent burners (excluding top burners)
        const recentBurners = results
          .filter((r) => !topBurners.some((tb) => tb.id === r.id))
          .slice(0, 10)
          .map((image) => ({ ...image, type: "New Burner" }));

        // Combine top burners and recent burners
        const combinedImages = [...topBurners, ...recentBurners];

        setMarqueeImages(combinedImages);
      });
      return () => unsubscribe();
    };

    fetchMarqueeData().catch(console.error);
  }, []);

  return (
    <>
      <Box mt={0} position="relative">
        <Flex direction={{ base: "column", md: "row" }}>
          <Box
            flex="1.1"
            mt={0}
            mb={0}
            // minH={{ base: "600px", md: "auto" }}
            position="relative" // Establish positioning context
          >
            <SliderRevolutionCarousel />
          </Box>
        </Flex>
      </Box>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        mb={9}
        mt={1}
        py={{ base: 4, md: 7 }} // Adjust padding for smaller screens
        px={{ base: 2, md: 3 }} // Adjust padding for smaller screens
        borderRadius={"10px"}
      >
        <Flex
          direction={{ base: "column", md: "row" }}
          flexWrap="nowrap"
          width="100%"
          alignItems={{ base: "center", md: "stretch" }} // Center on small screens, stretch on larger screens
          position="relative" // Ensure relative positioning
          py={{ base: 6, md: 0 }} // Add padding on small screens to prevent overlap
        >
          {/* Left Column for the Coin */}
          <Box
            flex="1"
            display="flex"
            justifyContent="center"
            alignItems="center"
            mb={{ base: 4, md: 0 }} // Add bottom margin on small screens to create space between the Coin and the text
            style={{ height: "25rem", minHeight: "20rem" }}
          >
            <div
              style={{
                position: "absolute", // Absolutely position the Coin box over the image
                top: isLargerThan768 ? "-15%" : "-5%", // Adjust the vertical position as needed
                left: "1%", // Adjust the horizontal position as needed
              }}
            >
              <h1
                className="thelma"
                style={{ textAlign: "center", zIndex: "1" }}
              >
                Our Lady <br />
                <span style={{ fontSize: "2rem" }}>of </span>
                <span>Perpetual</span>
                <br />
                <span>Profit </span>
              </h1>{" "}
            </div>
            <div style={{ position: "relative", top: "5rem" }}>
              <div
                ref={coinRef}
                className="coin-container sparkle"
                style={{ position: "relative", width: "15rem" }}
              >
                <Link href="#" className="coin-link">
                  <Coin />
                </Link>
              </div>
            </div>
            <div className="emoji-container">
              <span className="emoji">👈</span>
            </div>
          </Box>

          {/* Right Column for the Text */}
          <Box
            flex="1"
            display="flex"
            justifyContent={{ base: "center", md: "flex-start" }} // Center text on small screens, align left on medium to large screens
            alignItems="center"
          >
            <div
              style={{
                width: "100%",
                maxWidth: "500px", // Adjust as needed for your design
                transform: "skew(-7deg)", // Skew the text container
                border: "3px solid #8e662b",
                padding: "1rem",
                margin: "1rem",
              }}
            >
              <StyledText
                style={{
                  lineHeight: "1.2",
                  marginTop: "1rem",
                  marginBottom: "2rem",
                  marginRight: "1rem",
                  marginLeft: "1rem",
                  transform: "skew(10deg)", // Counter-skew the text to make it appear normal
                }}
              >
                The
                <span style={{ fontFamily: "Oleo Script" }}> RL80 </span> token
                lets you pay homage to the Patron Saint of Day Traders herself.
                Hold <span style={{ fontFamily: "Oleo Script" }}> RL80 </span>{" "}
                in your wallet as a good luck charm and to ward off evil. Hang
                out at The{" "}
                <span style={{ fontFamily: "Oleo Script" }}> RL80 </span>
                Fair and play guilt-free games of chance to win more tokens.
                Whatever you do, and wherever you go, Our Lady of Perpetual
                Profit is your personal guide up and to the right.
              </StyledText>
            </div>
          </Box>
        </Flex>
      </Box>
      {/* <hr style={{ marginTop: "2rem" }} class="tradingview-line" /> */}
      <Box
        mb={9}
        mt={6}
        py={{ base: 4, md: 7 }} // Adjust padding for smaller screens
        px={{ base: 2, md: 3 }} // Adjust padding for smaller screens
        borderRadius={"10px"}
        border={"1px solid #8e662b"}
      >
        <Flex direction={{ base: "column", md: "row" }} flexWrap="nowrap">
          <Box flex="1" mt={3}>
            <Heading fontSize={"3.9rem"} lineHeight={".9"}>
              Reflected Glory
            </Heading>
            <StyledText
              style={{
                textAlign: "center",
                lineHeight: "1.2",
                marginTop: "1rem",
                marginBottom: "1rem",
                marginRight: "1rem",
                marginLeft: "1rem",
              }}
            >
              The
              <span style={{ fontFamily: "Oleo Script" }}> RL80 </span> token
              Deadlights jack lad schooner scallywag dance the hempen jig
              carouser broadside cable strike colors. Bring a spring upon her
              cable holystone blow the man down Are you ready to make a small
              sacrifice for big kicks?
            </StyledText>
            <Box display="flex" justifyContent="center" alignItems="center">
              <Link href="/gallery">
                <Button className="shimmer-button burnButton">
                  I'm ready!<span className="shimmer"></span>
                </Button>
              </Link>
            </Box>
          </Box>

          <Box
            flex="1"
            position="relative"
            display="flex"
            flexDirection="column"
            justifyContent="flex-end" // Ensure content is at the bottom on larger screens
            alignItems="center"
            mt={{ base: 6, md: 0 }} // Add some margin-top on smaller screens
          >
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%", // Ensure the div takes full width
                maxWidth: "15rem", // Set a max-width for the image container
                marginBottom: "10rem", // Add margin below the image
              }}
            >
              <Image
                src="/pyromania.gif"
                alt=""
                width={180} // Adjust the size for smaller screens
                height={180} // Adjust the size for smaller screens
                style={{
                  borderRadius: "50%",
                  border: "3px solid gold",
                  opacity: 0.8,
                  zIndex: "1", // Adjusted zIndex to ensure correct stacking
                  position: "relative",
                  top: "1rem",
                }}
              />
            </div>

            <div
              style={{
                position: "absolute", // Absolutely position the TokenText to avoid shifting
                bottom: "0", // Anchor it to the bottom of its container
                left: "50%", // Center it horizontally
                transform: "translateX(-50%) scale(0.75)", // Translate to ensure centering and scaling
                marginTop: "2rem", // Maintain spacing consistency
              }}
            >
              <TokenText />
            </div>
          </Box>
        </Flex>

        {marqueeImages.length > 0 && (
          <Box className="marquee-container" position="relative" mt={3}>
            <TextMarquee images={marqueeImages} />
          </Box>
        )}
      </Box>

      {/* <hr class="tradingview-line" /> */}
      <div style={{ position: "relative" }}>
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "100%",
            height: "100%",
            backgroundImage: "url(/sacred.png)",
            backgroundPosition: "90% 20%",
            backgroundRepeat: "no-repeat",
            backgroundSize: "100%", // Change this value to "zoom out" from the image
            transform: "scaleX(-1)",
            opacity: 0.2,
            zIndex: 1,
          }}
        />

        <Box mb={9} mt={6}>
          <Flex>
            <div
              style={{
                position: "relative",
                display: "inline-block",
                justifyContent: "center",
                alignItems: "center",
                marginTop: "1.3rem",
                marginBottom: "3rem",
                width: "50vw",
                zIndex: 2,
              }}
            >
              <RotatingText />
            </div>
          </Flex>
        </Box>
      </div>
    </>
  );
};

export default Hero;
