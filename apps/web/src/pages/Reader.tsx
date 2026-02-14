// Reader page - main reading experience

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { motion } from "motion/react";
import { api } from "../lib/api";
import type { Passage, BootstrapData, NoteType, Translation } from "../lib/types";
import { PrimaryButton } from "../components/PrimaryButton";
import { ChunkPager } from "../components/ChunkPager";
import { Checkpoint } from "../components/Checkpoint";
import { LoadingSpinner } from "../components/LoadingSpinner";

export function Reader() {
  const navigate = useNavigate();
  const { section } = useParams<{ section: string }>();

  const [bootstrap, setBootstrap] = useState<BootstrapData | null>(null);
  const [passage, setPassage] = useState<Passage | null>(null);
  const [comparePassage, setComparePassage] = useState<Passage | null>(null);
  const [compareTranslation, setCompareTranslation] = useState<Translation | "">("");
  const [isLoadingCompare, setIsLoadingCompare] = useState(false);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [showCheckpoint, setShowCheckpoint] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sectionName = section === "john" ? "John" : "Psalm";
  const sectionDisplay = section === "john" ? "Gospel of John" : "Psalm";

  const todayRef = useMemo(() => {
    if (!bootstrap) return "";
    return section === "john" ? bootstrap.today.johnRef : bootstrap.today.psalmRef;
  }, [bootstrap, section]);

  useEffect(() => {
    void loadData();
  }, [section]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (showCheckpoint || isComplete) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === "ArrowRight") {
        e.preventDefault();
        if (passage && currentChunkIndex === passage.chunks.length - 1) {
          handleComplete();
        } else if (passage && currentChunkIndex < passage.chunks.length - 1) {
          void handleNext();
        }
      } else if (e.key === "ArrowLeft" && currentChunkIndex > 0) {
        e.preventDefault();
        void handlePrevious();
      } else if (e.key === "Escape") {
        e.preventDefault();
        navigate("/");
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentChunkIndex, passage, showCheckpoint, isComplete]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    setComparePassage(null);
    setCompareTranslation("");

    try {
      const bootstrapData = await api.bootstrap();
      setBootstrap(bootstrapData);

      const ref = section === "john" ? bootstrapData.today.johnRef : bootstrapData.today.psalmRef;
      const passageData = await api.getPassage(ref, bootstrapData.settings.translation);
      setPassage(passageData);

      if (
        bootstrapData.resume &&
        bootstrapData.resume.section === sectionName &&
        bootstrapData.resume.lastRef === ref
      ) {
        setCurrentChunkIndex(bootstrapData.resume.lastChunkIndex);
      } else {
        setCurrentChunkIndex(0);
      }

      setIsComplete(false);
      setShowCheckpoint(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load passage");
      toast.error("Failed to load passage");
    } finally {
      setIsLoading(false);
    }
  };

  const loadComparePassage = async (translation: Translation | "") => {
    setCompareTranslation(translation);
    if (!translation || !todayRef) {
      setComparePassage(null);
      return;
    }

    setIsLoadingCompare(true);
    try {
      const data = await api.getPassage(todayRef, translation);
      setComparePassage(data);
    } catch {
      toast.error("Failed to load comparison translation");
      setComparePassage(null);
    } finally {
      setIsLoadingCompare(false);
    }
  };

  const saveResumeState = async (chunkIndex: number) => {
    if (!passage) return;

    try {
      await api.saveResumeState({
        section: sectionName as "John" | "Psalm",
        ref: passage.ref,
        chunkIndex,
      });
    } catch {
      // Keep reading flow uninterrupted.
    }
  };

  const handleNext = async () => {
    if (!passage) return;

    const nextIndex = currentChunkIndex + 1;
    const totalChunks = passage.chunks.length;
    const isJohn = section === "john";

    if (isJohn) {
      const midpoint = Math.floor(totalChunks / 2);
      if (nextIndex === midpoint || nextIndex === totalChunks) {
        setShowCheckpoint(true);
        return;
      }
    } else if (nextIndex === totalChunks) {
      setShowCheckpoint(true);
      return;
    }

    if (nextIndex >= totalChunks) {
      setIsComplete(true);
      return;
    }

    setCurrentChunkIndex(nextIndex);
    await saveResumeState(nextIndex);
  };

  const handleComplete = async () => {
    if (!passage) return;
    setShowCheckpoint(true);
  };

  const handlePrevious = async () => {
    const prevIndex = Math.max(0, currentChunkIndex - 1);
    setCurrentChunkIndex(prevIndex);
    await saveResumeState(prevIndex);
  };

  const handleSaveNote = async (noteType: NoteType, body: string) => {
    if (!passage) return;

    await api.createNote({
      noteType,
      ref: passage.chunks[currentChunkIndex].verseRefs[0],
      body,
    });
    toast.success("Note saved");
  };

  const handleCheckpointContinue = async () => {
    setShowCheckpoint(false);
    if (!passage) return;

    const nextIndex = currentChunkIndex + 1;
    if (nextIndex >= passage.chunks.length) {
      setIsComplete(true);
      return;
    }

    setCurrentChunkIndex(nextIndex);
    await saveResumeState(nextIndex);
  };

  const handleCompleteSection = async () => {
    if (section === "john") {
      toast.success("Gospel complete. Ready for the Psalm?");
      navigate("/settle/psalm");
      return;
    }

    try {
      await api.completeDay();
      toast.success("Day complete. Well done.");
      navigate("/");
    } catch {
      toast.error("Failed to complete day");
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading passage..." />;
  }

  if (error || !passage) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F5F5F0] to-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm text-center space-y-4">
          <p className="text-gray-600">{error || "Failed to load passage"}</p>
          <PrimaryButton onClick={loadData} fullWidth>
            Retry
          </PrimaryButton>
        </div>
      </div>
    );
  }

  const currentChunk = passage.chunks[currentChunkIndex];
  const totalChunks = passage.chunks.length;
  const isJohn = section === "john";
  const compareChunk = comparePassage?.chunks[Math.min(currentChunkIndex, Math.max(0, (comparePassage?.chunks.length ?? 1) - 1))];

  let nextCheckpoint: { atChunk: number; label: string } | undefined;
  if (isJohn) {
    const midpoint = Math.floor(totalChunks / 2);
    if (currentChunkIndex < midpoint) {
      nextCheckpoint = { atChunk: midpoint, label: "Reflection checkpoint" };
    } else if (currentChunkIndex < totalChunks - 1) {
      nextCheckpoint = { atChunk: totalChunks - 1, label: "Final checkpoint" };
    }
  } else if (currentChunkIndex < totalChunks - 1) {
    nextCheckpoint = { atChunk: totalChunks - 1, label: "Response prompt" };
  }

  const currentProgress = Math.round((currentChunkIndex / totalChunks) * 100);

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto p-6 pb-16 space-y-8">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="text-foreground-muted hover:text-foreground text-sm transition-colors flex items-center gap-2"
          >
            <span aria-hidden="true">&lt;</span>
            Home
          </button>
          <div className="text-xs text-foreground-subtle">Home / {sectionDisplay}</div>
        </div>

        <div className="sticky top-0 z-10 -mx-6 px-6 py-4 glass-strong border-b border-glass-border">
          <div className="flex items-center justify-between text-sm text-foreground-muted mb-3">
            <span className="font-medium">{sectionDisplay}</span>
            <span className="font-mono text-xs text-accent">{currentProgress}%</span>
          </div>
          <div className="h-2 bg-glass-bg rounded-full overflow-hidden border border-glass-border">
            <div
              className="h-full bg-gradient-to-r from-primary via-accent to-accent-secondary transition-all duration-500 ease-out shadow-lg"
              style={{ width: `${currentProgress}%` }}
            />
          </div>
        </div>

        {!showCheckpoint && !isComplete && (
          <div className="glass p-4 rounded-xl border border-glass-border space-y-2">
            <label className="text-xs uppercase tracking-wide text-foreground-muted">Compare translation</label>
            <div className="flex gap-2 items-center">
              <select
                value={compareTranslation}
                onChange={(e) => void loadComparePassage((e.target.value as Translation) || "")}
                className="w-full p-2 rounded-lg glass border border-glass-border bg-input-background text-foreground"
              >
                <option value="">Off</option>
                {(bootstrap?.supportedTranslations || []).filter((t) => t !== passage.translation).map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              {isLoadingCompare && <span className="text-xs text-foreground-muted">Loading...</span>}
            </div>
          </div>
        )}

        {showCheckpoint ? (
          <Checkpoint
            type={isJohn ? "reflection" : "response"}
            currentRef={currentChunk.verseRefs[0]}
            onSave={handleSaveNote}
            onContinue={handleCheckpointContinue}
          />
        ) : isComplete ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl mx-auto"
          >
            <div className="glass-strong p-12 rounded-3xl shadow-xl text-center space-y-6 relative overflow-hidden">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-primary/20 via-accent/20 to-accent-secondary/20 rounded-full blur-3xl animate-pulse" />

              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary via-accent to-accent-secondary rounded-full shadow-2xl mb-4 relative z-10">
                <svg className="w-12 h-12 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <div className="relative z-10">
                <h2 className="text-4xl font-light text-foreground">Section complete</h2>
                <p className="text-foreground-muted mt-3 text-lg">You have finished today's {sectionDisplay} reading.</p>
              </div>

              {section === "psalm" && bootstrap?.today.dailyRecap && (
                <div className="glass p-5 rounded-2xl border border-glass-border text-left relative z-10">
                  <p className="text-xs uppercase tracking-wide text-foreground-muted mb-2">Today's Wrap-Up</p>
                  <p className="text-foreground leading-relaxed">{bootstrap.today.dailyRecap}</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-2 relative z-10">
                <PrimaryButton onClick={() => navigate("/")} variant="secondary" fullWidth>
                  Back to home
                </PrimaryButton>
                <PrimaryButton onClick={handleCompleteSection} fullWidth>
                  {section === "john" ? "Continue to Psalm" : "Complete day"}
                </PrimaryButton>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-10">
            <div className="text-center space-y-3">
              <h1 className="text-2xl font-light text-foreground">{passage.ref}</h1>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary rounded-full">
                <span className="text-xs font-medium text-foreground-muted uppercase tracking-wide">{passage.translation}</span>
              </div>
            </div>

            <div className="glass-strong p-12 rounded-3xl shadow-lg relative overflow-hidden group">
              <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-accent/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              <div className="prose prose-xl max-w-none relative z-10">
                <p className="text-xl leading-loose text-foreground whitespace-pre-line">{currentChunk.text}</p>
              </div>
            </div>

            {compareTranslation && compareChunk && (
              <div className="glass p-8 rounded-2xl border border-glass-border space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary rounded-full">
                  <span className="text-xs font-medium text-foreground-muted uppercase tracking-wide">{compareTranslation} comparison</span>
                </div>
                <p className="text-foreground leading-relaxed whitespace-pre-line">{compareChunk.text}</p>
              </div>
            )}

            <ChunkPager
              currentChunk={currentChunkIndex}
              totalChunks={totalChunks}
              onPrevious={handlePrevious}
              onNext={handleNext}
              onComplete={handleComplete}
              showNextCheckpoint={nextCheckpoint}
            />
          </div>
        )}
      </div>
    </div>
  );
}
