// "use client";

// import React, { useEffect, useRef } from "react";

// const StarComponent2 = ({ children }) => {
//   const starRef = useRef(null);

//   useEffect(() => {
//     const updatePositions = () => {
//       const elements = starRef.current.querySelectorAll(".star-badge__char");
//       const count = elements.length;
//       const radius = starRef.current.offsetWidth / 1.4; // More intuitive calculation
//       const angleOffset = 360 / count;

//       elements.forEach((elem, i) => {
//         const angle = i * angleOffset;
//         const x = radius * Math.cos((angle * Math.PI) / 180);
//         const y = radius * Math.sin((angle * Math.PI) / 180);

//         elem.style.transform = `translate(${x}px, ${y}px) rotate(${angle}deg)`;
//       });
//     };

//     updatePositions();
//     window.addEventListener("resize", updatePositions); // Update on window resize

//     return () => window.removeEventListener("resize", updatePositions); // Cleanup on unmount
//   }, []);

//   return (
//     <div className="star-badge">
//       <div className="rotating-stars" ref={starRef}>
//         {[...Array(8)].map((_, i) => (
//           <span className="star-badge__char" key={i}></span>
//         ))}
//       </div>
//       <div className="content-wrapper">{children}</div>
//     </div>
//   );
// };

// export default StarComponent2;
