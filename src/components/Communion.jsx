"use client";
import React, { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

function Communion() {
  return (
    <div
      style={{
        position: "relative",
        bottom: "0",
        marginTop: "3rem",
        width: "100%",
        zIndex: "0",
      }}
    >
      <section id="footer" style={{ zIndex: "-2" }}>
        {/* <div className="inner"> */}
        {/* <ul className="icons">
          <li>
            <Link href="#" style={{ zIndex: "-2" }}>
              <div className="socials" style={{ zIndex: "-2" }}>
                <Image
                  src="/tiktok.svg"
                  alt="Tiktok"
                  width={258}
                  height={257}
                  style={{ width: "3rem", height: "3rem" }}
                />
              </div>
            </Link>
          </li>
          <li>
            <Link href="#">
              <div className="socials" style={{ zIndex: "-2" }}>
                <Image
                  src="/discord.svg"
                  alt="Discord"
                  width={258}
                  height={257}
                  style={{ width: "3rem", height: "3rem" }}
                />
              </div>
            </Link>
          </li>
          <li>
            <Link href="#">
              <div className="socials" style={{ zIndex: "-2" }}>
                <Image
                  src="/x_logo.svg"
                  alt="X"
                  width={258}
                  height={257}
                  style={{ width: "3rem", height: "3rem" }}
                />
              </div>
            </Link>
          </li>
          <li>
            <Link href="#">
              <div className="socials" style={{ zIndex: "-2" }}>
                <Image
                  src="/telegram.svg"
                  alt="telegram"
                  width={258}
                  height={257}
                  style={{ width: "3rem", height: "3rem" }}
                />
              </div>
            </Link>
          </li>
        </ul> */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            // width: "6rem",
            // height: "6rem",
            right: "10%",
            bottom: "10px",

            marginTop: "-2rem",
          }}
        >
          {/* <RotatingBadge /> */}
        </div>
        <div
          style={{
            textAlign: "center",
            fontSize: "small",
            color: "grey",
            marginBottom: "1rem",
          }}
        >
          Contact: hello@ourlady.io
          <br />
          &copy; Made with C8H11NO2 + C10H12N2O + C43H66N12O12S2 by
          COCONUT🌴TOKENS
        </div>
        {/* </div> */}
      </section>
    </div>
  );
}

export default Communion;
