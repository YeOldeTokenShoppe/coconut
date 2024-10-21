import React, { useState, useEffect } from "react";

const NeonSign = () => {
  const [text, setText] = useState("RL80");

  useEffect(() => {
    const interval = setInterval(() => {
      setText((prevText) => (prevText === "  RL80 " ? "OPEN" : "  RL80 "));
    }, 2000); // Change text every 2 seconds

    return () => clearInterval(interval); // Clean up the interval on unmount
  }, []);

  return (
    <div className="neon-sign">
      {/* <h1 id="neon-text">{text}</h1> */}
      <h1 id="neon-text">OPEN</h1>
    </div>
  );
};

export default NeonSign;
