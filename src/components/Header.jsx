import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { slide as Menu } from "react-burger-menu";
import { Button, Container } from "@chakra-ui/react";
import Link from "next/link";
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { createThirdwebClient } from "thirdweb";
import { inAppWallet } from "thirdweb/wallets";
import WalletButton1 from "./WalletButton1";
import Image from "next/image";
import jwt_decode from "jwt-decode";
import RotatingBadge2 from "./RotatingBadge2";

const CLIENT_ID = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;
const client = createThirdwebClient({ clientId: CLIENT_ID });

const wallets = [
  inAppWallet({
    auth: {
      options: ["x", "discord", "telegram", "farcaster", "facebook", "email"],
    },
    metadata: {
      image: {
        src: "/newheart1.png",
        width: 250,
        height: 150,
        alt: "Aperture Laboratories",
      },
    },
  }),
];

function Header() {
  const [user, setUser] = useState(null); // Store user info like avatar and username
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [emoji, setEmoji] = useState("😇");
  const node = useRef();
  const router = useRouter();
  const currentUrl = router.asPath;
  const [menuWidth, setMenuWidth] = useState("35%");
  const [mounted, setMounted] = useState(false);
  const wallet = useActiveAccount();

  // Get the connected wallet address
  const activeAccount = useActiveAccount();
  const address = activeAccount?.address;

  const closeMenu = () => setMenuOpen(false);
  const toggleMenu = (event) => {
    event.stopPropagation();
    setMenuOpen(!menuOpen);
  };
  async function fetchUserMetadata(queryBy, value) {
    const url = new URL(
      "https://embedded-wallet.thirdweb.com/api/2023-11-30/embedded-wallet/user-details"
    );

    // Set the query params based on the provided queryBy type
    url.searchParams.set("queryBy", queryBy);
    url.searchParams.set(queryBy, value);

    const response = await fetch(url.href, {
      headers: {
        Authorization: `Bearer ${process.env.THIRDWEB_CLIENT_SECRET}`, // Ensure this is server-side
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch user metadata");
    }
    return data;
  }

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

  useEffect(() => {
    const emojiInterval = setInterval(() => {
      setEmoji((prevEmoji) => (prevEmoji === "😇" ? "😈" : "😇"));
    }, 3000);

    return () => clearInterval(emojiInterval);
  }, []);

  const connectInApp = async (jwt) => {
    try {
      const wallet = inAppWallet();
      await wallet.connect({
        clientId: CLIENT_ID,
        strategy: "jwt",
        jwt,
        encryptionKey: process.env.NEXT_PUBLIC_ENCRYPTION_KEY,
      });

      // Fetch additional metadata using the wallet address
      const userMetadata = await fetchUserMetadata(
        "walletAddress",
        activeAccount.address
      );
      console.log("User metadata:", userMetadata);

      // Assuming the response includes linked social accounts
      const linkedAccount = userMetadata[0]?.linkedAccounts?.[0]?.details || {};
      const { name, picture } = linkedAccount;

      // Set user info for UI display
      setUser({
        name,
        photoURL: picture || "/default-avatar.png",
      });
    } catch (error) {
      console.error("Error connecting to wallet or fetching metadata:", error);
    }
    try {
      const decodedJWT = jwt_decode(jwt);
      console.log("Decoded JWT:", decodedJWT); // Inspect the payload here
      // Check if 'name' and 'picture' fields are present
    } catch (error) {
      console.error("Error decoding JWT:", error);
    }
  };

  useEffect(() => {
    if (address) {
      const fetchMetadata = async () => {
        try {
          const userMetadata = await fetchUserMetadata(
            "walletAddress",
            address
          );
          console.log("User metadata:", userMetadata);

          // Assuming the response includes linked social accounts
          const linkedAccount =
            userMetadata[0]?.linkedAccounts?.[0]?.details || {};
          const { name, picture } = linkedAccount;

          // Set user info for UI display
          setUser({
            name,
            photoURL: picture || "/default-avatar.png",
          });
        } catch (error) {
          console.error("Error fetching user metadata:", error);
        }
      };

      fetchMetadata();
    }
  }, [address]);

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
                  <Link href="/home" passHref>
                    <div id="logo">
                      <img
                        className="logo"
                        src="./newheart1.png"
                        width="10rem"
                        height="10rem"
                        alt=""
                        style={{ zIndex: "1" }}
                        // objectFit={"contain"}
                      />
                      <RotatingBadge2 />
                    </div>
                  </Link>
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
                      Candelarium
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

                {user ? (
                  <Button
                    onClick={() => setUser(null)} // Sign-out functionality
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
                    <Image
                      id="user-avatar"
                      src={user.photoURL} // Use the fetched user profile image
                      alt="User Avatar"
                      layout="fill"
                      objectFit="cover"
                    />
                  </Button>
                ) : (
                  <ConnectButton
                    client={client}
                    wallets={wallets}
                    connectModal={{
                      size: "compact",
                      onSignInSuccess: async (jwt) => {
                        await connectInApp(jwt);
                      },
                      termsOfServiceUrl:
                        "https://app.termly.io/policy-viewer/policy.html?policyUUID=350b7b1c-556c-490e-b0ee-a07f5b52be86",
                    }}
                    connectButton={{
                      label: "💔",
                      id: "wallet-button",
                      style: {
                        fontSize: "2.5rem",
                        objectFit: "cover",
                        layout: "fill",
                        right: "5%",
                        border: "3px solid goldenrod",
                        background: "#444",
                        position: "absolute",
                        width: "3rem",
                        height: "3rem",
                        minWidth: "3rem",
                        top: "3rem",
                        right: "5%",
                        zIndex: "911",
                      },
                    }}
                    detailsButton={{
                      connectedAccountAvatarUrl: user
                        ? user.photoURL
                        : "/default-avatar.png", // Use the user's avatar or fallback
                      connectedAccountName: user ? user.name : "Anonymous", //
                    }}
                  ></ConnectButton>
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
