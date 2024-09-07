import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Box, Image } from "@chakra-ui/react";

const Carousel = dynamic(() => import("../components/Carousel"), {
  ssr: false,
});

export default function CommunionPage() {
  const [isMobile, setIsMobile] = useState(null);

  useEffect(() => {
    // Save original values
    const originalStyle = window.getComputedStyle(document.body).overflow;

    // Apply new style
    document.body.style.margin = "0";
    document.body.style.padding = "0";

    // Cleanup function
    return () => {
      document.body.style.margin = originalStyle.margin;
      document.body.style.padding = originalStyle.padding;
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== "undefined") {
        setIsMobile(window.innerWidth <= 760);
      }
    };

    if (typeof window !== "undefined") {
      setIsMobile(window.innerWidth <= 760);
      window.addEventListener("resize", handleResize);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", handleResize);
      }
    };
  }, []);

  if (isMobile === null) {
    return null; // or a loading spinner, if you prefer
  }

  return (
    <>
      <div
        style={{
          // backgroundImage: `url(${"/burstBackground.png"})`,
          // backgroundPosition: "center",
          // backgroundRepeat: "no-repeat",
          // backgroundSize: "cover",
          // transform: isMobile ? "scale(1.2)" : "scale(1.6)",
          // opacity: ".3",
          position: "absolute",
          top: "0",
          left: "0",
          right: "0", // add right and bottom
          bottom: "0",
          zIndex: "0",
          width: "", // set width and height to 100%

          padding: "0",
        }}
      />
      {/* <div
        style={{
          position: "relative",
          width: "100%",
          marginTop: isMobile ? "-45%" : "-18%",
          transform: isMobile ? "scale(3)" : "scale(1)",
        }}
      >
        <Image src="/banner.png" alt="banner" height="auto" width="100%" />
      </div> */}

      <div
        style={{
          position: "relative",
          width: "100%",
          height: isMobile ? "45vh" : "120vh",
          marginTop: isMobile ? "50%" : "35%",
          // marginBottom: "2rem",
          transform: isMobile ? "scale(.9)" : "scale(1)",
        }}
      >
        <Carousel
          images={[
            { src: "seaMonster.png", title: "Sea Monster" },
            { src: "bull.png", title: "Bull" },
            { src: "bear.png", title: "Bear" },
            { src: "gator.png", title: "Gator" },
            { src: "chupa.png", title: "Chupacabra" },
            { src: "snowman.png", title: "Yeti" },
            { src: "unicorn.png", title: "Unicorn" },
            { src: "jackalope.png", title: "Jackalope" },
            { src: "liger.png", title: "Liger" },
            { src: "dire.png", title: "Dire" },
            { src: "warthog.png", title: "Warthog" },
            { src: "mothmanRide.png", title: "Mothman" },
          ]}
        />
        <Box
          style={{
            position: "fixed",
            justifyContent: "center",
            bottom: isMobile ? "-40rem" : "3rem",
            right: isMobile ? "-25%" : "5%",
          }}
        >
          <iframe
            src="/html/musicPlayer.html"
            style={{
              width: isMobile ? "150vw" : "50vw",
              height: isMobile ? "100vh" : "50vh",
              border: "none",
              transform: isMobile ? "scale(.9)" : "scale(1)",
            }}
            scrolling="no"
            allowFullScreen
          />
        </Box>
      </div>
    </>
  );
}
