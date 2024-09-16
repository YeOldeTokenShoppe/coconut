import { createThirdwebClient } from "thirdweb";
import { ConnectButton } from "thirdweb/react";
import { inAppWallet } from "thirdweb/wallets";
import { useState } from "react";

const client = createThirdwebClient({
  clientId: "YOUR_CLIENT_ID", // Use your actual Thirdweb clientId here
});

const wallets = [
  inAppWallet({
    auth: {
      options: ["discord", "telegram", "farcaster", "email", "x", "facebook"],
    },
  }),
];

function AuthModal({ isOpen, onClose }) {
  const [userInfo, setUserInfo] = useState(null);

  const handlePostLogin = async (jwt) => {
    const decodedJWT = jwt.decode(jwt); // Decode JWT to inspect the user data
    console.log("Decoded JWT claims:", decodedJWT);

    // You can now access userInfo such as username and avatar
    const { name, picture } = decodedJWT;
    setUserInfo({ name, picture }); // Store it in your state or Firebase
  };

  return isOpen ? (
    <div className="modal" style={{ zIndex: "1000" }}>
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        <ConnectButton
          client={client}
          wallets={wallets}
          connectModal={{
            size: "compact",
            termsOfServiceUrl:
              "https://app.termly.io/policy-viewer/policy.html?policyUUID=350b7b1c-556c-490e-b0ee-a07f5b52be86",
          }}
        />
        {userInfo && (
          <div>
            <p>Username: {userInfo.name}</p>
            <img src={userInfo.picture} alt="User Avatar" />
          </div>
        )}
      </div>
    </div>
  ) : null;
}

export default AuthModal;
