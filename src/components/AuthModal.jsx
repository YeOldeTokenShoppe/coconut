import React, { useEffect, useState } from "react";
import { initializeFirebaseUI } from "../utilities/firebaseClient";
import {
  TwitterAuthProvider,
  EmailAuthProvider,
  OAuthProvider,
} from "firebase/auth";
import { useRouter } from "next/router";

export default function AuthModal({
  isOpen,
  onClose,
  onSignInSuccess, // Optional prop
  redirectTo,
}) {
  const [ui, setUi] = useState(null);
  const router = useRouter();

  // Initialize Firebase UI for Twitter, Email, and Discord
  useEffect(() => {
    if (isOpen && typeof window !== "undefined") {
      const uiInstance = initializeFirebaseUI();
      setUi(uiInstance);
    }
  }, [isOpen]);

  // Handle Firebase UI sign-ins
  useEffect(() => {
    if (ui && isOpen) {
      ui.start("#firebaseui-auth-container", {
        signInFlow: "popup",
        signInOptions: [
          {
            provider: "oidc.discord", // Your OIDC provider ID set in Firebase console
            providerName: "Discord", // Custom label for the button
            buttonColor: "#7289DA", // Discord's brand color (or any color you prefer)
            iconUrl: "https://cdn.worldvectorlogo.com/logos/discord-6.svg", // Discord logo or your own icon URL
            customParameters: {
              prompt: "consent", // Optional custom parameters if needed
            },
          },
          TwitterAuthProvider.PROVIDER_ID,
          EmailAuthProvider.PROVIDER_ID,
        ],
        callbacks: {
          signInSuccessWithAuthResult: function (authResult) {
            const user = authResult.user;

            if (onSignInSuccess) {
              onSignInSuccess();
            } else {
              onClose(); // Close the modal
              router.push(redirectTo || "/home"); // Default redirection
            }

            return false; // Prevent the default redirect
          },
        },
      });
    }

    return () => {
      if (ui) {
        ui.reset();
      }
    };
  }, [ui, isOpen, onClose, onSignInSuccess, redirectTo, router]);

  return isOpen ? (
    <div className="modal" style={{ zIndex: "1000" }}>
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        {/* FirebaseUI Auth container */}
        <div id="firebaseui-auth-container"></div>
      </div>
    </div>
  ) : null;
}
