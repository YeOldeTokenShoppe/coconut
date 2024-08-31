// Import styles

import React, { useState, useEffect } from "react";
import NavBar from "../components/NavBar.client";

export default function Test() {
  // Empty dependency array means this effect runs once on mount
  // Component
  return (
    <>
      <div
        style={{
          width: "100vw",
          height: "250px",
          margin: "0",
        }}
      >
        <NavBar />
      </div>
    </>
  );
}
