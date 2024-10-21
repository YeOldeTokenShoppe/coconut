// import React, { useState } from "react";
// import { db, storage } from "../utilities/firebaseClient"; // Import storage
// import { doc, setDoc } from "firebase/firestore";
// import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Import necessary functions for storage
// import { Button, Input, Modal, Image } from "@chakra-ui/react";

// const UserProfile = ({ walletAddress, onClose }) => {
//   const [username, setUsername] = useState("");
//   const [avatar, setAvatar] = useState(null);
//   const [avatarUrl, setAvatarUrl] = useState("");

//   const handleAvatarUpload = (e) => {
//     const file = e.target.files[0];
//     setAvatar(file);
//     setAvatarUrl(URL.createObjectURL(file)); // Preview the image
//   };

//   const handleSaveProfile = async () => {
//     if (!walletAddress || !username) return;

//     try {
//       let uploadedAvatarUrl = avatarUrl;

//       // Upload the avatar to Firebase Storage if a file was uploaded
//       if (avatar) {
//         const avatarRef = ref(storage, `avatars/${walletAddress}`);
//         await uploadBytes(avatarRef, avatar);
//         uploadedAvatarUrl = await getDownloadURL(avatarRef); // Get the download URL of the uploaded avatar
//       }

//       const userDocRef = doc(db, "users", walletAddress);
//       await setDoc(
//         userDocRef,
//         { username, avatarUrl: uploadedAvatarUrl },
//         { merge: true }
//       );
//       alert("Profile saved successfully!");
//       onClose();
//     } catch (error) {
//       console.error("Error saving profile:", error);
//       alert("Failed to save profile.");
//     }
//   };

//   return (
//     <Modal isOpen={true} onClose={onClose}>
//       <div style={{ padding: "20px", color: "black" }}>
//         <h2>Set Up Your Profile</h2>
//         <Input
//           placeholder="Enter your username"
//           value={username}
//           onChange={(e) => setUsername(e.target.value)}
//           mb={4}
//           color="black"
//         />
//         <Input type="file" onChange={handleAvatarUpload} mb={4} color="black" />
//         {avatarUrl && <Image src={avatarUrl} alt="Avatar Preview" />}
//         <Button onClick={handleSaveProfile}>Save Profile</Button>
//       </div>
//     </Modal>
//   );
// };

// export default UserProfile;
