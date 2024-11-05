// pages/numerology.js
import Numerology from "../components/Numerology";
import NavBar from "../components/NavBar.client";
import Communion from "../components/Communion";

export default function NumerologyPage() {
  return (
    <>
      <div style={{ margin: "0rem 2rem 0rem 2rem" }}>
        <Numerology />
      </div>
      <div style={{ marginTop: "5rem" }}>
        <NavBar />
      </div>
      <div style={{ marginTop: "3rem" }}>
        <Communion />
      </div>
    </>
  );
}
