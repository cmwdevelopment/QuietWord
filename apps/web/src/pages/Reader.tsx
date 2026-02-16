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
  const [isSynthesizingAudio, setIsSynthesizingAudio] = useState(false);
  const [isAudioStarting, setIsAudioStarting] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isListeningSession, setIsListeningSession] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const playAttemptRef = React.useRef(0);
  const audioUnlockedRef = React.useRef(false);
  const pendingAutoplayRef = React.useRef(false);
  const chunkAudioRef = React.useRef<Map<number, string>>(new Map());
  const prefetchTokenRef = React.useRef(0);
  const sessionIntroChunkRef = React.useRef<number | null>(null);

  const sectionName = section === "john" ? "John" : "Psalm";
  const sectionDisplay = section === "john" ? "Gospel of John" : "Psalm";

  const buildProgressStorageKey = (ref: string) => `quietword.reader.progress.${sectionName.toLowerCase()}.${ref.toLowerCase()}`;
  const readLocalProgress = (ref: string) => {
    try {
      const raw = sessionStorage.getItem(buildProgressStorageKey(ref));
      if (!raw) return null;
      const parsed = Number.parseInt(raw, 10);
      return Number.isNaN(parsed) ? null : parsed;
    } catch {
      return null;
    }
  };
  const writeLocalProgress = (ref: string, chunkIndex: number) => {
    try {
      sessionStorage.setItem(buildProgressStorageKey(ref), String(chunkIndex));
    } catch {
      // Ignore storage limitations/private mode quirks.
    }
  };

  const todayRef = useMemo(() => {
    if (!bootstrap) return "";
    return section === "john" ? bootstrap.today.johnRef : bootstrap.today.psalmRef;
  }, [bootstrap, section]);

  useEffect(() => {
    void loadData();
  }, [section]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      for (const value of chunkAudioRef.current.values()) {
        URL.revokeObjectURL(value);
      }
      chunkAudioRef.current.clear();
    };
  }, []);

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
    prefetchTokenRef.current++;
    sessionIntroChunkRef.current = null;
    setIsListeningSession(false);
    clearChunkAudioCache();
    stopAudio();

    try {
      const bootstrapData = await api.bootstrap();
      setBootstrap(bootstrapData);

      const ref = section === "john" ? bootstrapData.today.johnRef : bootstrapData.today.psalmRef;
      const passageData = await api.getPassage(ref, bootstrapData.settings.translation);
      setPassage(passageData);

      const resumeIndex =
        bootstrapData.resume &&
        bootstrapData.resume.section === sectionName &&
        bootstrapData.resume.lastRef === ref
          ? bootstrapData.resume.lastChunkIndex
          : 0;
      const localIndex = readLocalProgress(ref) ?? 0;
      const nextIndex = Math.min(
        Math.max(resumeIndex, localIndex, 0),
        Math.max(0, passageData.chunks.length - 1),
      );

      if (
        bootstrapData.resume &&
        bootstrapData.resume.section === sectionName &&
        bootstrapData.resume.lastRef === ref
      ) {
        setCurrentChunkIndex(nextIndex);
      } else {
        setCurrentChunkIndex(nextIndex);
      }
      writeLocalProgress(ref, nextIndex);

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
    writeLocalProgress(passage.ref, chunkIndex);

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

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlayingAudio(false);
    setIsAudioStarting(false);
  };

  const ensureAudioUnlocked = async () => {
    if (audioUnlockedRef.current || !audioRef.current) return;
    try {
      const tinySilentMp3 =
        "data:audio/mp3;base64,//uQxAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAACcQCA//////////////////////////////8AAAA8TEFNRTMuMTAwA8MAAAAAAAAAABQgJAUHQQAB4AAAAnE2M2v6AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
      audioRef.current.src = tinySilentMp3;
      audioRef.current.muted = true;
      audioRef.current.loop = true;
      await audioRef.current.play();
      audioUnlockedRef.current = true;
    } catch {
      // Some browsers still require direct user interaction per playback attempt.
    }
  };

  const buildChunkListeningScript = (chunkIndex: number) => {
    if (!passage) return "";
    const chunk = passage.chunks[chunkIndex];
    if (!chunk) return "";
    const includeIntro = sessionIntroChunkRef.current === chunkIndex;
    if (!includeIntro) {
      return chunk.text.trim();
    }

    const header = `${sectionDisplay}. ${passage.ref}. ${passage.translation} translation.`;
    return `${header} ${chunk.text}`.trim();
  };

  const clearChunkAudioCache = () => {
    for (const value of chunkAudioRef.current.values()) {
      URL.revokeObjectURL(value);
    }
    chunkAudioRef.current.clear();
  };

  const ensureChunkAudioUrl = async (chunkIndex: number) => {
    const existing = chunkAudioRef.current.get(chunkIndex);
    if (existing) return existing;

    if (!bootstrap?.settings.listeningEnabled) {
      throw new Error("Listening mode is disabled.");
    }

    const script = buildChunkListeningScript(chunkIndex);
    if (!script) {
      throw new Error("No chunk text available for synthesis.");
    }

    const blob = await api.synthesizeAudio({
      text: script,
      voice: bootstrap.settings.listeningVoice,
      style: bootstrap.settings.listeningStyle,
      speed: bootstrap.settings.listeningSpeed,
    });

    const url = URL.createObjectURL(blob);
    chunkAudioRef.current.set(chunkIndex, url);
    return url;
  };

  const prefetchRemainingChunks = (startChunkIndex: number) => {
    if (!passage) return;

    const myToken = ++prefetchTokenRef.current;
    void (async () => {
      for (let i = startChunkIndex; i < passage.chunks.length; i++) {
        if (prefetchTokenRef.current !== myToken) break;
        if (chunkAudioRef.current.has(i)) continue;
        try {
          await ensureChunkAudioUrl(i);
        } catch {
          // Keep reading flow resilient; foreground playback path can retry.
        }
      }
    })();
  };

  const playChunkAudio = async (chunkIndex: number) => {
    if (!bootstrap?.settings.listeningEnabled) {
      toast.info("Enable Listening mode in Settings first.");
      return;
    }

    stopAudio();
    setIsSynthesizingAudio(true);
    try {
      const nextUrl = await ensureChunkAudioUrl(chunkIndex);

      if (audioRef.current) {
        audioRef.current.loop = false;
        audioRef.current.muted = false;
        audioRef.current.src = nextUrl;
        const currentAttempt = ++playAttemptRef.current;
        pendingAutoplayRef.current = true;
        setIsAudioStarting(true);
        try {
          await audioRef.current.play();
          if (playAttemptRef.current === currentAttempt) {
            setIsPlayingAudio(true);
            pendingAutoplayRef.current = false;
          }
        } catch (err) {
          if (!(err instanceof DOMException && err.name === "AbortError")) {
            // Fall back to loadeddata replay path on iOS/webkit autoplay quirks.
            if (!(err instanceof DOMException && (err.name === "NotAllowedError" || err.name === "NotSupportedError"))) {
              throw err;
            }
          }
        } finally {
          if (playAttemptRef.current === currentAttempt) {
            setIsAudioStarting(false);
          }
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Listening audio is unavailable right now.");
      setIsAudioStarting(false);
    } finally {
      setIsSynthesizingAudio(false);
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
        stopAudio();
        setShowCheckpoint(true);
        return;
      }
    } else if (nextIndex === totalChunks) {
      stopAudio();
      setShowCheckpoint(true);
      return;
    }

    if (nextIndex >= totalChunks) {
      setIsComplete(true);
      stopAudio();
      return;
    }

    setCurrentChunkIndex(nextIndex);
    await saveResumeState(nextIndex);
    if (isListeningSession && bootstrap?.settings.listeningEnabled) {
      await playChunkAudio(nextIndex);
    }
  };

  const handleComplete = async () => {
    if (!passage) return;
    stopAudio();
    setShowCheckpoint(true);
  };

  const handlePrevious = async () => {
    const prevIndex = Math.max(0, currentChunkIndex - 1);
    stopAudio();
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
      stopAudio();
      return;
    }

    setCurrentChunkIndex(nextIndex);
    await saveResumeState(nextIndex);
    if (isListeningSession && bootstrap?.settings.listeningEnabled) {
      await playChunkAudio(nextIndex);
    }
  };

  const handleCompleteSection = async () => {
    stopAudio();
    if (passage) {
      writeLocalProgress(passage.ref, Math.max(0, passage.chunks.length - 1));
    }
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

  const handlePlayListening = async () => {
    if (!bootstrap?.settings.listeningEnabled) {
      toast.info("Enable Listening mode in Settings first.");
      return;
    }

    await ensureAudioUnlocked();

    if (audioRef.current && isPlayingAudio) {
      setIsListeningSession(false);
      sessionIntroChunkRef.current = null;
      prefetchTokenRef.current++;
      stopAudio();
      return;
    }

    clearChunkAudioCache();
    sessionIntroChunkRef.current = currentChunkIndex;
    setIsListeningSession(true);
    prefetchRemainingChunks(currentChunkIndex);
    await playChunkAudio(currentChunkIndex);
  };

  const openCurrentPassageInBibleStudio = () => {
    if (!passage) return;
    const params = new URLSearchParams({
      ref: passage.ref,
      translation: passage.translation,
    });
    navigate(`/bible?${params.toString()}`);
  };

  const shareCurrentPassage = async () => {
    if (!passage) return;
    const passageUrl = `${window.location.origin}/bible?ref=${encodeURIComponent(passage.ref)}&translation=${encodeURIComponent(passage.translation)}`;
    const text = `${passage.ref} (${passage.translation})`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "QuietWord passage",
          text,
          url: passageUrl,
        });
      } else {
        await navigator.clipboard.writeText(`${text}\n${passageUrl}`);
      }
      toast.success("Passage shared");
    } catch {
      toast.error("Unable to share passage");
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
              <div className="inline-flex items-center gap-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary rounded-full">
                  <span className="text-xs font-medium text-foreground-muted uppercase tracking-wide">{passage.translation}</span>
                </div>
                <button
                  onClick={openCurrentPassageInBibleStudio}
                  className="w-9 h-9 rounded-full glass border border-glass-border hover:bg-glass-highlight flex items-center justify-center text-foreground"
                  aria-label="Open passage in Bible Studio"
                  title="Open in Bible Studio"
                >
                  <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.1} d="M14 3h7v7M10 14L21 3M20 14v5a2 2 0 01-2 2H7a2 2 0 01-2-2V8a2 2 0 012-2h5" />
                  </svg>
                </button>
                <button
                  onClick={() => void shareCurrentPassage()}
                  className="w-9 h-9 rounded-full glass border border-glass-border hover:bg-glass-highlight flex items-center justify-center text-foreground"
                  aria-label="Share passage"
                  title="Share passage"
                >
                  <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.1} d="M12 16V7M8 11l4-4 4 4M5 13v5h14v-5" />
                  </svg>
                </button>
              </div>
              <div className="pt-1">
                <button
                  onClick={() => void handlePlayListening()}
                  disabled={isSynthesizingAudio || isAudioStarting}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-glass-border text-sm text-foreground hover:bg-glass-highlight disabled:opacity-60"
                >
                  <span className="inline-flex items-center gap-1">
                    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path d="M6 4.5a1 1 0 0 1 1.53-.848l8 5a1 1 0 0 1 0 1.696l-8 5A1 1 0 0 1 6 14.5v-10z" />
                    </svg>
                    <svg className="w-3.5 h-3.5 opacity-80" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path d="M10 2l1.2 3.4L14.5 6l-3.3.9L10 10.2 8.8 6.9 5.5 6l3.3-.6L10 2zm5.5 8l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2zM4 11l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8L4 11z" />
                    </svg>
                  </span>
                  {isSynthesizingAudio ? "Generating AI audio..." : isAudioStarting ? "Starting..." : isPlayingAudio ? "Pause listening" : "Play with AI"}
                </button>
              </div>
            </div>

            <div className="glass-strong p-12 rounded-3xl shadow-lg relative overflow-hidden group">
              <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-accent/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              <div className="prose prose-xl max-w-none relative z-10">
                <p className="text-foreground leading-relaxed whitespace-pre-line">{currentChunk.text}</p>
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
        <audio
          ref={audioRef}
          preload="auto"
          playsInline
          onLoadedData={() => {
            if (!pendingAutoplayRef.current || !audioRef.current) return;
            void audioRef.current.play()
              .then(() => {
                setIsPlayingAudio(true);
                pendingAutoplayRef.current = false;
              })
              .catch(() => {
                // Require another explicit tap if browser still blocks.
              });
          }}
          onEnded={() => setIsPlayingAudio(false)}
          onPause={() => setIsPlayingAudio(false)}
          onPlay={() => setIsPlayingAudio(true)}
          hidden
        />
      </div>
    </div>
  );
}
