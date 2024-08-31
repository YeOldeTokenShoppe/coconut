"use client";

import React, { useState, useEffect, useRef } from "react";
import { slide as Menu } from "react-burger-menu";
import Link from "next/link";
import Image from "next/image";
import { Container } from "@chakra-ui/react";
import { useUser, UserButton, useClerk } from "@clerk/nextjs";
import { useActiveAccount } from "thirdweb/react";
import { useRouter } from "next/router";
import WalletButton1 from "../components/WalletButton1";
import RotatingBadge2 from "./RotatingBadge2";

function Header2() {
  const [isLogoLoaded, setIsLogoLoaded] = useState(false);
  const { isSignedIn } = useUser();
  const { openSignIn, openSignUp, signOut } = useClerk();
  const [menuOpen, setMenuOpen] = useState(false);
  const [emoji, setEmoji] = useState("😇");
  const account = useActiveAccount();
  const node = useRef();
  const router = useRouter();
  const currentUrl = router.asPath;
  const [menuWidth, setMenuWidth] = useState("35%");
  const [mounted, setMounted] = useState(false);

  const matrixRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  const toggleMenu = (event) => {
    event.stopPropagation();
    setMenuOpen(!menuOpen);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (node.current && !node.current.contains(e.target)) {
        closeMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [node]);

  useEffect(() => {
    const emojiInterval = setInterval(() => {
      setEmoji((prevEmoji) => (prevEmoji === "😇" ? "😈" : "😇"));
    }, 3000);

    return () => clearInterval(emojiInterval);
  }, []);

  const handleSignInClick = () => {
    sessionStorage.setItem("redirectUrl", currentUrl);
    openSignIn({
      redirectUrl: currentUrl,
    });
  };

  const handleSignUpClick = () => {
    sessionStorage.setItem("redirectUrl", currentUrl);
    openSignUp({
      redirectUrl: currentUrl,
    });
  };

  useEffect(() => {
    const redirectUrl = sessionStorage.getItem("redirectUrl");
    if (isSignedIn && redirectUrl) {
      sessionStorage.removeItem("redirectUrl");
      router.push(redirectUrl);
    }
  }, [isSignedIn, router]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 760) {
        setMenuWidth("100%");
      } else {
        setMenuWidth("35%");
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const logoImage = new window.Image();
    logoImage.src = "/NEWRL80.png";
    logoImage.onload = () => setIsLogoLoaded(true);
  }, []);

  useEffect(() => {
    let p = matrixRef.current;

    function addBubbles() {
      for (var i = 0; i < 50; i++) {
        // change 25 to 50
        let b = document.createElement("p");
        b.className = "bubble";
        b.innerText = Math.floor(Math.random() * 10);
        b.style.left = i * 2 + 1 + "%"; // adjust the left position to accommodate more bubbles
        b.style.animationDelay = 4 * Math.random() + "s";
        p.appendChild(b);
      }
    }
    addBubbles();
  }, []);
  //   if (!mounted) {
  //     return null;
  //   }

  return (
    <>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <Container
          className="header"
          maxW={"1200px"}
          mb={{ base: "200px", sm: "100px", md: "125px" }}
          style={{ position: "relative" }}
        >
          <div className="header matrix-container" ref={matrixRef}>
            <p
              className="matrix-container"
              ref={matrixRef}
              style={{
                height: "250px",
                width: "120%",
              }}
            ></p>
          </div>
          <div className="section">
            <header id="header">
              <div className="menu-icon" onClick={toggleMenu}></div>
              <div className="menu-wrapper">
                <div className="logo-menu-container">
                  <div id="logo">
                    {/* <div
                      style={{
                        position: "absolute",
                        fontFamily: "Caesar Dressing",
                        fontSize: ".8rem",
                        bottom: "0",
                        left: "31%",
                        top: "5%",
                        color: "#debc88",
                      }}
                    >
                      {"PERPETUUM"}
                    </div>
                    <Image
                      src="/NEWRL80.png"
                      alt="Logo"
                      width={180}
                      height={180}
                      priority
                    />
                    <div
                      style={{
                        position: "absolute",
                        fontFamily: "Caesar Dressing",
                        fontSize: ".8rem",
                        bottom: "0",
                        left: "18%",
                        color: "#debc88",
                        transform: "rotate(20deg)",
                      }}
                    >
                      {"LUCRUM "}
                    </div>
                    <div
                      style={{
                        position: "absolute",
                        fontFamily: "Caesar Dressing",
                        fontSize: ".8rem",
                        bottom: "0",
                        right: "16%",
                        color: "#debc88",
                        transform: "rotate(-20deg)",
                      }}
                    >
                      {" GAUDIUM"}
                    </div> */}
                    <RotatingBadge2 />
                  </div>
                </div>
                <div ref={node}>
                  <Menu
                    isOpen={menuOpen}
                    onStateChange={({ isOpen }) => setMenuOpen(isOpen)}
                    width={menuWidth}
                  >
                    <Link
                      href="/home"
                      className="menu-item"
                      onClick={closeMenu}
                    >
                      Home
                    </Link>
                    <Link
                      href="/thesis"
                      className="menu-item"
                      onClick={closeMenu}
                    >
                      Thesis
                    </Link>
                    <Link
                      href="/numerology"
                      className="menu-item"
                      onClick={closeMenu}
                    >
                      Numerology
                    </Link>
                    <Link
                      href="/gallery"
                      className="menu-item"
                      onClick={closeMenu}
                    >
                      Bless us,{" "}
                      <span style={{ fontFamily: "Oleo Script" }}>RL80</span>
                    </Link>
                    <Link
                      href="/communion"
                      className="menu-item"
                      onClick={closeMenu}
                    >
                      Communion
                    </Link>
                  </Menu>
                </div>

                <WalletButton1 />

                {isSignedIn ? (
                  <UserButton
                    afterSignOutUrl="/home"
                    style={{
                      position: "absolute",
                      top: "3rem",
                      right: "5%",
                      width: "3rem",
                      minWidth: "3rem",
                      height: "3rem",
                      zIndex: "911",
                    }}
                  />
                ) : (
                  <>
                    <button
                      id="sign-in-button"
                      onClick={handleSignInClick}
                      style={{
                        top: "3rem",
                        right: "5%",
                        position: "absolute",
                        width: "3rem",
                        minWidth: "3rem",
                        height: "3rem",
                        zIndex: "911",
                      }}
                    >
                      <span style={{ fontSize: "2.5rem" }}>{emoji}</span>
                    </button>
                  </>
                )}
              </div>
            </header>
          </div>
        </Container>
      </div>
    </>
  );
}

export default Header2;
