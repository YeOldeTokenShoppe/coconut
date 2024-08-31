"use client";
import React, { useState, useEffect, useRef } from "react";
import Communion from "../components/Communion";
import { Heading, Skeleton, Box, Image, Stack } from "@chakra-ui/react";
import Script from "next/script";
import Link from "next/link";
import Header3 from "../components/Header3";
import Carousel from "../components/Carousel";

export default function CommunionPage() {
  const [imageLoaded, setImageLoaded] = useState(false);
  const recordUrl = "./html/recordPlayer.html";

  return (
    <>
      <div
        style={{
          position: "relative",
          width: "100%",
          margin: "0",
          display: "block",
        }}
      >
        <Header3
          style={{
            position: "absolute",
            width: "100%",
            top: 0,
            left: 0,
          }}
        />
      </div>
      <section className="container">
        <div className="wrap">
          <div className="pattern"></div>
        </div>
      </section>
      <div className="pageBackground">
        {/* <div
        className="sgwrapper"
        style={{
          position: "relative",
          height: "calc(100vh - 50px)",
          // display: "flex",
          justifyContent: "center",
          // alignItems: "center",
          flexWrap: "wrap",
          marginBottom: "2rem",
        }}
      >
        <div className="item">
          <Image
            src="/Phone.png"
            alt="phone"
            style={{ maxWidth: "10rem" }}
            layout="fill"
            objectFit="contain"
            className="foreground-image"
            onLoad={() => setImageLoaded(true)}
          />
          <Link href="#">
            <Heading
              className="socials1"
              color="gold.600"
              fontSize={"1.1rem"}
              style={{
                position: "absolute",
                top: "20%",
                right: "30%",
                // transform: "rotate(-10deg)",
              }}
            >
              Dex Screener
            </Heading> */}
        {/* <Image
                src="/instagram_.png"
                alt="Instagram"
                width={258}
                height={257}
                style={{
                  width: "3.5rem",
                  height: "3.5rem",
                  zIndex: "100",
                  position: "absolute",
                  top: "20%",
                  right: "30%",
                  color: "gold.100",
                }}
              /> */}
        {/* </Link>
        </div>
        <div
          className="item"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {" "}
          <Image
            src="/shop.png"
            alt="gucci"
            style={{ maxWidth: "10rem", left: "30%" }}
            layout="fill"
            objectFit="contain"
            className="foreground-image"
            onLoad={() => setImageLoaded(true)}
            // style={{ right: "2rem" }}
          />
          <Link href="#">
            <Heading
              fontSize={"1.5rem"}
              color="gold.600"
              s
              className="socials"
              style={{
                position: "absolute",
                top: "10%",
                right: "30%",
              }}
            >
              Instagram
            </Heading>
          </Link>
        </div>
        <div className="item">
          {" "}
          <Image
            src="/babypepe.png"
            alt="babypepe"
            style={{ maxWidth: "10rem", bottom: "2rem" }}
            layout="fill"
            objectFit="contain"
            className="foreground-image"
            onLoad={() => setImageLoaded(true)}
          />
        </div>
        <div className="item">
          <Image
            src="/ride.png"
            alt="ride the lightning"
            style={{ maxWidth: "10rem" }}
            layout="fill"
            objectFit="contain"
            className="foreground-image"
            onLoad={() => setImageLoaded(true)}
            // style={{ left: "1rem" }}
          /> */}

        {/* <Link href="#">
              <Heading
                className="socials"
                fontSize={"1.5rem"}
                color="gold.600"
                style={{
                  position: "absolute",
                  top: "25%",
                  right: "20%",
                  color: "#bf975b",
                  // transform: "rotate(-10deg)",
                }}
              >
                Telegram
              </Heading>
            </Link> */}
        {/* </div>
        <div className="item">
          {" "}
          <Image
            src="/wifhat.png"
            alt="beats"
            style={{ maxWidth: "10rem", left: "30%" }}
            layout="fill"
            objectFit="contain"
            className="foreground-image"
            onLoad={() => setImageLoaded(true)}
            // style={{ left: "1rem", bottom: "0" }}
          />
        </div>
        <div className="item">
          {" "}
          <Image
            src="/bike.png"
            alt="bike with Brett"
            style={{ maxWidth: "10rem", left: "30%" }}
            layout="fill"
            objectFit="contain"
            className="foreground-image"
            onLoad={() => setImageLoaded(true)}
          />
          <Link href="#">
            <Heading
              fontSize={"1.5rem"}
              color="pink"
              className="socials1"
              style={{
                position: "absolute",
                top: "20%",
                right: "30%",
                // transform: "rotate(10deg)",
              }}
            >
              X (Twitter)
            </Heading>
          </Link>
        </div>
        <div className="item">
          <Box
            style={{ position: "relative", height: "100vh", width: "100vw" }}
          >
            <iframe
              src="/html/recordPlayer.html"
              style={{
                position: "absolute",
                width: "60vw",
                height: "50vh",
                border: "none",
                transform: "scale(0.65) translate(-50%, -50%)",
                top: "75%",
                left: "40%",
              }}
              allowFullScreen
              title="Scroll"
            />
          </Box>
        </div>
      </div> */}
        <div
          style={{
            position: "absolute",
            bottom: "15rem",
            width: "100%",
            marginTop: "5rem",
          }}
        >
          <Carousel
            images={[
              { src: "seaMonster.png", title: "Sea Monster" },
              { src: "bull.png", title: "Bull" },
              { src: "bear.png", title: "Bear" },
              { src: "gator.png", title: "Gator" },
              { src: "chupa.png", title: "Chupacabra" },
              { src: "snowman.png", title: "Yeti" },
              { src: "unicorn.png", title: "Unicorn" },
              { src: "jackalope.png", title: "Jackalope" },
              { src: "liger.png", title: "Liger" },
              { src: "dire.png", title: "Dire" },
              { src: "warthog.png", title: "Warthog" },
              { src: "mothmanRide.png", title: "Mothman" },
            ]}
          />
        </div>
        <div>
          <Box
            style={{
              position: "fixed",
              bottom: "1rem",
              right: "0",
              marginBottom: "1rem",
            }}
          >
            <iframe
              src="/html/recordPlayer.html"
              style={{
                width: "35vw",
                height: "25vh",
                border: "none",
                transform: "scale(0.95)",
              }}
              allowFullScreen
              title="Scroll"
            />
          </Box>
        </div>
        <Communion />
      </div>
    </>
  );
}
