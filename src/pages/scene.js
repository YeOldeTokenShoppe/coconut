import React, { useState, useEffect } from "react";
import ThreeDVotiveStand from "../components/3dVotiveStand";
import Loader from "../components/Loader";

export default function ScenePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [votiveLoaded, setVotiveLoaded] = useState(false); // Track when Thesis is loaded
  useEffect(() => {
    if (votiveLoaded) {
      setIsLoading(false);
    }
  }, [votiveLoaded]);
  return (
    <>
      <div>
        <ThreeDVotiveStand setVotiveLoaded={setVotiveLoaded} />
      </div>
    </>
  );
}
