"use client";
import React, { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

function Communion() {
  return (
    <section id="footer">
      {/* <div className="inner"> */}
      <ul className="icons" style={{ zIndex: "100" }}>
        <li>
          <Link href="#">
            <div className="socials">
              <Image
                src="/instagram_.png"
                alt="Instagram"
                width={258}
                height={257}
                style={{ width: "3rem", height: "3rem", zIndex: "100" }}
              />
            </div>
          </Link>
        </li>
        <li>
          <Link href="#">
            <div className="socials">
              <Image
                src="/threads_.png"
                alt="Threads"
                width={258}
                height={257}
                style={{ width: "3rem", height: "3rem", zIndex: "100" }}
              />
            </div>
          </Link>
        </li>
        <li>
          <Link href="#">
            <div className="socials">
              <Image
                src="/x_.png"
                alt="X"
                width={258}
                height={257}
                style={{ width: "3rem", height: "3rem", zIndex: "100" }}
              />
            </div>
          </Link>
        </li>
        <li>
          <Link href="#">
            <div className="socials">
              <Image
                src="/telegram_.png"
                alt="telegram"
                width={258}
                height={257}
                style={{ width: "3rem", height: "3rem", zIndex: "100" }}
              />
            </div>
          </Link>
        </li>
      </ul>
      <div
        style={{
          display: "flex",
          position: "absolute",
          // width: "6rem",
          // height: "6rem",
          right: "10%",
          bottom: "10px",
          zIndex: "10",
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
        &copy; Made with C8H11NO2 + C10H12N2O + C43H66N12O12S2 by COCONU🌴OKENS
      </div>
      {/* </div> */}
    </section>
  );
}

export default Communion;
