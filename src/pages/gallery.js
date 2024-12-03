// pages/gallery.js
import React, { useRef, useEffect, useState, useCallback } from "react";
import BurnGallery from "../components/BurnGallery";
import NavBar from "../components/NavBar.client";
import BurnModal from "../components/BurnModal";
import Communion from "../components/Communion";
import Loader from "../components/Loader";

export default function GalleryPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [burnGalleryLoaded, setBurnGalleryLoaded] = useState(false);
  const [communionLoaded, setCommunionLoaded] = useState(false);

  useEffect(() => {
    console.log("Loading status:", { burnGalleryLoaded, communionLoaded });
    if (burnGalleryLoaded && communionLoaded) {
      console.log("Both components loaded, hiding loader");
      setIsLoading(false);
    }
  }, [burnGalleryLoaded, communionLoaded]);

  return (
    <div style={{ position: "relative" }}>
      {/* Always render the content, but control visibility with CSS */}
      <div
        style={{
          opacity: isLoading ? 0 : 1,
          transition: "opacity 0.5s ease-in-out",
          visibility: isLoading ? "hidden" : "visible",
        }}
      >
        <BurnGallery setBurnGalleryLoaded={setBurnGalleryLoaded} />
        <div style={{ paddingTop: "5rem" }}>
          <NavBar />
        </div>
        <Communion setCommunionLoaded={setCommunionLoaded} />
      </div>
      {/* Loader on top */}
      {isLoading && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 50,
          }}
        >
          <Loader />
        </div>
      )}
    </div>
  );
}
