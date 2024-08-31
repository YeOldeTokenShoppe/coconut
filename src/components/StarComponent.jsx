// components/StarComponent.js
import React from "react";
// import "../styles/stars.css";

const StarComponent = ({ children }) => {
  return (
    <div className="unique-block">
      <div className="unique-origin">
        {[...Array(8)].map((_, i) => (
          <span
            className="unique-star"
            style={{ "--unique-i": i }}
            key={i}
          ></span>
        ))}
      </div>
      <div className="content-wrapper">{children}</div>
    </div>
  );
};

export default StarComponent;
