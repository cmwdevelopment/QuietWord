// Checkpoint - prompts for reflection during reading with glassmorphism

import React, { useState } from "react";
import { motion } from "motion/react";
import type { NoteType } from "../lib/types";
import { PrimaryButton } from "./PrimaryButton";

interface CheckpointProps {
  type: "reflection" | "response";
  currentRef: string;
  onSave: (noteType: NoteType, body: string) => Promise<void>;
  onContinue: () => void;
}

const noteTypeOptions: { value: NoteType; label: string; description: string; icon: string; color: string }[] = [
  { value: "Question", label: "Question", description: "Something you're wondering about", icon: "?", color: "bg-accent/20 text-accent border-accent/30" },
  { value: "Promise", label: "Promise", description: "A promise you noticed", icon: "✓", color: "bg-primary/20 text-primary border-primary/30" },
  { value: "Conviction", label: "Conviction", description: "Something that convicted you", icon: "!", color: "bg-accent-warm/20 text-accent-warm border-accent-warm/30" },
  { value: "Action", label: "Action", description: "An action to take", icon: "→", color: "bg-accent-secondary/20 text-accent-secondary border-accent-secondary/30" },
  { value: "Comfort", label: "Comfort", description: "A comfort you received", icon: "♡", color: "bg-destructive/20 text-destructive border-destructive/30" },
];

export function Checkpoint({ type, currentRef, onSave, onContinue }: CheckpointProps) {
  const [selectedType, setSelectedType] = useState<NoteType>("Question");
  const [noteBody, setNoteBody] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!noteBody.trim()) return;
    
    setIsSaving(true);
    try {
      await onSave(selectedType, noteBody);
      setNoteBody("");
      onContinue();
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkip = () => {
    setNoteBody("");
    onContinue();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="max-w-2xl mx-auto glass-strong p-10 rounded-3xl shadow-xl relative overflow-hidden"
    >
      {/* Ambient glow */}
      <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />

      <div className="space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/20 rounded-full mb-2">
            <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-3xl font-light text-foreground">
            {type === "reflection" ? "Pause & Reflect" : "Respond"}
          </h2>
          <p className="text-sm text-foreground-muted font-mono">
            {currentRef}
          </p>
        </div>

        {/* Note type selector */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-4">
            What stood out?
          </label>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {noteTypeOptions.map((option) => (
              <motion.button
                key={option.value}
                onClick={() => setSelectedType(option.value)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-4 rounded-xl text-left transition-all border-2 ${
                  selectedType === option.value
                    ? `glass-strong ${option.color} shadow-lg`
                    : "glass border-glass-border hover:border-border"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg font-bold">{option.icon}</span>
                  <div className="font-medium text-sm text-foreground">{option.label}</div>
                </div>
                <div className={`text-xs mt-1 ${selectedType === option.value ? 'opacity-90' : 'text-foreground-muted'}`}>
                  {option.description}
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Note input */}
        <div>
          <label htmlFor="note-body" className="block text-sm font-medium text-foreground mb-2">
            Your note
          </label>
          <textarea
            id="note-body"
            value={noteBody}
            onChange={(e) => setNoteBody(e.target.value)}
            placeholder="Write your thoughts here..."
            rows={4}
            className="w-full p-4 rounded-xl glass border border-glass-border focus:ring-2 focus:ring-primary focus:border-primary transition-all resize-none text-foreground bg-input-background placeholder:text-foreground-subtle"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <PrimaryButton
            onClick={handleSkip}
            variant="ghost"
            fullWidth
          >
            Skip
          </PrimaryButton>
          <PrimaryButton
            onClick={handleSave}
            disabled={!noteBody.trim() || isSaving}
            variant="primary"
            fullWidth
          >
            {isSaving ? "Saving..." : "Save & Continue"}
          </PrimaryButton>
        </div>
      </div>
    </motion.div>
  );
}