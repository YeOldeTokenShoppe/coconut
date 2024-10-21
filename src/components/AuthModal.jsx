// import React, { useEffect, useState } from "react";
// import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
// import { db, storage } from "../utilities/firebaseClient"; // Ensure storage is initialized in firebaseClient
// import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
// import { useRouter } from "next/router";
// import { useActiveAccount } from "thirdweb/react";

// export default function AuthModal({ isOpen, onClose, onSignIn, redirectTo }) {
//   const [username, setUsername] = useState("");
//   const [avatarFile, setAvatarFile] = useState(null);
//   const [avatarUrl, setAvatarUrl] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const router = useRouter();
//   const activeAccount = useActiveAccount();

//   useEffect(() => {
//     if (!isOpen) {
//       setUsername("");
//       setAvatarFile(null);
//       setAvatarUrl("");
//       setLoading(false);
//       setError("");
//     }
//   }, [isOpen]);

//   // Handle file input change
//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     setAvatarFile(file);
//   };

//   // Save or update user profile in Firestore
//   const saveUserProfile = async (user) => {
//     setLoading(true);
//     setError("");

//     try {
//       let uploadedAvatarUrl = avatarUrl;

//       // If a file was uploaded, handle the upload to Firebase Storage
//       if (avatarFile) {
//         const avatarRef = ref(storage, `avatars/${user.walletAddress}`);
//         await uploadBytes(avatarRef, avatarFile);
//         uploadedAvatarUrl = await getDownloadURL(avatarRef);
//       }

//       const userDocRef = doc(db, "users", user.walletAddress);
//       const userDoc = await getDoc(userDocRef);

//       if (!userDoc.exists()) {
//         // Save new user profile if it doesn't exist
//         await setDoc(userDocRef, {
//           username: username || "Anonymous",
//           avatarUrl: uploadedAvatarUrl || "/defaultAvatar.png",
//         });
//       } else {
//         // Update existing user profile if they are changing avatar or username
//         await updateDoc(userDocRef, {
//           username: username || userDoc.data().username || "Anonymous",
//           avatarUrl: uploadedAvatarUrl || userDoc.data().avatarUrl,
//         });
//       }

//       onSignIn(user); // Pass user back to the parent component
//       onClose();
//       router.push(redirectTo || "/home");
//     } catch (error) {
//       console.error("Error saving user profile:", error);
//       setError("Failed to save profile. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSave = () => {
//     if (activeAccount && activeAccount.address) {
//       const user = { walletAddress: activeAccount.address }; // Use actual connected user wallet address
//       saveUserProfile(user);
//     } else {
//       alert("No connected account detected. Please connect your wallet.");
//     }
//   };

//   return isOpen ? (
//     <div className="modal">
//       <div
//         className="modal-content"
//         style={{
//           backgroundColor: "#f0f0f0",
//           padding: "20px",
//           borderRadius: "8px",
//           color: "black",
//         }}
//       >
//         <button
//           className="close-button"
//           onClick={onClose}
//           style={{ color: "black", fontSize: "1.5rem" }}
//         >
//           &times;
//         </button>
//         {error && <p style={{ color: "red", marginBottom: "10px" }}>{error}</p>}
//         <input
//           type="text"
//           placeholder="Enter your username"
//           value={username}
//           onChange={(e) => setUsername(e.target.value)}
//           style={{
//             color: "black",
//             padding: "10px",
//             marginBottom: "10px",
//             width: "100%",
//           }}
//         />
//         <input
//           type="file"
//           accept="image/*"
//           onChange={handleFileChange}
//           style={{
//             color: "black",
//             padding: "10px",
//             marginBottom: "10px",
//             width: "100%",
//           }}
//         />
//         <button
//           onClick={handleSave}
//           style={{
//             padding: "10px",
//             backgroundColor: "goldenrod",
//             border: "none",
//             color: "black",
//           }}
//           disabled={loading}
//         >
//           {loading ? "Saving..." : "Save Profile"}
//         </button>
//       </div>
//     </div>
//   ) : null;
// }
