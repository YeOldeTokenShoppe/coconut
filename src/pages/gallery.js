// pages/gallery.js
import React, { useRef, useEffect, useState } from "react";
import BurnGallery from "../components/BurnGallery";
import NavBar from "../components/NavBar.client";
import BurnModal from "../components/BurnModal";
import Communion2 from "../components/Communion2";
import Communion from "../components/Communion";
import DoorComponent from "../components/Door";
import Loader from "../components/Loader";

export default function GalleryPage() {
  const [isLoading, setIsLoading] = useState(true); // Manage loading state

  const bgRef = useRef(null);
  const [bgStyle, setBgStyle] = useState({
    backgroundImage: `url(${"/wall3.png"})`,
    opacity: ".2",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "top center",
    backgroundSize: "contain",
    position: "absolute",
    height: "100vh",
    width: "100vw",
    top: "0",
    left: "0",
    zIndex: "0",
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setBgStyle((prevStyle) => ({
          ...prevStyle,
          backgroundSize: "auto",
          backgroundRepeat: "repeat",
          height: "210rem",
        }));
      } else {
        setBgStyle((prevStyle) => ({
          ...prevStyle,
          backgroundSize: "cover",
          backgroundRepeat: "repeat",
          height: "100rem",
          width: "98%",
        }));
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Call the function initially to set the correct style

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {isLoading && <Loader />} {/* Show the Loader while loading */}
      <div
        style={{
          opacity: isLoading ? 0 : 1,
          transition: "opacity 0.5s",
          position: "relative",
          zIndex: 1,
        }}
      >
        <BurnGallery setIsLoading={setIsLoading} />
        <div style={{ marginTop: "10rem", zIndex: 2000 }}>
          <NavBar />
        </div>
        <Communion />
      </div>
      <style jsx>{`
        @media (max-width: 600px) {
          .background-image {
            height: 85vh; /* Adjust the height to 85vh for phone-sized screens */
            background-position: bottom center; /* Align the background image to the bottom */
          }
        }
      `}</style>
    </>
  );
}
