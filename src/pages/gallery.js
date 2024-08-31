// pages/gallery.js
import BurnGallery from "../components/BurnGallery";
import NavBar from "../components/NavBar.client";
import BurnModal from "../components/BurnModal";
import Communion from "../components/Communion";

export default function GalleryPage() {
  return (
    <>
      <BurnGallery />
      <BurnModal />

      <div style={{ marginTop: "2rem" }}>
        <NavBar />
      </div>
      <div style={{ marginTop: "3rem" }}>
        <Communion />
      </div>
    </>
  );
}
