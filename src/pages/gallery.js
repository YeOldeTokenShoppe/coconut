// pages/gallery.js
import { useEffect, useRef } from "react";
import BurnGallery from "../components/BurnGallery";
import NavBar from "../components/NavBar.client";
import BurnModal from "../components/BurnModal";
import Communion2 from "../components/Communion2";
import DoorComponent from "../components/Door";

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
          // backgroundImage: `url(${"/bricks.png"})`,
          backgroundPosition: "center",
          backgroundRepeat: "repeat",
          position: "absolute",
          height: "100vh",
          width: "100vw",
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
        <Communion2 />
      </div>
    </>
  );
}
