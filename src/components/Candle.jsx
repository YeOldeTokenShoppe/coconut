import React from "react";

function Candle() {
  return (
    <div>
      <div
        style={{
          position: "relative",
          height: "150px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          className="holder"
          style={{
            transform: "scale(0.45)",
            position: "absolute",
            bottom: "-7rem",
          }}
        >
          <div className="candle">
            <div className="thread"></div>
            <div className="blinking-glow"></div>
            <div className="glow"></div>
            <div className="flame"></div>
          </div>
        </div>
      </div>
      {/* <div style={{ position: "relative", bottom: "-.1rem", left: "6.5rem" }}>
        <div className="holder" style={{ transform: "scale(0.42)" }}>
          <div className="candle">
            <div className="thread"></div>
            <div className="blinking-glow"></div>
            <div className="glow"></div>
            <div className="flame"></div>
          </div>
        </div>
      </div> */}
    </div>
  );
}

export default Candle;
