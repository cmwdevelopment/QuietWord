// Theme Preview - Compare different color palettes

import React, { useState } from "react";
import { motion } from "motion/react";

type ThemeName = "slate-indigo" | "mono-purple" | "navy-sky" | "charcoal-coral";

interface Theme {
  name: string;
  description: string;
  vibe: string;
  colors: {
    primary: string;
    bgGradientFrom: string;
    bgGradientTo: string;
    textDeep: string;
    textMedium: string;
    accent: string;
    border: string;
    cardBg: string;
  };
}

const themes: Record<ThemeName, Theme> = {
  "slate-indigo": {
    name: "Slate & Indigo",
    description: "Tech Minimalism",
    vibe: "Linear, Notion, modern SaaS apps",
    colors: {
      primary: "#6366F1",
      bgGradientFrom: "#F8FAFC",
      bgGradientTo: "#FFFFFF",
      textDeep: "#0F172A",
      textMedium: "#475569",
      accent: "#3B82F6",
      border: "#E2E8F0",
      cardBg: "#FFFFFF",
    },
  },
  "mono-purple": {
    name: "Monochrome + Purple",
    description: "Ultra Modern",
    vibe: "Apple-like, clean, high contrast",
    colors: {
      primary: "#7C3AED",
      bgGradientFrom: "#FAFAFA",
      bgGradientTo: "#FFFFFF",
      textDeep: "#111827",
      textMedium: "#6B7280",
      accent: "#8B5CF6",
      border: "#E5E7EB",
      cardBg: "#FFFFFF",
    },
  },
  "navy-sky": {
    name: "Deep Navy & Sky",
    description: "Calm Professional",
    vibe: "Tailwind, GitHub, developer tools",
    colors: {
      primary: "#1E293B",
      bgGradientFrom: "#F1F5F9",
      bgGradientTo: "#FFFFFF",
      textDeep: "#0F172A",
      textMedium: "#64748B",
      accent: "#06B6D4",
      border: "#E2E8F0",
      cardBg: "#FFFFFF",
    },
  },
  "charcoal-coral": {
    name: "Warm Charcoal & Coral",
    description: "Modern Warmth",
    vibe: "Friendly modern, still calm but warmer",
    colors: {
      primary: "#374151",
      bgGradientFrom: "#FAFAF9",
      bgGradientTo: "#FFFFFF",
      textDeep: "#1F2937",
      textMedium: "#6B7280",
      accent: "#FB923C",
      border: "#E5E7EB",
      cardBg: "#FFFFFF",
    },
  },
};

