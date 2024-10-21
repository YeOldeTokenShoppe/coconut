import React, { useState, useEffect } from "react";
import { useRouter } from "next/router"; // For navigation in Next.js

const DoorComponent = () => {
  const [isDoorOpen, setIsDoorOpen] = useState(false); // Track door state
  const [showButton, setShowButton] = useState(false); // Track button visibility
  const router = useRouter();

  const toggleDoor = () => {
    setIsDoorOpen((prev) => !prev); // Toggle the door state
  };

  // Handle button delay
  useEffect(() => {
    if (isDoorOpen) {
      const timer = setTimeout(() => {
        setShowButton(true); // Show button after delay
      }, 1000); // 2000ms delay (2 seconds)

      return () => clearTimeout(timer); // Clean up timeout
    } else {
      setShowButton(false); // Hide the button when door is closed
    }
  }, [isDoorOpen]);

  const navigateThroughDoor = (e) => {
    e.stopPropagation(); // Prevent door from closing
    router.push("https://rl80.xyz"); // Navigate to the new page
  };

  return (
    <div className="perspective" onClick={toggleDoor}>
      <div className={`thumb ${isDoorOpen ? "thumbOpened" : ""}`}></div>
      {showButton && (
        <button className="cybr-btn" onClick={navigateThroughDoor}>
          ENTer<span aria-hidden>_</span>
          <span aria-hidden className="cybr-btn__glitch">
            Entrez VOUS
          </span>
          <span aria-hidden className="cybr-btn__tag">
            RL80
          </span>
        </button>
      )}
    </div>
  );
};

export default DoorComponent;
