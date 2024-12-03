// pages/thesis.js
import React, { useState, useEffect } from "react";
import Thesis from "../components/Thesis";
import NavBar from "../components/NavBar.client";
import Communion from "../components/Communion";
import Loader from "../components/Loader";

export default function ThesisPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [thesisLoaded, setThesisLoaded] = useState(false);
  const [communionLoaded, setCommunionLoaded] = useState(false);

  useEffect(() => {
    console.log("Loading status:", { thesisLoaded, communionLoaded });
    if (thesisLoaded && communionLoaded) {
      console.log("Both components loaded, hiding loader");
      setIsLoading(false);
    }
  }, [thesisLoaded, communionLoaded]);

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
        <Thesis setThesisLoaded={setThesisLoaded} />
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
