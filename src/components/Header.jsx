import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth"; // Ensure you're importing these correctly
import { slide as Menu } from "react-burger-menu";
import { Button, Container } from "@chakra-ui/react";
import Link from "next/link";
import WalletButton1 from "../components/WalletButton1";
import RotatingBadge2 from "./RotatingBadge2";
import AuthModal from "./AuthModal";
import Image from "next/image";

function Header() {
  const [user, setUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [emoji, setEmoji] = useState("😇");
  const node = useRef();
  const router = useRouter();
  const currentUrl = router.asPath;
  const [menuWidth, setMenuWidth] = useState("35%");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignIn = ({ username, photoURL }) => {
    setUser({ username, photoURL });
    console.log("User signed in:", username, photoURL);
  };

  const closeMenu = () => setMenuOpen(false);

  const toggleMenu = (event) => {
    event.stopPropagation();
    setMenuOpen(!menuOpen);
  };

  useEffect(() => {
    const auth = getAuth(); // Correctly get the auth instance
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const handleSignOut = async () => {
    try {
      const auth = getAuth(); // Correctly get the auth instance
      await signOut(auth); // Use signOut with the auth instance
      router.push("/home"); // Redirect to home after sign out
    } catch (error) {
      console.error("Error signing out:", error);
    }
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

  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== "undefined") {
        if (window.innerWidth <= 760) {
          setMenuWidth("100%");
        } else {
          setMenuWidth("35%");
        }
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResize);
      handleResize();
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", handleResize);
      }
    };
  }, []);

  return (
    <>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <Container
          className="header"
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
                    <img
                      className="logo"
                      src="./NEWRL80.png"
                      width="60"
                      height="60"
                      alt=""
                      style={{ zIndex: "-1" }}
                    />
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

                {user ? (
                  <Button
                    id="sign-out-button"
                    onClick={handleSignOut}
                    style={{
                      position: "absolute",
                      width: "3rem",
                      height: "3rem",
                      top: "3rem",
                      right: "5%",
                      minWidth: "3rem",
                      zIndex: "911",
                    }}
                  >
                    {" "}
                    <Image
                      id="user-avatar"
                      src={user.photoURL}
                      // src={user.imageUrl || "🥸"}
                      alt="User Avatar"
                      layout="fill"
                      objectFit="cover"
                    />
                  </Button>
                ) : (
                  <Button
                    id="sign-in-button"
                    onClick={openAuthModal}
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
                  </Button>
                )}
              </div>
            </header>
          </div>
        </Container>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        onSignIn={handleSignIn}
        redirectTo={currentUrl} // Pass the current URL to AuthModal for proper redirection
      />
    </>
  );
}

export default Header;
