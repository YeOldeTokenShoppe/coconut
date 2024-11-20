// pages/numerology.js
import React, { useState, useEffect } from "react";
import Numerology from "../components/Numerology";
import NavBar from "../components/NavBar.client";
import Communion from "../components/Communion";
import Loader from "../components/Loader";

export default function NumerologyPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [numerologyLoaded, setNumerologyLoaded] = useState(false); // Track when Thesis is loaded
  const [communionLoaded, setCommunionLoaded] = useState(false); // Track when Communion is loaded

  useEffect(() => {
    if (numerologyLoaded && communionLoaded) {
      setIsLoading(false);
    }
  }, [numerologyLoaded, communionLoaded]);
  return (
    <>
      {isLoading && <Loader />}
      <div style={{ margin: "0rem 2rem 0rem 2rem" }}>
        <Numerology setNumerologyLoaded={setNumerologyLoaded} />
      </div>
      <div style={{ marginTop: "5rem" }}>
        <NavBar />
      </div>
      <div style={{ marginTop: "3rem" }}>
        <Communion setCommunionLoaded={setCommunionLoaded} />
      </div>
    </>
  );
}
