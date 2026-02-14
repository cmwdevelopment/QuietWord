import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Checkpoint } from "../components/Checkpoint";
import { ChunkPager } from "../components/ChunkPager";
import { PrimaryButton } from "../components/PrimaryButton";
import { api } from "../lib/api";
import { useAppState } from "../lib/appState";
import type { PassageResponse, ReadingSection } from "../lib/types";

const johnCheckpoints = [
  {
    question: "Checkpoint: What stood out right now?",
    options: ["A phrase of comfort", "A call to trust", "A question to carry"]
  },
  {
    question: "Checkpoint: Your next small step?",
    options: ["Pause and pray", "Write one note", "Share one line"]
  }
];

const psalmPrompt = {
  question: "Response prompt: How will you respond?",
  options: ["I will rest", "I will repent", "I will rejoice"]
};

export default function Reader() {
  const { section = "john" } = useParams();
  const navigate = useNavigate();
  const typedSection = (section === "psalm" ? "psalm" : "john") as ReadingSection;
  const { bootstrap, refresh } = useAppState();

  const [passage, setPassage] = useState<PassageResponse>();
  const [chunkIndex, setChunkIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const ref = useMemo(() => {
    if (!bootstrap) return "";
    return typedSection === "john" ? bootstrap.today.johnRef : bootstrap.today.psalmRef;
  }, [bootstrap, typedSection]);

  useEffect(() => {
    async function load() {
      if (!bootstrap || !ref) return;
      setLoading(true);
      try {
        const response = await api.passage(ref, bootstrap.settings.translation);
        setPassage(response);

        const shouldResume = bootstrap.resume?.section === typedSection && bootstrap.resume.lastRef === ref;
        setChunkIndex(shouldResume ? Math.min(bootstrap.resume?.lastChunkIndex ?? 0, Math.max(0, response.chunks.length - 1)) : 0);
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [bootstrap, ref, typedSection]);

  useEffect(() => {
    async function persistResume() {
      if (!passage || !passage.chunks[chunkIndex]) return;
      await api.saveResume({
        section: typedSection,
        ref,
        chunkIndex,
        verseAnchor: passage.chunks[chunkIndex].verseRefs[0]
      });
      await refresh();
    }

    void persistResume();
  }, [chunkIndex]);

  if (!bootstrap || loading || !passage) {
    return <section className="stack"><p>Loading passage...</p></section>;
  }

  const totalChunks = passage.chunks.length;
  const midpointChunkIndex = Math.max(1, Math.floor((totalChunks - 1) / 2));
  const isLastChunk = chunkIndex === totalChunks - 1;
  const showJohnCheckpoint1 = typedSection === "john" && chunkIndex >= midpointChunkIndex;
  const showJohnCheckpoint2 = typedSection === "john" && isLastChunk;
  const showPsalmPrompt = typedSection === "psalm" && isLastChunk;

  function onCheckpoint(choice: string) {
    setMessage(`Saved: ${choice}`);
  }

  async function completeDay() {
    await api.completeDay();
    await refresh();
    navigate("/");
  }

  return (
    <section className="stack">
      <div className="row">
        <Link to="/" className="ghost-button">Home</Link>
        <p className="caption">Home / {typedSection === "john" ? "John Reader" : "Psalm Reader"}</p>
      </div>
      <h1>{typedSection === "john" ? "John Reader" : "Psalm Reader"}</h1>
      <p>{passage.ref} ({passage.translation})</p>

      <ChunkPager
        chunks={passage.chunks}
        currentIndex={chunkIndex}
        onPrev={() => setChunkIndex((prev) => Math.max(0, prev - 1))}
        onNext={() => setChunkIndex((prev) => Math.min(passage.chunks.length - 1, prev + 1))}
      />

      {!isLastChunk && typedSection === "john" && (
        <p className="caption">
          Checkpoint 1 appears at chunk {midpointChunkIndex + 1}. Checkpoint 2 appears at the final chunk.
        </p>
      )}

      {!isLastChunk && typedSection === "psalm" && (
        <p className="caption">Response prompt appears when you reach the final chunk.</p>
      )}

      {typedSection === "john" && showJohnCheckpoint1 && (
        <Checkpoint {...johnCheckpoints[0]} onChoose={onCheckpoint} />
      )}

      {typedSection === "john" && showJohnCheckpoint2 && (
        <Checkpoint {...johnCheckpoints[1]} onChoose={onCheckpoint} />
      )}

      {showPsalmPrompt && (
        <Checkpoint {...psalmPrompt} onChoose={onCheckpoint} />
      )}

      {isLastChunk && (
        <section className="card stack">
          <h3>Section complete</h3>
          <p>
            You have finished this section for today. Continue with the other section, then mark the day complete.
          </p>
          <div className="row">
            <PrimaryButton onClick={() => navigate("/")}>Back to Home</PrimaryButton>
            <button className="ghost-button" onClick={() => void completeDay()}>Complete day now</button>
          </div>
        </section>
      )}

      {message && <p className="caption">{message}</p>}
      <Link to="/notes" className="caption">Open thread notes</Link>
    </section>
  );
}
