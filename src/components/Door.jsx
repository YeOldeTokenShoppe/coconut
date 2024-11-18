import React, { useState, useEffect } from "react";
import { useRouter } from "next/router"; // For navigation in Next.js

const DoorComponent = () => {
  const [openedDoor, setOpenedDoor] = useState(null);
  const [showButton, setShowButton] = useState(false);
  const [fadeOut, setFadeOut] = useState(false); // Fade-out state
  const router = useRouter();

  const openDoor = (index) => {
    if (openedDoor === index) {
      setOpenedDoor(null); // close the door if the same one is clicked
    } else {
      setOpenedDoor(index); // open the clicked door
    }
  };

  useEffect(() => {
    if (openedDoor !== null) {
      const timer = setTimeout(() => {
        setShowButton(true); // Show button after delay
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      setShowButton(false);
    }
  }, [openedDoor]);

  const navigateThroughDoor = (e) => {
    e.stopPropagation();
    setFadeOut(true); // Trigger fade-out effect

    setTimeout(() => {
      router.push("/rocket"); // Navigate to the new page after fade-out
    }, 4500); // Delay for the fade-out animation to complete
  };

  useEffect(() => {
    // Add keyframes for fadeOut and zoomOut animations
    const fadeOutKeyframes = `
      @keyframes fadeOut {
        0% { opacity: 0; }
        100% { opacity: 1; }
      }

      @keyframes zoomOut {
        0% { transform: scale(1); }
        100% { transform: scale(1.1); }
      }
    `;

    // Create a style element and append keyframes
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerHTML = fadeOutKeyframes;
    document.head.appendChild(styleSheet);

    // Cleanup style on component unmount
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  const doors = [0];

  return (
    <div style={containerStyles}>
      {doors.map((door, index) => (
        <div
          key={index}
          style={perspectiveStyles}
          onClick={() => openDoor(index)}
        >
          <div
            style={{
              ...thumbStyles,
              transform:
                openedDoor === index ? "rotateY(-90deg)" : "rotateY(0deg)",
              transition: "transform 0.5s linear, left 0.5s linear",
              left: openedDoor === index ? "20%" : "0",
            }}
          ></div>
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
      ))}
      {fadeOut && <div style={overlayStyles}></div>}
    </div>
  );
};

const containerStyles = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  position: "relative",
  width: "100%",
  height: "60vh",
};

const perspectiveStyles = {
  backgroundImage: "url('/DoorFrame7.gif')",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "center center",
  backgroundSize: "contain",
  position: "relative",
  display: "inline-block",
  width: "80vw",
  height: "80vh",
  margin: "0",
  WebkitPerspective: "1350px",
  borderRadius: "3px",
  boxSizing: "border-box",
  bottom: "4rem",
};

const thumbStyles = {
  backgroundImage: "url('/Door9.png')",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "center center",
  backgroundSize: "contain",
  width: "100%",
  height: "100%",
  position: "absolute",
  boxSizing: "border-box",
  borderRadius: "3px",
  transformOrigin: "left",
  cursor: "pointer",
};

// Overlay fade-out and zoom-out effect
const overlayStyles = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "black",
  opacity: 0,
  animation:
    "fadeOut 4.5s ease-in-out forwards, zoomOut 4.5s ease-in-out forwards",
  zIndex: 10,
};

export default DoorComponent;
