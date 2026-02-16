import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { api } from "../lib/api";
import type { BootstrapData, Passage, Translation, VerseHighlight } from "../lib/types";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { PrimaryButton } from "../components/PrimaryButton";

const BIBLE_BOOKS = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth",
  "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah",
  "Esther", "Job", "Psalm", "Proverbs", "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah",
  "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah",
  "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi", "Matthew", "Mark", "Luke",
  "John", "Acts", "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians", "Philippians",
  "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon",
  "Hebrews", "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John", "Jude", "Revelation",
];

const HIGHLIGHT_COLORS: Array<{ key: VerseHighlight["color"]; label: string; className: string }> = [
  { key: "amber", label: "Amber", className: "bg-amber-200 border-amber-300" },
  { key: "mint", label: "Mint", className: "bg-emerald-200 border-emerald-300" },
  { key: "sky", label: "Sky", className: "bg-sky-200 border-sky-300" },
  { key: "rose", label: "Rose", className: "bg-rose-200 border-rose-300" },
  { key: "lavender", label: "Lavender", className: "bg-violet-200 border-violet-300" },
];

function parseReference(reference: string): { book: string; chapter: string } {
  const m = (reference ?? "").trim().match(/^(?<book>.+?)\s+(?<chapter>\d+)/);
  if (!m?.groups) {
    return { book: "John", chapter: "1" };
  }
  return { book: m.groups.book ?? "John", chapter: m.groups.chapter ?? "1" };
}

