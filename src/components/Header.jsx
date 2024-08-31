"use client";

import React, { useState, useEffect, useRef } from "react";
import { slide as Menu } from "react-burger-menu";
import Link from "next/link";
import Image from "next/image";
import { Container } from "@chakra-ui/react";
import { useUser, UserButton, useClerk } from "@clerk/nextjs";
import { useActiveAccount } from "thirdweb/react";
import { useRouter } from "next/router";
import { signIntoFirebaseWithClerk } from "../utilities/firebaseClient.js";
import WalletButton1 from "../components/WalletButton1";
import { getAuth, signInWithCustomToken } from "firebase/auth";
import { useAuth } from "@clerk/nextjs";
import RotatingBadge2 from "./RotatingBadge2";
function Header() {
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
  const { getToken } = useAuth();

  const headerRef = useRef(null);

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

  const handleSignInClick = async () => {
    sessionStorage.setItem("redirectUrl", currentUrl);
    await openSignIn({
      redirectUrl: currentUrl,
    });

    // Pass getToken to the sign-in function
    await signIntoFirebaseWithClerk(getToken);
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
    if (!headerRef.current || window.innerWidth <= 550) {
      return;
    }

    const sparkle = headerRef.current; // Attach sparkle to headerRef

    const MAX_STARS = 50; // Limit to 1 star at a time
    const STAR_INTERVAL = 20; // Increase interval to reduce star frequency

    const MAX_STAR_LIFE = 3;
    const MIN_STAR_LIFE = 1;

    const MAX_STAR_SIZE = 30;
    const MIN_STAR_SIZE = 20;

    const MIN_STAR_TRAVEL_X = 100;
    const MIN_STAR_TRAVEL_Y = 100;

    const SYMBOLS = [];

    // Function to create a new star with a specific symbol
    const createStarWithSymbol = (symbol) => {
      const Star = class {
        constructor() {
          this.size = this.random(MAX_STAR_SIZE, MIN_STAR_SIZE);

          this.x = this.random(
            sparkle.offsetWidth * 0.75,
            sparkle.offsetWidth * 0.25
          );
          this.y = sparkle.offsetHeight / 2 - this.size / 2;

          this.x_dir = this.randomMinus();
          this.y_dir = this.randomMinus();

          this.x_max_travel =
            this.x_dir === -1
              ? this.x
              : sparkle.offsetWidth - this.x - this.size;
          this.y_max_travel = sparkle.offsetHeight / 2 - this.size;

          this.x_travel_dist = this.random(
            this.x_max_travel,
            MIN_STAR_TRAVEL_X
          );
          this.y_travel_dist = this.random(
            this.y_max_travel,
            MIN_STAR_TRAVEL_Y
          );

          this.x_end = this.x + this.x_travel_dist * this.x_dir;
          this.y_end = this.y + this.y_travel_dist * this.y_dir;

          this.life = this.random(MAX_STAR_LIFE, MIN_STAR_LIFE);

          this.star = document.createElement("div");
          this.star.classList.add("star");

          this.star.style.setProperty("--start-left", this.x + "px");
          this.star.style.setProperty("--start-top", this.y + "px");

          this.star.style.setProperty("--end-left", this.x_end + "px");
          this.star.style.setProperty("--end-top", this.y_end + "px");

          this.star.style.setProperty("--star-life", this.life + "s");
          this.star.style.setProperty("--star-life-num", this.life);

          this.star.style.setProperty("--star-size", this.size + "px");

          this.star.textContent = symbol; // Set the symbol for this star
        }

        draw() {
          sparkle.appendChild(this.star);
        }

        pop() {
          sparkle.removeChild(this.star);
        }

        random(max, min) {
          return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        randomRainbowColor() {
          return "hsla(" + this.random(360, 0) + ", 100%, 50%, 1)";
        }

        randomMinus() {
          return Math.random() > 0.5 ? 1 : -1;
        }
      };

      return new Star();
    };

    let current_star_count = 0;

    const intervalId = setInterval(() => {
      if (current_star_count >= MAX_STARS) {
        return;
      }

      current_star_count++;

      // Randomly select a symbol from the list
      const randomSymbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
      const newStar = createStarWithSymbol(randomSymbol);
      newStar.draw();

      setTimeout(() => {
        current_star_count--;
        newStar.pop();
      }, newStar.life * 1000);
    }, STAR_INTERVAL);

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, [headerRef]);

  const signIntoFirebaseWithClerk = async () => {
    try {
      const token = await getToken({ template: "integration_firebase" });
      console.log("Retrieved JWT token:", token);

      const userCredentials = await signInWithCustomToken(auth, token || "");
      console.log("User:", userCredentials.user);
    } catch (error) {
      console.error("Error signing in with Clerk and Firebase:", error);
    }
  };

  return (
    <>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <Container
          className="header sparkle"
          ref={headerRef}
          maxW={"1200px"}
          mb={{ base: "200px", sm: "100px", md: "125px" }}
          style={{ position: "relative" }}
        >
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

export default Header;
