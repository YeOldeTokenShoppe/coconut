// "use client";
// import React, { useState, useEffect, useRef } from "react";
// import { slide as Menu } from "react-burger-menu";
// import Link from "next/link";
// import Image from "next/image";
// import { Container, Button, Tooltip } from "@chakra-ui/react";
// import RotatingBadge2 from "./RotatingBadge2";
// import dynamic from "next/dynamic";
// import styled from "styled-components";
// import { useRouter } from "next/router";

// function Header3({ style }) {
//   const [isLogoLoaded, setIsLogoLoaded] = useState(false);

//   const [menuOpen, setMenuOpen] = useState(false);

//   const closeMenu = () => setMenuOpen(false);
//   const node = useRef();

//   const toggleMenu = (event) => {
//     event.stopPropagation();
//     setMenuOpen(!menuOpen);
//   };

//   useEffect(() => {
//     // Function to handle outside click
//     const handleClickOutside = (e) => {
//       if (node.current.contains(e.target)) {
//         // Inside click
//         return;
//       }
//       // Outside click
//       closeMenu();
//     };

//     // Bind the event listener
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       // Unbind the event listener on clean up
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [node]);

//   const [menuWidth, setMenuWidth] = useState("30%");
//   useEffect(() => {
//     const handleResize = () => {
//       if (window.innerWidth <= 760) {
//         setMenuWidth("100%");
//       } else {
//         setMenuWidth("35%");
//       }
//     };

//     // Attach the event listener
//     window.addEventListener("resize", handleResize);

//     // Call handleResize once to set the initial menu width
//     handleResize();

//     // Clean up the event listener when the component unmounts
//     return () => {
//       window.removeEventListener("resize", handleResize);
//     };
//   }, []);

//   useEffect(() => {
//     const logoImage = new window.Image();
//     logoImage.src = "/NEWRL80.png";
//     logoImage.onload = () => setIsLogoLoaded(true);
//   }, []);

//   return (
//     <>
//       <div style={style}>
//         <Container
//           className="header"
//           maxW={"1200px"}
//           mb={{ base: "200px", sm: "100px", md: "125px" }}
//           style={{ position: "relative" }}
//         >
//           <div ref={node}>
//             <Menu
//               isOpen={menuOpen}
//               onStateChange={({ isOpen }) => setMenuOpen(isOpen)}
//               width={menuWidth}
//             >
//               <Link href="/home" className="menu-item" onClick={closeMenu}>
//                 Home
//               </Link>
//               <Link href="#" className="menu-item" s onClick={closeMenu}>
//                 Thesis
//               </Link>
//               <Link
//                 href="/numerology"
//                 className="menu-item"
//                 onClick={closeMenu}
//               >
//                 Numerology
//               </Link>
//               <Link href="/gallery" className="menu-item" onClick={closeMenu}>
//                 Bless us,{" "}
//                 <span style={{ fontFamily: "Oleo Script" }}>{"RL80 "}</span>
//               </Link>
//               {/* <Link href="./carnival" className="menu-item" onClick={closeMenu}>
//                 L80 LucK
//               </Link> */}
//               <Link href="/communion" className="menu-item" onClick={closeMenu}>
//                 Communion
//               </Link>
//             </Menu>
//           </div>
//           <div className="section">
//             <header id="header3">
//               <div className="menu-wrapper">
//                 <div className="logo-menu-container">
//                   <div
//                     id="logo1"
//                     style={{
//                       borderLeft: "thick solid black",
//                       borderRight: "thick solid black",
//                     }}
//                   >
//                     <RotatingBadge2 />
//                     {/* <div
//                       style={{
//                         position: "absolute",
//                         fontFamily: "Caesar Dressing",
//                         fontSize: ".8rem",
//                         bottom: "0",
//                         left: "31%",
//                         top: "5%",
//                         color: "#debc88",
//                       }}
//                     >
//                       {"PERPETUUM"}
//                     </div>
//                     <Image
//                       src="/NEWRL80.png"
//                       height="180"
//                       width="180"
//                       alt="Logo"
//                       priority
//
//                     />
//                     <div
//                       style={{
//                         position: "absolute",
//                         fontFamily: "Caesar Dressing",
//                         fontSize: ".8rem",
//                         bottom: "0",
//                         left: "18%",
//                         color: "#debc88",
//                         transform: "rotate(20deg)",
//                       }}
//                     >
//                       {"LUCRUM "}
//                     </div>
//                     <div
//                       style={{
//                         position: "absolute",
//                         fontFamily: "Caesar Dressing",
//                         fontSize: ".8rem",
//                         bottom: "0",
//                         right: "16%",
//                         color: "#debc88",
//                         transform: "rotate(-20deg)",
//                       }}
//                     >
//                       {" GAUDIUM"}
//                     </div> */}
//                   </div>
//                 </div>
//               </div>
//             </header>
//           </div>
//         </Container>
//       </div>
//     </>
//   );
// }

// export default Header3;
