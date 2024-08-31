// pages/numerology.js
import Numerology from "../components/Numerology";
import NavBar from "../components/NavBar.client";

export default function NumerologyPage() {
  return (
    <>
      <Numerology />
      <div style={{ marginTop: "3rem" }}>
        <NavBar />
      </div>
    </>
  );
}
