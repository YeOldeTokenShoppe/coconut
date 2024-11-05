"use client";
import React, { useState, useEffect } from "react";
import Hero from "../components/Hero";
import Header from "../components/Header";
import NavBar from "../components/NavBar.client";
import Communion from "../components/Communion";
import Carousel from "../components/Carousel";
import dynamic from "next/dynamic";

const BurningEffect = dynamic(() => import("../components/BurningEffect"), {
  ssr: false,
});

export default function Home() {
  return (
    <>
      <div style={{ position: "relative", zIndex: 1 }}>
        <Hero />

        <NavBar />
      </div>
      <Communion />
    </>
  );
}
