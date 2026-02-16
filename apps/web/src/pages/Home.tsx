// Home page - main dashboard

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { api } from "../lib/api";
import { config } from "../lib/config";
import type { BootstrapData } from "../lib/types";
import { PrimaryButton } from "../components/PrimaryButton";
import { LoadingSpinner } from "../components/LoadingSpinner";

export function Home() {
  const navigate = useNavigate();
  const [bootstrap, setBootstrap] = useState<BootstrapData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAnsweringRecall, setIsAnsweringRecall] = useState(false);
  const [showRecallPanel, setShowRecallPanel] = useState(false);

  useEffect(() => {
    loadBootstrap();
  }, []);

  const loadBootstrap = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.bootstrap();
      setBootstrap(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
      toast.error("Unable to connect to the server");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecallAnswer = async (selectedIndex: number) => {
    if (!bootstrap?.pendingRecall) return;

    setIsAnsweringRecall(true);
    try {
      const response = await api.submitRecallAnswer({
        recallId: bootstrap.pendingRecall.recallId,
        selectedChoiceIndex: selectedIndex,
      });

      if (response.correct) {
        toast.success("Correct. Well remembered.");
      } else {
        toast.info("Good effort. Keep reading to strengthen recall.");
      }

      await loadBootstrap();
    } catch (err) {
      console.error("Failed to submit recall answer:", err);
      toast.error("Failed to submit answer. Please try again.");
    } finally {
      setIsAnsweringRecall(false);
    }
  };

  const openPassageInBibleStudio = (ref: string) => {
    if (!bootstrap) return;
    const params = new URLSearchParams({
      ref,
      translation: bootstrap.settings.translation,
    });
    navigate(`/bible?${params.toString()}`);
  };

  const sharePassage = async (ref: string) => {
    if (!bootstrap) return;
    const translation = bootstrap.settings.translation;
    const passageUrl = `${window.location.origin}/bible?ref=${encodeURIComponent(ref)}&translation=${encodeURIComponent(translation)}`;
    const text = `${ref} (${translation})`;
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
    return <LoadingSpinner message="Loading your reading..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F5F5F0] to-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm text-center space-y-4">
          {config.isDemoMode && (
            <div className="mb-4 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
              Running in demo mode
            </div>
          )}
          <p className="text-gray-600">Unable to connect to the server.</p>
          <PrimaryButton onClick={loadBootstrap} fullWidth>
            Retry
          </PrimaryButton>
        </div>
      </div>
    );
  }

  if (!bootstrap) return null;

  const { today, resume, pendingRecall, plan } = bootstrap;

  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto p-6 pb-28 space-y-6">
        {config.isDemoMode && (
          <div className="glass px-4 py-3 rounded-xl text-sm text-accent flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Demo Mode</span>
            <span className="text-foreground-subtle">- Exploring with sample data</span>
          </div>
        )}

        <div className="glass-strong p-8 rounded-2xl shadow-lg relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="flex items-center justify-between relative z-10">
            <div>
              <div className="text-6xl font-light text-foreground tracking-tight">{today.streak}</div>
              <p className="text-sm text-foreground-muted mt-2 font-medium uppercase tracking-wide">Day streak</p>
            </div>
            <div className="text-2xl font-semibold text-primary">STREAK</div>
          </div>
          {today.graceStreak > 0 && (
            <div className="mt-4 pt-4 border-t border-border-subtle relative z-10">
              <p className="text-sm text-foreground-subtle">
                <span className="font-medium text-accent">{today.graceStreak}</span> grace {today.graceStreak === 1 ? "day" : "days"} used
              </p>
            </div>
          )}
        </div>

        {resume && !today.completedToday && (
          <div className="glass-strong p-6 rounded-2xl shadow-lg relative overflow-hidden group hover:shadow-xl transition-all">
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex items-start justify-between mb-3 relative z-10">
              <div>
                <h2 className="text-lg font-medium text-foreground mb-1">Resume where you left off</h2>
                <p className="text-sm text-foreground-muted">{resume.section} - Passage {resume.lastChunkIndex + 1}</p>
              </div>
              <div className="text-sm font-semibold text-primary">RESUME</div>
            </div>
            <p className="text-sm text-foreground-subtle mb-4 font-mono relative z-10">{resume.lastRef}</p>
            <div className="relative z-10">
              <PrimaryButton onClick={() => navigate(`/reader/${resume.section.toLowerCase()}`)} fullWidth>
                Continue reading
              </PrimaryButton>
            </div>
          </div>
        )}

        {!today.completedToday && (
          <div className="glass-strong p-8 rounded-3xl shadow-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/15 to-accent-secondary/20 rounded-3xl" />
            <div className="space-y-6 relative z-10">
              <div>
                <h2 className="text-3xl font-light text-foreground mb-2">Today's Reading</h2>
                <p className="text-foreground-muted text-sm font-medium">Day {today.dayIndex} of {plan.totalDays}</p>
                {today.theme && <p className="text-primary mt-3 text-base italic">"{today.theme}"</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="glass p-5 rounded-2xl transition-all text-left border border-glass-border hover:border-primary/50 hover:bg-primary/5 group/btn space-y-3">
                  <button onClick={() => navigate("/settle/john")} className="w-full text-left">
                    <div className="text-lg font-medium text-foreground group-hover/btn:text-primary transition-colors">Gospel</div>
                    <div className="text-foreground-muted text-sm mt-2 font-mono">{today.johnRef}</div>
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openPassageInBibleStudio(today.johnRef)}
                      className="w-9 h-9 rounded-full glass border border-glass-border hover:bg-glass-highlight flex items-center justify-center text-foreground"
                      aria-label="Open Gospel passage in Bible Studio"
                      title="Open in Bible Studio"
                    >
                      <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.1} d="M14 3h7v7M10 14L21 3M20 14v5a2 2 0 01-2 2H7a2 2 0 01-2-2V8a2 2 0 012-2h5" />
                      </svg>
                    </button>
                    <button
                      onClick={() => void sharePassage(today.johnRef)}
                      className="w-9 h-9 rounded-full glass border border-glass-border hover:bg-glass-highlight flex items-center justify-center text-foreground"
                      aria-label="Share Gospel passage"
                      title="Share passage"
                    >
                      <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.1} d="M12 16V7M8 11l4-4 4 4M5 13v5h14v-5" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="glass p-5 rounded-2xl transition-all text-left border border-glass-border hover:border-accent/50 hover:bg-accent/5 group/btn space-y-3">
                  <button onClick={() => navigate("/settle/psalm")} className="w-full text-left">
                    <div className="text-lg font-medium text-foreground group-hover/btn:text-accent transition-colors">Psalm</div>
                    <div className="text-foreground-muted text-sm mt-2 font-mono">{today.psalmRef}</div>
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openPassageInBibleStudio(today.psalmRef)}
                      className="w-9 h-9 rounded-full glass border border-glass-border hover:bg-glass-highlight flex items-center justify-center text-foreground"
                      aria-label="Open Psalm passage in Bible Studio"
                      title="Open in Bible Studio"
                    >
                      <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.1} d="M14 3h7v7M10 14L21 3M20 14v5a2 2 0 01-2 2H7a2 2 0 01-2-2V8a2 2 0 012-2h5" />
                      </svg>
                    </button>
                    <button
                      onClick={() => void sharePassage(today.psalmRef)}
                      className="w-9 h-9 rounded-full glass border border-glass-border hover:bg-glass-highlight flex items-center justify-center text-foreground"
                      aria-label="Share Psalm passage"
                      title="Share passage"
                    >
                      <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.1} d="M12 16V7M8 11l4-4 4 4M5 13v5h14v-5" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {today.completedToday && (
          <div className="glass-strong p-8 rounded-2xl shadow-lg text-center space-y-4 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent-secondary/20 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-accent-secondary/20 rounded-full mb-4">
                <svg className="w-8 h-8 text-accent-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-light text-foreground">Today's reading complete</h2>
              <p className="text-foreground-muted mt-2">Well done. Tomorrow's reading unlocks tomorrow.</p>
              <div className="pt-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="glass p-4 rounded-xl border border-glass-border hover:border-primary/50 hover:bg-primary/5 transition-all text-left space-y-2">
                    <button onClick={() => navigate("/reader/john")} className="w-full text-left">
                      <div className="text-sm font-medium text-foreground">Review Gospel</div>
                      <div className="text-xs text-foreground-muted mt-1 font-mono">{today.johnRef}</div>
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openPassageInBibleStudio(today.johnRef)}
                        className="w-8 h-8 rounded-full glass border border-glass-border hover:bg-glass-highlight flex items-center justify-center text-foreground"
                        aria-label="Open Gospel review passage in Bible Studio"
                        title="Open in Bible Studio"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.1} d="M14 3h7v7M10 14L21 3M20 14v5a2 2 0 01-2 2H7a2 2 0 01-2-2V8a2 2 0 012-2h5" />
                        </svg>
                      </button>
                      <button
                        onClick={() => void sharePassage(today.johnRef)}
                        className="w-8 h-8 rounded-full glass border border-glass-border hover:bg-glass-highlight flex items-center justify-center text-foreground"
                        aria-label="Share Gospel review passage"
                        title="Share passage"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.1} d="M12 16V7M8 11l4-4 4 4M5 13v5h14v-5" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="glass p-4 rounded-xl border border-glass-border hover:border-accent/50 hover:bg-accent/5 transition-all text-left space-y-2">
                    <button onClick={() => navigate("/reader/psalm")} className="w-full text-left">
                      <div className="text-sm font-medium text-foreground">Review Psalm</div>
                      <div className="text-xs text-foreground-muted mt-1 font-mono">{today.psalmRef}</div>
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openPassageInBibleStudio(today.psalmRef)}
                        className="w-8 h-8 rounded-full glass border border-glass-border hover:bg-glass-highlight flex items-center justify-center text-foreground"
                        aria-label="Open Psalm review passage in Bible Studio"
                        title="Open in Bible Studio"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.1} d="M14 3h7v7M10 14L21 3M20 14v5a2 2 0 01-2 2H7a2 2 0 01-2-2V8a2 2 0 012-2h5" />
                        </svg>
                      </button>
                      <button
                        onClick={() => void sharePassage(today.psalmRef)}
                        className="w-8 h-8 rounded-full glass border border-glass-border hover:bg-glass-highlight flex items-center justify-center text-foreground"
                        aria-label="Share Psalm review passage"
                        title="Share passage"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.1} d="M12 16V7M8 11l4-4 4 4M5 13v5h14v-5" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {today.completedToday && today.dailyRecap && (
          <div className="glass p-6 rounded-2xl shadow-md">
            <h3 className="text-base font-medium text-foreground mb-2">Today's wrap-up</h3>
            <p className="text-sm text-foreground-muted leading-relaxed">{today.dailyRecap}</p>
          </div>
        )}

        <div className="glass p-6 rounded-2xl shadow-md">
          <h3 className="text-base font-medium text-foreground mb-2">Quick recap</h3>
          <p className="text-sm text-foreground-muted">You're on day {today.dayIndex} of your {plan.name} plan.</p>
          <p className="text-xs text-foreground-subtle mt-2">Version {bootstrap.appVersion}</p>
        </div>

        <div className="glass p-6 rounded-2xl shadow-md">
          <h3 className="text-base font-medium text-foreground mb-2">Bible Studio</h3>
          <p className="text-sm text-foreground-muted mb-4">Read any passage, compare translations, highlight verses, and share.</p>
          <PrimaryButton onClick={() => navigate("/bible")} fullWidth>
            Open Bible Studio
          </PrimaryButton>
        </div>

        {pendingRecall && (
          <div className="glass p-6 rounded-2xl shadow-md border border-glass-border">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-medium text-foreground">Memory check</h3>
                <p className="text-sm text-foreground-muted">Yesterday in one sentence - pick one.</p>
              </div>
              <button
                onClick={() => setShowRecallPanel((prev) => !prev)}
                className="px-4 py-2 rounded-full border border-glass-border glass text-sm text-foreground"
              >
                {showRecallPanel ? "Hide" : "Start recall"}
              </button>
            </div>

            {showRecallPanel && (
              <div className="mt-4 space-y-2">
                {pendingRecall.choices.map((choice, idx) => {
                  const label =
                    typeof choice === "string"
                      ? choice
                      : choice && typeof choice === "object" && "text" in choice
                        ? (choice as { text?: string }).text ?? ""
                        : "";

                  return (
                    <button
                      key={idx}
                      onClick={() => handleRecallAnswer(idx)}
                      disabled={isAnsweringRecall}
                      className="w-full p-4 text-left glass rounded-xl hover:bg-glass-highlight border border-glass-border transition-all disabled:opacity-50"
                    >
                      <span className="text-foreground">{label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>

      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-glass-border glass-strong">
        <div className="max-w-2xl mx-auto p-3">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => navigate("/bible")}
              className="w-12 h-12 glass hover:bg-glass-highlight border border-glass-border rounded-full text-foreground transition-all flex items-center justify-center"
              aria-label="Bible"
              title="Bible"
            >
              <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M5 5.5A2.5 2.5 0 017.5 3H20v16H7.5A2.5 2.5 0 015 16.5v-11z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M8 3v16" />
              </svg>
            </button>
            <button
              onClick={() => navigate("/notes")}
              className="w-12 h-12 glass hover:bg-glass-highlight border border-glass-border rounded-full text-foreground transition-all flex items-center justify-center"
              aria-label="Notes"
              title="Notes"
            >
              <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M8 4h8l4 4v12a1 1 0 01-1 1H8a3 3 0 01-3-3V7a3 3 0 013-3z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M16 4v4h4M9 12h6M9 16h4" />
              </svg>
            </button>
            <button
              onClick={() => navigate("/settings")}
              className="w-12 h-12 glass hover:bg-glass-highlight border border-glass-border rounded-full text-foreground transition-all flex items-center justify-center"
              aria-label="Settings"
              title="Settings"
            >
              <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="3" strokeWidth="1.9" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M19.4 15a1 1 0 00.2 1.1l.1.1a2 2 0 01-2.8 2.8l-.1-.1a1 1 0 00-1.1-.2 1 1 0 00-.6.9V20a2 2 0 01-4 0v-.2a1 1 0 00-.6-.9 1 1 0 00-1.1.2l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1 1 0 00.2-1.1 1 1 0 00-.9-.6H4a2 2 0 010-4h.2a1 1 0 00.9-.6 1 1 0 00-.2-1.1l-.1-.1a2 2 0 012.8-2.8l.1.1a1 1 0 001.1.2h.1a1 1 0 00.5-.9V4a2 2 0 014 0v.2a1 1 0 00.6.9 1 1 0 001.1-.2l.1-.1a2 2 0 012.8 2.8l-.1.1a1 1 0 00-.2 1.1v.1a1 1 0 00.9.5H20a2 2 0 010 4h-.2a1 1 0 00-.4.1 1 1 0 00-.5.5z" />
              </svg>
            </button>
            <button
              onClick={() => navigate("/feedback")}
              className="w-12 h-12 glass hover:bg-glass-highlight border border-glass-border rounded-full text-foreground transition-all flex items-center justify-center"
              aria-label="Feedback"
              title="Feedback"
            >
              <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M5 19l2.5-2H19a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M8 10h8M8 14h6" />
              </svg>
            </button>
            {bootstrap.isAdmin && (
              <button
                onClick={() => navigate("/admin")}
                className="w-12 h-12 glass hover:bg-glass-highlight border border-glass-border rounded-full text-foreground transition-all flex items-center justify-center"
                aria-label="Admin"
                title="Admin"
              >
                <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M12 3l8 3v6c0 5.5-3.8 8-8 9-4.2-1-8-3.5-8-9V6l8-3z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M9.5 12.5l1.7 1.7 3.3-3.3" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
