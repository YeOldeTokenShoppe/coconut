export const getCroppedImg = (imageSrc, crop) => {
  const image = new Image();

  // Set crossOrigin to allow Firebase Storage to serve images with CORS headers
  image.crossOrigin = "anonymous";
  image.src = imageSrc;

  return new Promise((resolve, reject) => {
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      canvas.width = crop.width;
      canvas.height = crop.height;

      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height
      );

      // Convert the canvas to a data URL
      const dataUrl = canvas.toDataURL("image/jpeg"); // Change format as needed
      resolve(dataUrl);
    };
    image.onerror = (error) => reject(error);
  });
};
