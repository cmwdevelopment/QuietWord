// ChunkPager - Modern navigation control for passage chunks

import React from "react";
import { PrimaryButton } from "./PrimaryButton";

interface ChunkPagerProps {
  currentChunk: number;
  totalChunks: number;
  onPrevious: () => void;
  onNext: () => void;
  onComplete?: () => void; // New prop for completing the last chunk
  showNextCheckpoint?: {
    atChunk: number;
    label: string;
  };
}

export function ChunkPager({
  currentChunk,
  totalChunks,
  onPrevious,
  onNext,
  onComplete,
  showNextCheckpoint,
}: ChunkPagerProps) {
  const isFirst = currentChunk === 0;
  const isLast = currentChunk === totalChunks - 1;

  return (
    <div className="space-y-6">
      {/* Chunk indicator with modern style */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary rounded-full">
          <span className="text-sm font-medium text-foreground-muted">Chunk</span>
          <span className="text-sm font-bold text-foreground">
            {currentChunk + 1}
          </span>
          <span className="text-sm text-foreground-subtle">/</span>
          <span className="text-sm text-foreground-subtle">{totalChunks}</span>
        </div>

        {/* Next checkpoint indicator with modern badge */}
        {showNextCheckpoint && currentChunk < showNextCheckpoint.atChunk && (
          <div className="flex items-center justify-center gap-2 text-xs text-foreground-subtle">
            <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              {showNextCheckpoint.label} at chunk {showNextCheckpoint.atChunk + 1}
            </span>
          </div>
        )}
      </div>

      {/* Navigation buttons with modern layout */}
      <div className="flex gap-3">
        <PrimaryButton
          onClick={onPrevious}
          disabled={isFirst}
          variant="secondary"
          fullWidth
        >
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Previous</span>
          </div>
        </PrimaryButton>
        {isLast ? (
          <PrimaryButton
            onClick={onComplete}
            variant="primary"
            fullWidth
          >
            <div className="flex items-center gap-2">
              <span>Complete</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </PrimaryButton>
        ) : (
          <PrimaryButton
            onClick={onNext}
            variant="primary"
            fullWidth
          >
            <div className="flex items-center gap-2">
              <span>Next</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </PrimaryButton>
        )}
      </div>

      {/* Keyboard shortcuts hint */}
      <p className="text-xs text-center text-foreground-subtle">
        Use <kbd className="px-2 py-1 bg-secondary rounded text-foreground-muted font-mono text-xs">←</kbd>{" "}
        <kbd className="px-2 py-1 bg-secondary rounded text-foreground-muted font-mono text-xs">→</kbd>{" "}
        arrow keys to navigate
      </p>
    </div>
  );
}