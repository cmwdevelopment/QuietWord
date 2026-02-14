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
                <p className="text-sm text-foreground-muted">{resume.section} - Chunk {resume.lastChunkIndex + 1}</p>
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
                <p className="text-foreground-muted text-sm font-medium">Day {today.dayIndex + 1} of {plan.totalDays}</p>
                {today.theme && <p className="text-primary mt-3 text-base italic">"{today.theme}"</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => navigate("/settle/john")}
                  className="glass p-6 rounded-2xl transition-all text-left border border-glass-border hover:border-primary/50 hover:bg-primary/5 group/btn"
                >
                  <div className="text-lg font-medium text-foreground group-hover/btn:text-primary transition-colors">Gospel</div>
                  <div className="text-foreground-muted text-sm mt-2 font-mono">{today.johnRef}</div>
                </button>
                <button
                  onClick={() => navigate("/settle/psalm")}
                  className="glass p-6 rounded-2xl transition-all text-left border border-glass-border hover:border-accent/50 hover:bg-accent/5 group/btn"
                >
                  <div className="text-lg font-medium text-foreground group-hover/btn:text-accent transition-colors">Psalm</div>
                  <div className="text-foreground-muted text-sm mt-2 font-mono">{today.psalmRef}</div>
                </button>
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
                  <button
                    onClick={() => navigate("/reader/john")}
                    className="glass p-4 rounded-xl border border-glass-border hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
                  >
                    <div className="text-sm font-medium text-foreground">Review Gospel</div>
                    <div className="text-xs text-foreground-muted mt-1 font-mono">{today.johnRef}</div>
                  </button>
                  <button
                    onClick={() => navigate("/reader/psalm")}
                    className="glass p-4 rounded-xl border border-glass-border hover:border-accent/50 hover:bg-accent/5 transition-all text-left"
                  >
                    <div className="text-sm font-medium text-foreground">Review Psalm</div>
                    <div className="text-xs text-foreground-muted mt-1 font-mono">{today.psalmRef}</div>
                  </button>
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
          <p className="text-sm text-foreground-muted">You're on day {today.dayIndex + 1} of your {plan.name} plan.</p>
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
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/notes")}
              className="flex-1 px-4 py-3 glass hover:bg-glass-highlight border border-glass-border rounded-xl text-sm font-medium text-foreground transition-all"
            >
              Notes
            </button>
            <button
              onClick={() => navigate("/settings")}
              className="flex-1 px-4 py-3 glass hover:bg-glass-highlight border border-glass-border rounded-xl text-sm font-medium text-foreground transition-all"
            >
              Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
