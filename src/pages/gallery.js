// pages/gallery.js
import { useEffect, useRef } from "react";
import BurnGallery from "../components/BurnGallery";
import NavBar from "../components/NavBar.client";
import BurnModal from "../components/BurnModal";
import Communion from "../components/Communion";

export default function GalleryPage() {
  const bgRef = useRef();

  useEffect(() => {
    function updateSize() {
      if (typeof window !== "undefined" && bgRef.current) {
        bgRef.current.style.height = `${document.body.scrollHeight}px`;
        bgRef.current.style.width = `${document.body.scrollWidth}px`;
      }
    }

    if (typeof window !== "undefined") {
      updateSize();
      window.addEventListener("resize", updateSize);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", updateSize);
      }
    };
  }, []);

  return (
    <>
      <div
        ref={bgRef}
        style={{
          backgroundImage: `url(${"/purple.jpg"})`,
          backgroundPosition: "center",
          backgroundRepeat: "repeat",
          position: "absolute",
          top: "0",
          left: "0",
          zIndex: "0",
        }}
      />
      <div style={{ position: "relative", zIndex: 1 }}>
        <BurnGallery />
        {/* <BurnModal /> */}

        <div style={{ marginTop: "2rem" }}>
          <NavBar />
        </div>
        <div style={{ marginTop: "3rem" }}>{/* <Communion /> */}</div>
      </div>
    </>
  );
}
