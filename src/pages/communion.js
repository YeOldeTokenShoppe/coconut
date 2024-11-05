import React, { useState, useEffect } from "react";
import { Box, Image, Text } from "@chakra-ui/react";
import Carousel from "../components/Carousel";
import NavBar from "../components/NavBar.client";
import Communion from "../components/Communion";
import MusicPlayer from "../components/MusicPlayer2";
import { Heading } from "@chakra-ui/react";

export default function CommunionPage() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 600 : false
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleResize = () => {
        setIsMobile(window.innerWidth <= 600);
      };

      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }
  }, []);

  return (
    <>
      <div
        style={{
          position: "relative",
          marginBottom: "5rem",
          transform: "scale(.9)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Container wrapping the Carousel and the sign */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Image
            src={"/carouselSign.png"}
            alt="sign"
            style={{
              position: "absolute",
              top: "-6rem",
              left: "50%",
              transform: "translateX(-50%) scale(.5)",
              width: "auto",
              maxWidth: "none",
              maxHeight: "none",
              zIndex: 1000,
            }}
          />
          <Carousel
            images={[
              { src: "seaMonster.png", title: "Sea Monster" },
              { src: "bull.png", title: "Bull" },
              { src: "bear.png", title: "Bear" },
              { src: "gator.png", title: "G8r" },
              { src: "chupa.png", title: "Chupacabra" },
              { src: "snowman.png", title: "Yeti" },
              { src: "unicorn.png", title: "Unicorn" },
              { src: "jackalope.png", title: "Jackalope" },
              { src: "liger.png", title: "Liger" },
              { src: "dire.png", title: "Dire Wolf" },
              { src: "warthog.png", title: "Warthog" },
              { src: "mothmanRide.png", title: "Mothman" },
            ]}
            logos={[
              {
                logo: "/telegram.svg",
                title: "Telegram",
                link: "https://t.me",
              },
              { logo: "/x_.svg", title: "X", link: "https://x.com" },
              {
                logo: "/threads_.png",
                title: "Threads",
                link: "https://www.threads.net",
              },
              {
                logo: "/instagram_.png",
                title: "Instagram",
                link: "https://www.instagram.com",
              },
              // {
              //   logo: "/facebook_.png",
              //   title: "Facebook",
              //   link: "https://www.facebook.com",
              // },
              {
                logo: "/discord.svg",
                title: "Discord",
                link: "https://discord.com",
              },
            ]}
          />
        </div>
      </div>

      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        marginBottom="2rem"
        position="relative"
        zIndex={1} // Adjust z-index if needed
      >
        <div
          className="music-player-container"
          style={{ marginBottom: "2rem" }}
        >
          <MusicPlayer />
        </div>
      </Box>

      <div
        style={{
          position: "relative",
          marginBottom: "5rem",
          marginTop: "3rem",
        }}
      >
        <NavBar />
      </div>

      <Communion />

      <style jsx>{`
        @media (max-width: 600px) {
          img[src="/carouselSign.png"] {
            top: -2rem;
          }
        }
      `}</style>
    </>
  );
}
