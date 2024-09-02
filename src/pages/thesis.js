// pages/thesis.js
import Thesis from "../components/Thesis";
import NavBar from "../components/NavBar.client";
import Communion from "../components/Communion";
export default function ThesisPage() {
  return (
    <>
      <Thesis />

      <div style={{ paddingTop: "5rem" }}>
        <NavBar />
      </div>
      <Communion />
    </>
  );
}
