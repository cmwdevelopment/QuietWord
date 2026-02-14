// Onboarding page - initial setup with glassmorphism

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { motion } from "motion/react";
import { api } from "../lib/api";
import type { Translation, Pace } from "../lib/types";
import { PrimaryButton } from "../components/PrimaryButton";
import { DEFAULT_TRANSLATIONS, translationLabel } from "../lib/translations";

export function Onboarding() {
  const navigate = useNavigate();
  const [translation, setTranslation] = useState<Translation>("WEB");
  const [pace, setPace] = useState<Pace>("standard");
  const [reminderTime, setReminderTime] = useState("08:00");
  const [availableTranslations, setAvailableTranslations] = useState<string[]>(DEFAULT_TRANSLATIONS);
  const [isLoading, setIsLoading] = useState(false);

  const translations: { value: Translation; label: string }[] = availableTranslations.map((code) => ({
    value: code,
    label: translationLabel(code),
  }));

  useEffect(() => {
    void (async () => {
      try {
        const bootstrap = await api.bootstrap();
        if (bootstrap.supportedTranslations?.length) {
          setAvailableTranslations(bootstrap.supportedTranslations);
          setTranslation((current) =>
            bootstrap.supportedTranslations.includes(current) ? current : bootstrap.supportedTranslations[0]
          );
        }
      } catch {
        // Keep local defaults when bootstrap is unavailable.
      }
    })();
  }, []);

  const handleStart = async () => {
    setIsLoading(true);
    try {
      await api.updateSettings({ translation, pace, reminderTime });
      toast.success("Welcome to QuietWord!");
      navigate("/");
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Failed to save settings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-lg w-full space-y-8">
        {/* Brand */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/20 rounded-2xl mb-2">
            <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-5xl font-light text-foreground">QuietWord</h1>
          <p className="text-xl text-primary">Built for busy minds.</p>
          <p className="text-foreground-muted">One passage at a time.</p>
        </motion.div>

        {/* Settings form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="glass-strong p-8 rounded-3xl shadow-xl space-y-6 relative overflow-hidden"
        >
          {/* Ambient glow */}
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-accent/5 rounded-full blur-3xl" />

          <div className="relative z-10 space-y-6">
            {/* Translation */}
            <div>
              <label htmlFor="translation" className="block text-sm font-medium text-foreground mb-2">
                Translation
              </label>
              <select
                id="translation"
                value={translation}
                onChange={(e) => setTranslation(e.target.value as Translation)}
                className="w-full p-3.5 rounded-xl glass border border-glass-border focus:ring-2 focus:ring-primary focus:border-primary transition-all text-foreground bg-input-background"
              >
                {translations.map((t) => (
                  <option key={t.value} value={t.value} className="bg-background-elevated text-foreground">
                    {t.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-foreground-subtle mt-2 ml-1">
                More translations coming as licensing allows.
              </p>
            </div>

            {/* Pace */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                Pace
              </label>
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setPace("short")}
                  className={`p-5 rounded-xl transition-all ${
                    pace === "short"
                      ? "glass-strong border-2 border-primary shadow-lg"
                      : "glass border border-glass-border hover:border-border"
                  }`}
                >
                  <div className="font-medium text-foreground">Short</div>
                  <div className="text-xs text-foreground-muted mt-1">Quick daily reading</div>
                  {pace === "short" && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="mt-2 flex justify-center"
                    >
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </motion.div>
                  )}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setPace("standard")}
                  className={`p-5 rounded-xl transition-all ${
                    pace === "standard"
                      ? "glass-strong border-2 border-primary shadow-lg"
                      : "glass border border-glass-border hover:border-border"
                  }`}
                >
                  <div className="font-medium text-foreground">Standard</div>
                  <div className="text-xs text-foreground-muted mt-1">Fuller experience</div>
                  {pace === "standard" && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="mt-2 flex justify-center"
                    >
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </motion.div>
                  )}
                </motion.button>
              </div>
            </div>

            {/* Reminder time */}
            <div>
              <label htmlFor="reminder-time" className="block text-sm font-medium text-foreground mb-2">
                Daily reminder
              </label>
              <input
                id="reminder-time"
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="w-full p-3.5 rounded-xl glass border border-glass-border focus:ring-2 focus:ring-primary focus:border-primary transition-all text-foreground bg-input-background"
              />
            </div>

            {/* Start button */}
            <PrimaryButton
              onClick={handleStart}
              disabled={isLoading}
              fullWidth
            >
              {isLoading ? "Starting..." : "Begin"}
            </PrimaryButton>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
