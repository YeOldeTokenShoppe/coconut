import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Box } from "@chakra-ui/react";

const Carousel = dynamic(() => import("../components/Carousel"), {
  ssr: false,
});

export default function CommunionPage() {
  const [isMobile, setIsMobile] = useState(null);

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
          position: "relative",
          width: "100%",
          margin: "0",
        }}
      >
        <div
          style={{
            position: "relative",
            top: "50%",
            width: "100%",
            marginTop: "20rem",
            marginBottom: "5rem",
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
        </div>
      </div>

      <Box
        style={{
          position: "absolute",
          // bottom: isMobile ? "0" : "-6rem",
          bottom: "0",
          right: "0",
        }}
      >
        <iframe
          src="/html/recordPlayer.html"
          style={{
            width: "100%",
            height: "17rem",
            border: "none",
            transform: "scale(1)",
          }}
          scrolling="no"
          allowFullScreen
        />
      </Box>
    </>
  );
}
