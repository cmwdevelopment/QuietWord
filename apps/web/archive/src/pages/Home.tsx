import { Link, useNavigate } from "react-router-dom";
import { PrimaryButton } from "../components/PrimaryButton";
import { api } from "../lib/api";
import { useAppState } from "../lib/appState";

export default function Home() {
  const { bootstrap, refresh } = useAppState();
  const navigate = useNavigate();

  if (!bootstrap) {
    return null;
  }

  async function completeDay() {
    await api.completeDay();
    await refresh();
  }

  async function answerRecall(choiceIndex: number) {
    if (!bootstrap.pendingRecall) return;
    await api.answerRecall(bootstrap.pendingRecall.recallId, choiceIndex);
    await refresh();
  }

  return (
    <section className="stack">
      <h1>QuietWord</h1>
      <p>Built for busy minds.</p>
      <article className="card stack">
        <h2>Today's reading</h2>
        <p>Day {bootstrap.today.dayIndex}: {bootstrap.today.theme}</p>
        <p>{bootstrap.today.johnRef} + {bootstrap.today.psalmRef}</p>
        <div className="row">
          <Link to="/settle/john"><PrimaryButton>Read John</PrimaryButton></Link>
          <Link to="/settle/psalm"><button className="ghost-button">Read Psalm</button></Link>
        </div>
      </article>

      {bootstrap.resume && (
        <article className="card stack">
          <h3>Resume where you left off</h3>
          <p>{bootstrap.resume.section.toUpperCase()} at {bootstrap.resume.lastRef}</p>
          <PrimaryButton onClick={() => navigate(`/reader/${bootstrap.resume?.section}`)}>Resume reading</PrimaryButton>
        </article>
      )}

      <article className="card stack">
        <h3>Quick recap</h3>
        <p>{bootstrap.today.graceStreak ? "You missed a day, but grace keeps you moving." : "You are in rhythm today."}</p>
        <p>Grace streak: {bootstrap.today.streak} day(s)</p>
      </article>

      {bootstrap.pendingRecall && (
        <article className="card stack">
          <h3>Yesterday in one sentence. Pick one.</h3>
          {bootstrap.pendingRecall.choices.map((choice, index) => (
            <button className="ghost-button" key={choice} onClick={() => void answerRecall(index)}>
              {choice}
            </button>
          ))}
        </article>
      )}

      <div className="row">
        <PrimaryButton onClick={() => void completeDay()}>Complete day</PrimaryButton>
        <Link to="/onboarding"><button className="ghost-button">Onboarding</button></Link>
      </div>
    </section>
  );
}
