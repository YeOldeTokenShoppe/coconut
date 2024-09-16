import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Box, Image } from "@chakra-ui/react";
import Carousel from "../components/Carousel";
import MusicPlayer from "../components/MusicPlayer";

// const Carousel = dynamic(() => import("../components/Carousel"), {
//   ssr: false,
// });

export default function CommunionPage() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 600 : false
  );

  useEffect(() => {
    // Ensure window is defined
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
          marginTop: "5rem",
          marginBottom: "10rem",
          transform: "scale(.8)",
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
          logos={[
            { logo: "/telegram_.png", title: "Telegram", link: "https://t.me" },
            { logo: "/x_.png", title: "X", link: "https://x.com" },
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
            {
              logo: "/facebook_.png",
              title: "Facebook",
              link: "https://www.facebook.com",
            },
            {
              logo: "/discord_.png",
              title: "Discord",
              link: "https://discord.com",
            },
          ]}
        />
        {/* <div style={{ marginTop: "5rem" }}>
          <MusicPlayer />
        </div> */}
      </div>
    </>
  );
}
