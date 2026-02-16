import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { api } from "../lib/api";
import type { BootstrapData, Passage, Translation, VerseHighlight } from "../lib/types";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { PrimaryButton } from "../components/PrimaryButton";

const HIGHLIGHT_COLORS: Array<{ key: VerseHighlight["color"]; label: string; className: string }> = [
  { key: "amber", label: "Amber", className: "bg-amber-200 border-amber-300" },
  { key: "mint", label: "Mint", className: "bg-emerald-200 border-emerald-300" },
  { key: "sky", label: "Sky", className: "bg-sky-200 border-sky-300" },
  { key: "rose", label: "Rose", className: "bg-rose-200 border-rose-300" },
  { key: "lavender", label: "Lavender", className: "bg-violet-200 border-violet-300" },
];

export function BiblePage() {
  const navigate = useNavigate();
  const [bootstrap, setBootstrap] = useState<BootstrapData | null>(null);
  const [refInput, setRefInput] = useState("John 1:1-14");
  const [translation, setTranslation] = useState<Translation>("WEB");
  const [compareTranslation, setCompareTranslation] = useState<Translation | "">("");
  const [passage, setPassage] = useState<Passage | null>(null);
  const [comparePassage, setComparePassage] = useState<Passage | null>(null);
  const [highlights, setHighlights] = useState<VerseHighlight[]>([]);
  const [activeColor, setActiveColor] = useState<VerseHighlight["color"]>("amber");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPassage, setIsLoadingPassage] = useState(false);

  const highlightByRef = useMemo(() => {
    const map = new Map<string, VerseHighlight>();
    for (const h of highlights) map.set(h.verseRef, h);
    return map;
  }, [highlights]);

  useEffect(() => {
    void initialize();
  }, []);

  const initialize = async () => {
    setIsLoading(true);
    try {
      const boot = await api.bootstrap();
      setBootstrap(boot);
      setTranslation(boot.settings.translation);
      const initialRef = boot.today.johnRef || "John 1:1-14";
      setRefInput(initialRef);
      await loadPassage(initialRef, boot.settings.translation, "");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load Bible module");
    } finally {
      setIsLoading(false);
    }
  };

  const loadPassage = async (reference: string, primary: Translation, secondary: Translation | "") => {
    setIsLoadingPassage(true);
    try {
      const [p, h, c] = await Promise.all([
        api.getPassage(reference, primary),
        api.getBibleHighlights(reference, primary),
        secondary ? api.getPassage(reference, secondary) : Promise.resolve(null),
      ]);
      setPassage(p);
      setHighlights(h.highlights);
      setComparePassage(c);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load passage");
    } finally {
      setIsLoadingPassage(false);
    }
  };

  const handleLoad = async () => {
    await loadPassage(refInput.trim(), translation, compareTranslation);
  };

  const handleToggleHighlight = async (verseRef: string) => {
    try {
      const existing = highlightByRef.get(verseRef);
      if (existing && existing.color === activeColor) {
        await api.deleteBibleHighlight(translation, verseRef);
      } else {
        await api.saveBibleHighlight({ translation, verseRef, color: activeColor });
      }
      const refreshed = await api.getBibleHighlights(refInput.trim(), translation);
      setHighlights(refreshed.highlights);
    } catch {
      toast.error("Unable to save highlight");
    }
  };

  const handleShare = async (text: string, verseRef: string) => {
    const content = `${text}\n\n${verseRef} (${translation})`;
    try {
      if (navigator.share) {
        await navigator.share({ title: verseRef, text: content });
      } else {
        await navigator.clipboard.writeText(content);
      }
      toast.success("Verse copied to share");
    } catch {
      toast.error("Unable to share this verse");
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading Bible module..." />;
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto p-6 pb-24 space-y-5">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate("/")} className="text-sm text-foreground-muted hover:text-foreground">
            &lt; Home
          </button>
          <h1 className="text-2xl font-light text-foreground">Bible Studio</h1>
          <div />
        </div>

        <div className="glass-strong p-4 rounded-2xl space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              value={refInput}
              onChange={(e) => setRefInput(e.target.value)}
              placeholder="John 3:16-21"
              className="md:col-span-2 p-3 rounded-xl glass border border-glass-border bg-input-background text-foreground"
            />
            <select
              value={translation}
              onChange={(e) => setTranslation(e.target.value)}
              className="p-3 rounded-xl glass border border-glass-border bg-input-background text-foreground"
            >
              {(bootstrap?.supportedTranslations ?? []).map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <PrimaryButton onClick={() => void handleLoad()} disabled={isLoadingPassage}>
              {isLoadingPassage ? "Loading..." : "Load"}
            </PrimaryButton>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <select
              value={compareTranslation}
              onChange={async (e) => {
                const next = e.target.value as Translation | "";
                setCompareTranslation(next);
                await loadPassage(refInput.trim(), translation, next);
              }}
              className="p-3 rounded-xl glass border border-glass-border bg-input-background text-foreground"
            >
              <option value="">Compare: Off</option>
              {(bootstrap?.supportedTranslations ?? []).filter((t) => t !== translation).map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <div className="md:col-span-2 flex items-center gap-2 flex-wrap">
              <span className="text-xs text-foreground-muted uppercase">Highlight</span>
              {HIGHLIGHT_COLORS.map((c) => (
                <button
                  key={c.key}
                  onClick={() => setActiveColor(c.key)}
                  className={`px-3 py-1 rounded-full border text-xs ${c.className} ${activeColor === c.key ? "ring-2 ring-primary" : ""}`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {passage && (
          <div className={`grid gap-4 ${comparePassage ? "md:grid-cols-2" : "grid-cols-1"}`}>
            <div className="glass p-5 rounded-2xl border border-glass-border">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-medium text-foreground">{passage.ref}</h2>
                <span className="text-xs text-foreground-muted">{passage.translation}</span>
              </div>
              <div className="space-y-2">
                {passage.verses.map((verse) => {
                  const h = highlightByRef.get(verse.ref);
                  const colorClass = h
                    ? HIGHLIGHT_COLORS.find((x) => x.key === h.color)?.className ?? "bg-amber-100 border-amber-300"
                    : "bg-transparent border-transparent";
                  return (
                    <div key={verse.ref} className={`rounded-xl border p-3 transition-colors ${colorClass}`}>
                      <div className="flex items-center justify-between gap-3">
                        <button className="text-left flex-1" onClick={() => void handleToggleHighlight(verse.ref)}>
                          <p className="text-xs text-foreground-subtle mb-1">{verse.ref}</p>
                          <p className="text-foreground leading-relaxed">{verse.text}</p>
                        </button>
                        <button
                          onClick={() => void handleShare(verse.text, verse.ref)}
                          className="text-xs px-3 py-1 rounded-full glass border border-glass-border"
                        >
                          Share
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {comparePassage && (
              <div className="glass p-5 rounded-2xl border border-glass-border">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-medium text-foreground">{comparePassage.ref}</h2>
                  <span className="text-xs text-foreground-muted">{comparePassage.translation}</span>
                </div>
                <div className="space-y-2">
                  {comparePassage.verses.map((verse) => (
                    <div key={verse.ref} className="rounded-xl border border-glass-border p-3">
                      <p className="text-xs text-foreground-subtle mb-1">{verse.ref}</p>
                      <p className="text-foreground leading-relaxed">{verse.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

