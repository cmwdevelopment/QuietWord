// Settings page with glassmorphism

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { motion } from "motion/react";
import { api } from "../lib/api";
import type { Translation, Pace, RecapVoice } from "../lib/types";
import { PrimaryButton } from "../components/PrimaryButton";
import { LoadingSpinner } from "../components/LoadingSpinner";
import {
  applyFontPreference,
  FONT_OPTIONS,
  getSavedFontPreference,
  saveFontPreference
} from "../lib/fontPreferences";
import {
  ACCENT_OPTIONS,
  applyAccentPreference,
  getSavedAccentPreference,
  saveAccentPreference
} from "../lib/accentTheme";
import { DEFAULT_TRANSLATIONS, translationLabel } from "../lib/translations";

export function Settings() {
  const navigate = useNavigate();
  const [translation, setTranslation] = useState<Translation>("WEB");
  const [pace, setPace] = useState<Pace>("standard");
  const [reminderTime, setReminderTime] = useState("08:00");
  const [fontFamily, setFontFamily] = useState(getSavedFontPreference());
  const [recapVoice, setRecapVoice] = useState<RecapVoice>("classic_pastor");
  const [accentColor, setAccentColor] = useState(getSavedAccentPreference());
  const [availableTranslations, setAvailableTranslations] = useState<string[]>(DEFAULT_TRANSLATIONS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const translations: { value: Translation; label: string }[] = availableTranslations.map((code) => ({
    value: code,
    label: translationLabel(code),
  }));

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const bootstrap = await api.bootstrap();
      if (bootstrap.supportedTranslations?.length) {
        setAvailableTranslations(bootstrap.supportedTranslations);
      }

      const data = await api.getSettings();
      setTranslation(data.translation);
      setPace(data.pace);
      setReminderTime(data.reminderTime);
      const serverFont = data.fontFamily || getSavedFontPreference();
      setFontFamily(serverFont);
      applyFontPreference(serverFont);
      saveFontPreference(serverFont);
      setRecapVoice((data.recapVoice as RecapVoice) || "classic_pastor");
      const serverAccent = data.accentColor || getSavedAccentPreference();
      setAccentColor(serverAccent);
      applyAccentPreference(serverAccent);
      saveAccentPreference(serverAccent);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load settings");
      toast.error("Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.updateSettings({ translation, pace, reminderTime, fontFamily, recapVoice, accentColor });
      applyFontPreference(fontFamily);
      saveFontPreference(fontFamily);
      applyAccentPreference(accentColor);
      saveAccentPreference(accentColor);
      toast.success("Settings saved successfully");
    } catch (err) {
      console.error("Failed to save settings:", err);
      toast.error("Failed to save settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await api.logout();
      toast.success("Signed out");
      navigate("/signin", { replace: true });
    } catch {
      toast.error("Failed to sign out. Please try again.");
    } finally {
      setIsSigningOut(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading settings..." />;
  }

  return (
    <div className="min-h-screen">
      {/* Header with glassmorphism */}
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
            <div className="flex items-center justify-center w-12 h-12 bg-accent/20 rounded-xl">
              <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-light text-foreground">Settings</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong p-8 rounded-3xl shadow-lg space-y-8 relative overflow-hidden"
        >
          {/* Subtle ambient glow */}
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-accent/5 rounded-full blur-3xl" />

          <div className="relative z-10 space-y-8">
            {/* Translation */}
            <div>
              <label htmlFor="translation" className="block text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span>Translation</span>
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
              <label className="block text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Reading pace</span>
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
              <label htmlFor="reminder-time" className="block text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-accent-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span>Daily reminder</span>
              </label>
              <input
                id="reminder-time"
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="w-full p-3.5 rounded-xl glass border border-glass-border focus:ring-2 focus:ring-primary focus:border-primary transition-all text-foreground bg-input-background"
              />
            </div>

            {/* Font family */}
            <div>
              <label htmlFor="font-family" className="block text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M9 7v10m6-10v10M7 17h10" />
                </svg>
                <span>Font family</span>
              </label>
              <select
                id="font-family"
                value={fontFamily}
                onChange={(e) => {
                  const next = e.target.value;
                  setFontFamily(next);
                  applyFontPreference(next);
                }}
                className="w-full p-3.5 rounded-xl glass border border-glass-border focus:ring-2 focus:ring-primary focus:border-primary transition-all text-foreground bg-input-background"
              >
                {FONT_OPTIONS.map((font) => (
                  <option key={font.value} value={font.value} className="bg-background-elevated text-foreground">
                    {font.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="recap-voice" className="block text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-accent-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h6m-6 4h10M5 6h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z" />
                </svg>
                <span>Recap voice</span>
              </label>
              <select
                id="recap-voice"
                value={recapVoice}
                onChange={(e) => setRecapVoice(e.target.value as RecapVoice)}
                className="w-full p-3.5 rounded-xl glass border border-glass-border focus:ring-2 focus:ring-primary focus:border-primary transition-all text-foreground bg-input-background"
              >
                <option value="classic_pastor">Classic Pastor</option>
                <option value="gen_z">Gen-Z Everyday</option>
                <option value="poetic">Poetic Reflective</option>
                <option value="coach">Straight Coach</option>
                <option value="scholar">Study Guide</option>
              </select>
            </div>

            <div>
              <label htmlFor="accent-color" className="block text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5.5 5.5 0 1118 12a3 3 0 01-3 3h-1.5a1.5 1.5 0 000 3H15a5 5 0 000-10h-.2" />
                </svg>
                <span>Accent color</span>
              </label>
              <select
                id="accent-color"
                value={accentColor}
                onChange={(e) => {
                  const next = e.target.value;
                  setAccentColor(next);
                  applyAccentPreference(next);
                }}
                className="w-full p-3.5 rounded-xl glass border border-glass-border focus:ring-2 focus:ring-primary focus:border-primary transition-all text-foreground bg-input-background"
              >
                {ACCENT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value} className="bg-background-elevated text-foreground">
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="flex gap-2 mt-3">
                {ACCENT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setAccentColor(option.value);
                      applyAccentPreference(option.value);
                    }}
                    className={`w-6 h-6 rounded-full border ${accentColor === option.value ? "border-white" : "border-white/30"}`}
                    style={{ backgroundColor: option.colors.primary }}
                    aria-label={`Use ${option.label}`}
                    title={option.label}
                  />
                ))}
              </div>
            </div>

            {/* Save button */}
            <div className="pt-4">
              <PrimaryButton
                onClick={handleSave}
                disabled={isSaving}
                fullWidth
                size="lg"
              >
                {isSaving ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving...
                  </span>
                ) : (
                  "Save changes"
                )}
              </PrimaryButton>
              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="mt-3 w-full px-6 py-3 rounded-xl border border-glass-border glass hover:bg-glass-highlight text-sm text-foreground transition-all disabled:opacity-50"
              >
                {isSigningOut ? "Signing out..." : "Sign out"}
              </button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
