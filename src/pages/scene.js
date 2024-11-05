import React from "react";
import MusicPlayer from "../components/MusicPlayer2";

export default function ScenePage() {
  return (
    <>
      <div style={{ position: "relative", top: "5rem" }}>
        <MusicPlayer />
      </div>
      {/* <iframe
        src="https://rl80.xyz"
        width="100%"
        height="100%"
        style={{ border: "none" }}
      ></iframe> */}
    </>
  );
}
