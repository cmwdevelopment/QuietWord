import type { PassageChunk } from "../lib/types";
import { PrimaryButton } from "./PrimaryButton";

interface ChunkPagerProps {
  chunks: PassageChunk[];
  currentIndex: number;
  onPrev: () => void;
  onNext: () => void;
}

export function ChunkPager({ chunks, currentIndex, onPrev, onNext }: ChunkPagerProps) {
  const current = chunks[currentIndex];

  return (
    <section className="card">
      <p className="caption">Chunk {currentIndex + 1} of {chunks.length}</p>
      <h2>{current?.verseRefs.join(", ")}</h2>
      <p>{current?.text}</p>
      <div className="row">
        <button className="ghost-button" onClick={onPrev} disabled={currentIndex === 0}>
          Back
        </button>
        <PrimaryButton onClick={onNext} disabled={currentIndex === chunks.length - 1}>
          Next
        </PrimaryButton>
      </div>
    </section>
  );
}
