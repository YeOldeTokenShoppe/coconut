import React, { useEffect, useState } from "react";
import { initializeFirebaseUI } from "../utilities/firebaseClient";
import { TwitterAuthProvider, EmailAuthProvider } from "firebase/auth";

export default function AuthModal({ isOpen, onClose, onSignIn }) {
  const [ui, setUi] = useState(null);

  useEffect(() => {
    if (isOpen && typeof window !== "undefined") {
      const uiInstance = initializeFirebaseUI();
      setUi(uiInstance);
    }
  }, [isOpen]);

  useEffect(() => {
    if (ui && isOpen) {
      ui.start("#firebaseui-auth-container", {
        signInFlow: "popup", // Ensure popup mode is enabled
        signInSuccessUrl: "/home",
        signInOptions: [
          {
            provider: TwitterAuthProvider.PROVIDER_ID,
            clientId: "SjJGVG1vSllFSnlBVzd1YzZHQXY6MTpjaQ",
          },
          EmailAuthProvider.PROVIDER_ID,
        ],
        callbacks: {
          signInSuccessWithAuthResult: function (authResult) {
            const user = authResult.user;

            // Extract username and photo URL
            const username = user.displayName;
            const photoURL = user.photoURL;

            // Call the onSignIn callback with the user info
            if (onSignIn) {
              onSignIn({ username, photoURL });
            }

            onClose(); // Close the modal on successful sign-in
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
  }, [ui, isOpen, onClose, onSignIn]);

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
