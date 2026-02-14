// Settle page - pre-reading preparation with glassmorphism

import React from "react";
import { useNavigate, useParams } from "react-router";
import { motion } from "motion/react";
import { PrimaryButton } from "../components/PrimaryButton";

export function Settle() {
  const navigate = useNavigate();
  const { section } = useParams<{ section: string }>();

  const sectionName = section === "john" ? "Gospel of John" : "Psalm";
  const sectionKey = section === "john" ? "John" : "Psalm";

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-lg w-full space-y-6">
        {/* Back to home */}
        <button
          onClick={() => navigate("/")}
          className="text-foreground-muted hover:text-foreground text-sm transition-colors flex items-center gap-2 group"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to home</span>
        </button>

        {/* Settle content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="glass-strong p-10 rounded-3xl shadow-xl text-center space-y-8 relative overflow-hidden"
        >
          {/* Ambient glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="space-y-3 relative z-10"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-full mb-2">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h1 className="text-4xl font-light text-foreground">{sectionName}</h1>
            <p className="text-foreground-muted text-lg">Take a moment to settle your mind.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="space-y-4 text-base text-foreground text-left glass p-6 rounded-2xl relative z-10"
          >
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-primary rounded-full" />
              <p>Find a quiet space</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-accent rounded-full" />
              <p>Take a few deep breaths</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-accent-secondary rounded-full" />
              <p>Let distractions fade</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-accent-warm rounded-full" />
              <p>Read at your own pace</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="pt-4 relative z-10"
          >
            <PrimaryButton
              onClick={() => navigate(`/reader/${section}`)}
              fullWidth
              size="lg"
            >
              Begin reading
            </PrimaryButton>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
