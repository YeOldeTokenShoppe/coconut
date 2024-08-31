"use client";
import React, { useState, useEffect } from "react";
import Hero from "../components/Hero";
import Header from "../components/Header";
import NavBar from "../components/NavBar.client";
import Communion from "../components/Communion";
// import StarComponent from "../components/Stars";

import Carousel from "../components/Carousel";

// const BurningEffect = dynamic(() => import("../components/BurningEffect"), {
//   ssr: false,
// });

export default function Home() {
  return (
    <>
      {/* <BurningEffect />
      <div className="content"></div> */}

      <Hero />

      {/* <CandleWrapper3D
          userImageSrc={userImageSrc}
          flameImageSrc={flameImageSrc}
        /> */}

      {/* <style jsx>{`
        .content {
          position: relative;
          z-index: 1;
        }
      `}</style> */}

      <NavBar />
      <Communion />
    </>
  );
}