function ThemeCard({ themeName }: { themeName: ThemeName }) {
  const theme = themes[themeName];

  return (
    <div
      className="rounded-2xl overflow-hidden shadow-lg border"
      style={{
        borderColor: theme.colors.border,
        background: `linear-gradient(to bottom, ${theme.colors.bgGradientFrom}, ${theme.colors.bgGradientTo})`,
      }}
    >
      {/* Header */}
      <div className="p-6 border-b" style={{ borderColor: theme.colors.border }}>
        <h3 className="text-2xl font-light mb-1" style={{ color: theme.colors.textDeep }}>
          {theme.name}
        </h3>
        <p className="text-sm font-medium mb-2" style={{ color: theme.colors.primary }}>
          {theme.description}
        </p>
        <p className="text-xs italic" style={{ color: theme.colors.textMedium }}>
          {theme.vibe}
        </p>
      </div>

      {/* Color Swatches */}
      <div className="p-6 border-b" style={{ borderColor: theme.colors.border }}>
        <p className="text-xs font-medium mb-3" style={{ color: theme.colors.textMedium }}>
          COLOR PALETTE
        </p>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <div
              className="h-12 rounded-lg mb-1 border"
              style={{ backgroundColor: theme.colors.primary, borderColor: theme.colors.border }}
            />
            <p className="text-xs" style={{ color: theme.colors.textMedium }}>
              Primary
            </p>
          </div>
          <div>
            <div
              className="h-12 rounded-lg mb-1 border"
              style={{ backgroundColor: theme.colors.accent, borderColor: theme.colors.border }}
            />
            <p className="text-xs" style={{ color: theme.colors.textMedium }}>
              Accent
            </p>
          </div>
          <div>
            <div
              className="h-12 rounded-lg mb-1 border"
              style={{ backgroundColor: theme.colors.textDeep, borderColor: theme.colors.border }}
            />
            <p className="text-xs" style={{ color: theme.colors.textMedium }}>
              Text
            </p>
          </div>
        </div>
      </div>

      {/* Sample UI */}
      <div className="p-6 space-y-4">
        <p className="text-xs font-medium mb-3" style={{ color: theme.colors.textMedium }}>
          SAMPLE COMPONENTS
        </p>

        {/* Heading + Body Text */}
        <div>
          <h4 className="text-xl font-light mb-2" style={{ color: theme.colors.textDeep }}>
            Gospel Reading
          </h4>
          <p className="text-base leading-relaxed" style={{ color: theme.colors.textMedium }}>
            In the beginning was the Word, and the Word was with God, and the Word was God.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: theme.colors.primary }}
          >
            Primary Button
          </button>
          <button
            className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors"
            style={{
              color: theme.colors.primary,
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.cardBg,
            }}
          >
            Secondary
          </button>
        </div>

        {/* Card */}
        <div
          className="p-4 rounded-xl border"
          style={{
            backgroundColor: theme.colors.cardBg,
            borderColor: theme.colors.border,
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: theme.colors.textDeep }}>
              3-day streak
            </span>
            <span className="text-2xl" style={{ color: theme.colors.accent }}>
              🔥
            </span>
          </div>
          <p className="text-xs" style={{ color: theme.colors.textMedium }}>
            You're on a roll! Keep it up.
          </p>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-xs mb-2" style={{ color: theme.colors.textMedium }}>
            <span>Passage 3 of 5</span>
            <span>60%</span>
          </div>
          <div className="h-2 rounded-full" style={{ backgroundColor: theme.colors.border }}>
            <div
              className="h-full rounded-full transition-all"
              style={{ backgroundColor: theme.colors.primary, width: "60%" }}
            />
          </div>
        </div>

        {/* Badge */}
        <div className="flex gap-2">
          <span
            className="px-3 py-1 rounded-full text-xs font-medium"
            style={{
              backgroundColor: `${theme.colors.accent}20`,
              color: theme.colors.accent,
            }}
          >
            Question
          </span>
          <span
            className="px-3 py-1 rounded-full text-xs font-medium"
            style={{
              backgroundColor: `${theme.colors.primary}20`,
              color: theme.colors.primary,
            }}
          >
            Action
          </span>
        </div>
      </div>
    </div>
  );
}

export default function ThemePreview() {
  const [selected, setSelected] = useState<ThemeName | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-light text-gray-900 mb-3">Choose Your Theme</h1>
          <p className="text-gray-600 mb-6">
            Compare modern, minimalistic color palettes for QuietWord
          </p>
          {selected && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block px-4 py-2 bg-gray-900 text-white rounded-lg text-sm"
            >
              Selected: <strong>{themes[selected].name}</strong>
            </motion.div>
          )}
        </div>

        {/* Theme Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {(Object.keys(themes) as ThemeName[]).map((themeName) => (
            <motion.div
              key={themeName}
              whileHover={{ y: -4 }}
              onClick={() => setSelected(themeName)}
              className={`cursor-pointer transition-all ${
                selected === themeName ? "ring-4 ring-blue-500 ring-offset-4 rounded-2xl" : ""
              }`}
            >
              <ThemeCard themeName={themeName} />
            </motion.div>
          ))}
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 max-w-2xl mx-auto">
          <h3 className="text-xl font-light text-gray-900 mb-4">How to Apply</h3>
          <ol className="space-y-3 text-gray-600">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm flex items-center justify-center font-medium">
                1
              </span>
              <span>Click on a theme card above to select it</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm flex items-center justify-center font-medium">
                2
              </span>
              <span>Tell me which one you like best</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm flex items-center justify-center font-medium">
                3
              </span>
              <span>I'll update the entire app with your chosen palette!</span>
            </li>
          </ol>
        </div>

        {/* Back Button */}
        <div className="text-center mt-8">
          <a
            href="/"
            className="inline-block px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            ← Back to QuietWord
          </a>
        </div>
      </div>
    </div>
  );
}
