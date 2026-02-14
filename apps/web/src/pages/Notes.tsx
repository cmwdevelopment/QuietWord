// Notes page - view and create notes with glassmorphism

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { motion } from "motion/react";
import { api } from "../lib/api";
import type { Note, NoteType } from "../lib/types";
import { PrimaryButton } from "../components/PrimaryButton";
import { LoadingSpinner } from "../components/LoadingSpinner";

const noteTypeColors: Record<NoteType, { bg: string; text: string; glow: string }> = {
  Question: { bg: "bg-accent/20", text: "text-accent", glow: "rgba(34, 211, 238, 0.15)" },
  Promise: { bg: "bg-primary/20", text: "text-primary", glow: "rgba(94, 234, 212, 0.15)" },
  Conviction: { bg: "bg-accent-warm/20", text: "text-accent-warm", glow: "rgba(252, 211, 77, 0.15)" },
  Action: { bg: "bg-accent-secondary/20", text: "text-accent-secondary", glow: "rgba(103, 232, 249, 0.15)" },
  Comfort: { bg: "bg-destructive/20", text: "text-destructive", glow: "rgba(252, 165, 165, 0.15)" },
};

const noteTypeIcons: Record<NoteType, string> = {
  Question: "Q",
  Promise: "P",
  Conviction: "C",
  Action: "A",
  Comfort: "O",
};

const defaultNoteStyle = {
  bg: "bg-secondary/40",
  text: "text-foreground",
  glow: "rgba(148, 163, 184, 0.2)",
};

function normalizeNoteType(value: string): NoteType | undefined {
  const lowered = value.toLowerCase();
  if (lowered === "question") return "Question";
  if (lowered === "promise") return "Promise";
  if (lowered === "conviction") return "Conviction";
  if (lowered === "action") return "Action";
  if (lowered === "comfort") return "Comfort";
  return undefined;
}

export function Notes() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getNotes(20);
      setNotes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notes");
      toast.error("Failed to load notes");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading notes..." />;
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 glass-strong border-b border-glass-border">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <button
            onClick={() => navigate("/")}
            className="text-foreground-muted hover:text-foreground text-sm transition-colors mb-3 flex items-center gap-2 group"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to home</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 bg-primary/20 rounded-xl">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h1 className="text-3xl font-light text-foreground">Your Notes</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {error ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-strong p-8 rounded-2xl shadow-lg text-center space-y-4"
          >
            <p className="text-foreground-muted">{error}</p>
            <PrimaryButton onClick={loadNotes} fullWidth>
              Retry
            </PrimaryButton>
          </motion.div>
        ) : notes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-strong p-12 rounded-2xl shadow-lg text-center space-y-4 relative overflow-hidden"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />

            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-full mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-light text-foreground mb-2">No notes yet</h2>
              <p className="text-foreground-muted">Notes you create during reading will appear here.</p>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {notes.map((note, index) => {
              const normalizedType = normalizeNoteType(note.noteType as unknown as string);
              const style = normalizedType ? noteTypeColors[normalizedType] : defaultNoteStyle;
              const icon = normalizedType ? noteTypeIcons[normalizedType] : "*";
              const label = normalizedType ?? note.noteType;

              return (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-strong p-6 rounded-2xl shadow-md hover:shadow-lg transition-all group relative overflow-hidden"
                >
                  <div
                    className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ backgroundColor: style.glow }}
                  />

                  <div className="relative z-10 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${style.bg} backdrop-blur-sm`}>
                          <span className={`text-sm font-bold ${style.text}`}>{icon}</span>
                          <span className={`text-xs font-medium ${style.text}`}>{label}</span>
                        </div>
                        <span className="text-sm text-foreground-muted font-mono">{note.ref}</span>
                      </div>
                      <span className="text-xs text-foreground-subtle whitespace-nowrap">{formatDate(note.createdAt)}</span>
                    </div>
                    <p className="text-foreground leading-relaxed">{note.body}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
