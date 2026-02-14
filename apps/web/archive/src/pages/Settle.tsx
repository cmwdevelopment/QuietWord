import { useNavigate, useParams } from "react-router-dom";
import { PrimaryButton } from "../components/PrimaryButton";

export default function Settle() {
  const navigate = useNavigate();
  const { section = "john" } = useParams();

  return (
    <section className="stack">
      <h1>Settle in</h1>
      <p>You are not behind. You are here.</p>
      <p>Breathe, receive, and move one passage at a time.</p>
      <PrimaryButton onClick={() => navigate(`/reader/${section}`)}>Start</PrimaryButton>
    </section>
  );
}
