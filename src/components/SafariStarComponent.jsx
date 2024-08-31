import React from "react";
// import "../styles/safaristars.css";

const SafariStarComponent = ({ children }) => {
  return (
    <div className="safari-block">
      <div className="safari-origin">
        <span className="safari-star" style={{ "--i": 0 }}></span>
        <span className="safari-star" style={{ "--i": 1 }}></span>
        <span className="safari-star" style={{ "--i": 2 }}></span>
        <span className="safari-star" style={{ "--i": 3 }}></span>
        <span className="safari-star" style={{ "--i": 4 }}></span>
        <span className="safari-star" style={{ "--i": 5 }}></span>
        <span className="safari-star" style={{ "--i": 6 }}></span>
        <span className="safari-star" style={{ "--i": 7 }}></span>
      </div>
      {children}
    </div>
  );
};

export default SafariStarComponent;
