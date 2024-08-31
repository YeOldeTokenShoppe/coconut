import React, { useState } from "react";

const Carousel = ({ images }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageClick = (image) => {
    if (selectedImage === image) {
      setSelectedImage(null);
    } else {
      setSelectedImage(image);
    }
  };

  return (
    <div className="carousel-container">
      <header>{/* <h1>Carousel</h1> */}</header>
      <main>
        <div
          id="carousel"
          style={{
            "--rotation-time": "30s",
            "--elements": images.length,
            animationPlayState: isHovered ? "paused" : "running",
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {images.map((image, index) => (
            <div
              className="element"
              style={{ "--item": index + 1 }}
              data-item={index + 1}
              key={index}
            >
              <div
                className="horse"
                style={{ backgroundImage: `url(${image.src})` }}
                onClick={() => handleImageClick(image)}
              ></div>
            </div>
          ))}
        </div>
        <div
          style={{
            position: "relative",
            top: "2rem",
            height: "100px",
            width: "120px",
          }}
        >
          {selectedImage ? (
            <div
              style={{
                backgroundColor: "pink",
                border: "2px solid goldenrod",
              }}
            >
              <h5 style={{ lineHeight: "1" }}>{selectedImage.title}</h5>
              <img
                src={selectedImage.src}
                alt={selectedImage.title}
                style={{ width: "100px", height: "100px" }}
              />
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
};

export default Carousel;
