// Import styles
"use client";
import React, { useState, useEffect } from "react";
import WordPressSlider from "../components/WordPressSlider";
import RotatingBadge from "../components/RotatingBadge";

export default function Page() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 6000); // 5000ms = 5s

    // Cleanup function to clear the timeout if the component unmounts before the timeout finishes
    return () => clearTimeout(timer);
  }, []); // Empty dependency array means this effect runs once on mount
  // Component
  return (
    <>
      <div
        // className="flex-text"
        style={{
          display: "flex",
          height: "5vh",
          width: "auto",
          position: "absolute", // Position the badge absolutely within the container
          top: "2rem",
          right: "2rem",
          opacity: isVisible ? 1 : 0, // Fade in the div after 5 seconds
          transition: "opacity 0.5s ease-in-out", // Smooth transition
        }}
      >
        <div
          style={{
            maxWidth: "1400px",
            margin: "auto",
            position: "relative", // Position the container relatively
          }}
        >
          <a href="/home" style={{ textDecoration: "none" }}>
            <RotatingBadge />
          </a>
        </div>
      </div>
      <WordPressSlider />
    </>
  );
}
