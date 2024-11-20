// pages/thesis.js
import React, { useState, useEffect } from "react";
import Thesis from "../components/Thesis";
import NavBar from "../components/NavBar.client";
import Communion from "../components/Communion";
import Loader from "../components/Loader";

export default function ThesisPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [thesisLoaded, setThesisLoaded] = useState(false); // Track when Thesis is loaded
  const [communionLoaded, setCommunionLoaded] = useState(false); // Track when Communion is loaded

  useEffect(() => {
    if (thesisLoaded && communionLoaded) {
      setIsLoading(false);
    }
  }, [thesisLoaded, communionLoaded]);

  return (
    <>
      {isLoading && <Loader />}
      <Thesis setThesisLoaded={setThesisLoaded} />
      <div style={{ paddingTop: "5rem" }}>
        <NavBar />
      </div>
      <Communion setCommunionLoaded={setCommunionLoaded} />
    </>
  );
}