export function BiblePage() {
  const navigate = useNavigate();
  const [bootstrap, setBootstrap] = useState<BootstrapData | null>(null);
  const [translation, setTranslation] = useState<Translation>("WEB");
  const [book, setBook] = useState("John");
  const [chapter, setChapter] = useState("1");
  const [passage, setPassage] = useState<Passage | null>(null);
  const [compareEnabled, setCompareEnabled] = useState(false);
  const [compareTranslation, setCompareTranslation] = useState<Translation | "">("");
  const [comparePassage, setComparePassage] = useState<Passage | null>(null);
  const [selectedVerseRefs, setSelectedVerseRefs] = useState<string[]>([]);
  const [highlights, setHighlights] = useState<VerseHighlight[]>([]);
  const [activeColor, setActiveColor] = useState<VerseHighlight["color"]>("amber");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPassage, setIsLoadingPassage] = useState(false);

  const highlightByRef = useMemo(() => {
    const map = new Map<string, VerseHighlight>();
    for (const h of highlights) map.set(h.verseRef, h);
    return map;
  }, [highlights]);

  const currentReference = useMemo(() => `${book} ${(chapter || "1").trim()}`, [book, chapter]);

  useEffect(() => {
    void initialize();
  }, []);

  useEffect(() => {
    if (selectedVerseRefs.length === 0 && compareEnabled) {
      setCompareEnabled(false);
      setCompareTranslation("");
      setComparePassage(null);
    }
  }, [selectedVerseRefs.length, compareEnabled]);

  const initialize = async () => {
    setIsLoading(true);
    try {
      const boot = await api.bootstrap();
      setBootstrap(boot);
      setTranslation(boot.settings.translation);
      const parsed = parseReference(boot.today.johnRef || "John 1");
      setBook(parsed.book);
      setChapter(parsed.chapter);
      await loadPassage(`${parsed.book} ${parsed.chapter}`, boot.settings.translation, "");
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
      setSelectedVerseRefs([]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load chapter");
    } finally {
      setIsLoadingPassage(false);
    }
  };

  const handleLoad = async () => {
    await loadPassage(currentReference, translation, compareEnabled ? compareTranslation : "");
  };

  const toggleVerseSelection = (verseRef: string) => {
    setSelectedVerseRefs((prev) => (prev.includes(verseRef) ? prev.filter((v) => v !== verseRef) : [...prev, verseRef]));
  };

  const refreshHighlights = async () => {
    const refreshed = await api.getBibleHighlights(currentReference, translation);
    setHighlights(refreshed.highlights);
  };

  const applyHighlightToSelection = async () => {
    if (selectedVerseRefs.length === 0) return;
    try {
      await Promise.all(selectedVerseRefs.map((verseRef) => api.saveBibleHighlight({ translation, verseRef, color: activeColor })));
      await refreshHighlights();
      toast.success("Highlight applied");
    } catch {
      toast.error("Unable to save highlight");
    }
  };

  const clearHighlightFromSelection = async () => {
    if (selectedVerseRefs.length === 0) return;
    try {
      await Promise.all(selectedVerseRefs.map((verseRef) => api.deleteBibleHighlight(translation, verseRef)));
      await refreshHighlights();
      toast.success("Highlight removed");
    } catch {
      toast.error("Unable to clear highlight");
    }
  };

  const shareSelection = async () => {
    if (!passage || selectedVerseRefs.length === 0) return;
    const selectedSet = new Set(selectedVerseRefs);
    const selectedVerses = passage.verses.filter((v) => selectedSet.has(v.ref));
    if (!selectedVerses.length) return;

    const content = `${selectedVerses.map((v) => v.text).join("\n")}\n\n${selectedVerses.map((v) => v.ref).join(", ")} (${translation})`;
    try {
      if (navigator.share) {
        await navigator.share({ title: currentReference, text: content });
      } else {
        await navigator.clipboard.writeText(content);
      }
      toast.success("Selection copied to share");
    } catch {
      toast.error("Unable to share selection");
    }
  };

  const handleCompareToggle = async () => {
    const next = !compareEnabled;
    setCompareEnabled(next);
    if (!next) {
      setCompareTranslation("");
      setComparePassage(null);
      return;
    }
    if (compareTranslation) {
      await loadPassage(currentReference, translation, compareTranslation);
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

        <div className="glass-strong p-3 rounded-2xl">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <select
              value={book}
              onChange={(e) => setBook(e.target.value)}
              className="min-w-[150px] h-9 px-2 rounded-lg glass border border-glass-border bg-input-background text-foreground text-sm"
            >
              {BIBLE_BOOKS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            <input
              type="number"
              min={1}
              value={chapter}
              onChange={(e) => setChapter(e.target.value)}
              className="w-16 h-9 px-2 rounded-lg glass border border-glass-border bg-input-background text-foreground text-sm"
              placeholder="Ch"
            />
            <select
              value={translation}
              onChange={(e) => setTranslation(e.target.value)}
              className="min-w-[84px] h-9 px-2 rounded-lg glass border border-glass-border bg-input-background text-foreground text-sm"
            >
              {(bootstrap?.supportedTranslations ?? []).map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <div className="min-w-[84px]">
              <PrimaryButton onClick={() => void handleLoad()} disabled={isLoadingPassage}>
                {isLoadingPassage ? "Loading..." : "Load"}
              </PrimaryButton>
            </div>
          </div>
        </div>

        {selectedVerseRefs.length > 0 && (
          <div className="glass p-3 rounded-2xl border border-glass-border space-y-2 sticky top-2 z-20">
            <div className="flex items-center justify-between">
              <p className="text-xs text-foreground-muted">
                <span className="font-medium text-foreground">{selectedVerseRefs.length}</span> selected
              </p>
              <button onClick={() => setSelectedVerseRefs([])} className="text-xs px-2 py-1 rounded-full glass border border-glass-border">
                Clear
              </button>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => void handleCompareToggle()}
                className={`h-8 px-3 rounded-lg border text-xs ${compareEnabled ? "bg-primary/15 border-primary/40 text-foreground" : "glass border-glass-border text-foreground-muted"}`}
              >
                Compare
              </button>
              {compareEnabled && (
                <select
                  value={compareTranslation}
                  onChange={async (e) => {
                    const next = e.target.value as Translation | "";
                    setCompareTranslation(next);
                    await loadPassage(currentReference, translation, next);
                  }}
                  className="h-8 min-w-[90px] px-2 rounded-lg glass border border-glass-border bg-input-background text-foreground text-xs"
                >
                  <option value="">Off</option>
                  {(bootstrap?.supportedTranslations ?? []).filter((t) => t !== translation).map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              )}

              {HIGHLIGHT_COLORS.map((c) => (
                <button
                  key={c.key}
                  onClick={() => setActiveColor(c.key)}
                  className={`px-2.5 py-1 rounded-full border text-xs text-slate-900 ${c.className} ${activeColor === c.key ? "ring-2 ring-primary" : ""}`}
                >
                  {c.label}
                </button>
              ))}
              <button onClick={() => void applyHighlightToSelection()} className="h-8 px-3 rounded-lg glass border border-glass-border text-xs">
                Apply
              </button>
              <button onClick={() => void clearHighlightFromSelection()} className="h-8 px-3 rounded-lg glass border border-glass-border text-xs">
                Remove
              </button>
              <button onClick={() => void shareSelection()} className="h-8 px-3 rounded-lg glass border border-glass-border text-xs">
                Share
              </button>
            </div>
          </div>
        )}

        {passage && (
          <div className={`grid gap-4 ${comparePassage ? "md:grid-cols-2" : "grid-cols-1"}`}>
            <div className="glass p-4 rounded-2xl border border-glass-border">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-medium text-foreground">{passage.ref}</h2>
                <span className="text-xs text-foreground-muted">{passage.translation}</span>
              </div>
              <div className="space-y-0.5">
                {passage.verses.map((verse) => {
                  const h = highlightByRef.get(verse.ref);
                  const hasHighlight = Boolean(h);
                  const isSelected = selectedVerseRefs.includes(verse.ref);
                  const colorClass = h
                    ? HIGHLIGHT_COLORS.find((x) => x.key === h.color)?.className ?? "bg-amber-100 border-amber-300"
                    : "bg-transparent border-transparent";
                  return (
                    <button
                      key={verse.ref}
                      onClick={() => toggleVerseSelection(verse.ref)}
                      className={`w-full text-left rounded-lg border px-2 py-2 transition-colors ${colorClass} ${isSelected ? "ring-2 ring-primary" : ""}`}
                    >
                      <p className={`${hasHighlight ? "text-slate-900" : "text-foreground"} leading-relaxed`}>
                        <span className={`text-xs align-super mr-1 ${hasHighlight ? "text-slate-600" : "text-foreground-subtle"}`}>{verse.verse}</span>
                        {verse.text}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {comparePassage && (
              <div className="glass p-4 rounded-2xl border border-glass-border">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-medium text-foreground">{comparePassage.ref}</h2>
                  <span className="text-xs text-foreground-muted">{comparePassage.translation}</span>
                </div>
                <div className="space-y-0.5">
                  {comparePassage.verses.map((verse) => (
                    <div key={verse.ref} className="rounded-lg border border-transparent px-2 py-2">
                      <p className="text-foreground leading-relaxed">
                        <span className="text-xs align-super mr-1 text-foreground-subtle">{verse.verse}</span>
                        {verse.text}
                      </p>
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

