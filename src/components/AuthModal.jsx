import React, { useEffect, useState } from "react";
import { initializeFirebaseUI } from "../utilities/firebaseClient";
import { TwitterAuthProvider, EmailAuthProvider } from "firebase/auth";
import { useRouter } from "next/router";

export default function AuthModal({
  isOpen,
  onClose,
  onSignInSuccess, // Optional prop
  redirectTo,
}) {
  const [ui, setUi] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen && typeof window !== "undefined") {
      const uiInstance = initializeFirebaseUI();
      setUi(uiInstance);
    }
  }, [isOpen]);

  useEffect(() => {
    if (ui && isOpen) {
      ui.start("#firebaseui-auth-container", {
        signInFlow: "popup",
        signInOptions: [
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
    <div className="modal">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        <div id="firebaseui-auth-container"></div>
      </div>
    </div>
  ) : null;
}
