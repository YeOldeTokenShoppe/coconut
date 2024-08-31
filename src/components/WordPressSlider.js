// components/WordPressSlider.js
import React from "react";

const WordPressSlider = () => {
  return (
    <>
      <div
        style={{
          width: "100%",
          height: "100vh",
          overflow: "hidden",
          margin: 0,
          padding: 0,
        }}
      >
        <iframe
          src="https://rl80.com"
          width="100%"
          height="100%"
          style={{ border: "none", margin: 0, padding: 0 }}
          allowFullScreen
          scrolling="no"
        />
      </div>
    </>
  );
};

export default WordPressSlider;
