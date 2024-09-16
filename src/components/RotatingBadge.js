// RotatingBadge.js
"use client";
import React, { useEffect, useRef } from "react";

const RotatingBadge = () => {
  const badgeRef = useRef(null);

  useEffect(() => {
    const elements = badgeRef.current.querySelectorAll(".badge__char");
    const step = 360 / elements.length;

    elements.forEach((elem, i) => {
      elem.style.setProperty("--char-rotate", `${i * step}deg`);
    });
  }, []);

  return (
    <div className="badge" ref={badgeRef}>
      <span className="badge__char" style={{ color: "#ffff" }}>
        I
      </span>
      <span className="badge__char" style={{ color: "#ffff" }}>
        N
      </span>
      <span className="badge__char" style={{ color: "#ffff" }}>
        {" "}
      </span>
      <span className="badge__char" style={{ color: "#ffff" }}>
        R
      </span>
      <span className="badge__char" style={{ color: "#ffff" }}>
        L
      </span>
      <span className="badge__char" style={{ color: "#ffff" }}>
        8
      </span>
      <span className="badge__char" style={{ color: "#ffff" }}>
        0
      </span>
      <span className="badge__char" style={{ color: "#ffff" }}>
        {" "}
      </span>
      <span className="badge__char" style={{ color: "#ffff" }}>
        ★
      </span>
      <span className="badge__char" style={{ color: "#ffff" }}>
        {" "}
      </span>
      <span className="badge__char" style={{ color: "#ffff" }}>
        W
      </span>
      <span className="badge__char" style={{ color: "#ffff" }}>
        {"E"}
      </span>
      <span className="badge__char" style={{ color: "#ffff" }}>
        {" "}
      </span>
      <span className="badge__char" style={{ color: "#ffff" }}>
        T
      </span>
      <span className="badge__char" style={{ color: "#ffff" }}>
        R
      </span>
      <span className="badge__char" style={{ color: "#ffff" }}>
        U
      </span>
      <span className="badge__char" style={{ color: "#ffff" }}>
        S
      </span>
      <span className="badge__char" style={{ color: "#ffff" }}>
        T
      </span>
      <span className="badge__char" style={{ color: "#ffff" }}>
        {" "}
      </span>
      <span className="badge__char" style={{ color: "#ffff" }}>
        ★
      </span>
      <span className="badge__char" style={{ color: "#ffff" }}>
        {" "}
      </span>

      <img
        className="badge__emoji"
        src="/nuhart1.svg"
        width="72"
        height="72"
        alt=""
      />
      {/* <p className="badge__emoji" style={{ fontSize: "2.7rem" }}>
        ❤️‍🔥
      </p> */}
    </div>
  );
};

export default RotatingBadge;
