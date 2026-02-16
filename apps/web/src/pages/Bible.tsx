import React, { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";
import { api } from "../lib/api";
import type { BootstrapData, Passage, Translation, VerseHighlight } from "../lib/types";
import { LoadingSpinner } from "../components/LoadingSpinner";

const BOOKS: Array<{ name: string; chapters: number }> = [
  { name: "Genesis", chapters: 50 }, { name: "Exodus", chapters: 40 }, { name: "Leviticus", chapters: 27 },
  { name: "Numbers", chapters: 36 }, { name: "Deuteronomy", chapters: 34 }, { name: "Joshua", chapters: 24 },
  { name: "Judges", chapters: 21 }, { name: "Ruth", chapters: 4 }, { name: "1 Samuel", chapters: 31 },
  { name: "2 Samuel", chapters: 24 }, { name: "1 Kings", chapters: 22 }, { name: "2 Kings", chapters: 25 },
  { name: "1 Chronicles", chapters: 29 }, { name: "2 Chronicles", chapters: 36 }, { name: "Ezra", chapters: 10 },
  { name: "Nehemiah", chapters: 13 }, { name: "Esther", chapters: 10 }, { name: "Job", chapters: 42 },
  { name: "Psalm", chapters: 150 }, { name: "Proverbs", chapters: 31 }, { name: "Ecclesiastes", chapters: 12 },
  { name: "Song of Solomon", chapters: 8 }, { name: "Isaiah", chapters: 66 }, { name: "Jeremiah", chapters: 52 },
  { name: "Lamentations", chapters: 5 }, { name: "Ezekiel", chapters: 48 }, { name: "Daniel", chapters: 12 },
  { name: "Hosea", chapters: 14 }, { name: "Joel", chapters: 3 }, { name: "Amos", chapters: 9 },
  { name: "Obadiah", chapters: 1 }, { name: "Jonah", chapters: 4 }, { name: "Micah", chapters: 7 },
  { name: "Nahum", chapters: 3 }, { name: "Habakkuk", chapters: 3 }, { name: "Zephaniah", chapters: 3 },
  { name: "Haggai", chapters: 2 }, { name: "Zechariah", chapters: 14 }, { name: "Malachi", chapters: 4 },
  { name: "Matthew", chapters: 28 }, { name: "Mark", chapters: 16 }, { name: "Luke", chapters: 24 },
  { name: "John", chapters: 21 }, { name: "Acts", chapters: 28 }, { name: "Romans", chapters: 16 },
  { name: "1 Corinthians", chapters: 16 }, { name: "2 Corinthians", chapters: 13 }, { name: "Galatians", chapters: 6 },
  { name: "Ephesians", chapters: 6 }, { name: "Philippians", chapters: 4 }, { name: "Colossians", chapters: 4 },
  { name: "1 Thessalonians", chapters: 5 }, { name: "2 Thessalonians", chapters: 3 }, { name: "1 Timothy", chapters: 6 },
  { name: "2 Timothy", chapters: 4 }, { name: "Titus", chapters: 3 }, { name: "Philemon", chapters: 1 },
  { name: "Hebrews", chapters: 13 }, { name: "James", chapters: 5 }, { name: "1 Peter", chapters: 5 },
  { name: "2 Peter", chapters: 3 }, { name: "1 John", chapters: 5 }, { name: "2 John", chapters: 1 },
  { name: "3 John", chapters: 1 }, { name: "Jude", chapters: 1 }, { name: "Revelation", chapters: 22 },
];

const HIGHLIGHT_COLORS: Array<{ key: VerseHighlight["color"]; label: string; bgClass: string }> = [
  { key: "amber", label: "Amber", bgClass: "bg-amber-200/70" },
  { key: "mint", label: "Mint", bgClass: "bg-emerald-200/70" },
  { key: "sky", label: "Sky", bgClass: "bg-sky-200/70" },
  { key: "rose", label: "Rose", bgClass: "bg-rose-200/70" },
  { key: "lavender", label: "Lavender", bgClass: "bg-violet-200/70" },
];


function parseReference(reference: string): { book: string; chapter: string } {
  const match = (reference ?? "").trim().match(/^(?<book>.+?)\s+(?<chapter>\d+)/);
  if (!match?.groups) return { book: "John", chapter: "1" };
  return { book: match.groups.book ?? "John", chapter: match.groups.chapter ?? "1" };
}

function isOtEcho(text: string): boolean {
  return /(as it is written|scripture says|moses wrote|from the prophet|the prophet said|as david says|isaiah said)/i.test(text);
}

export function BiblePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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
  const [isLoadingCompare, setIsLoadingCompare] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  const currentReference = `${book} ${chapter}`;
  const chapterCount = useMemo(() => BOOKS.find((x) => x.name === book)?.chapters ?? 1, [book]);
  const chapterOptions = useMemo(() => Array.from({ length: chapterCount }, (_, i) => String(i + 1)), [chapterCount]);
  const highlightByRef = useMemo(() => {
    const map = new Map<string, VerseHighlight>();
    for (const h of highlights) map.set(h.verseRef, h);
    return map;
  }, [highlights]);
  const selectedSet = useMemo(() => new Set(selectedVerseRefs), [selectedVerseRefs]);
  const selectedPrimaryVerses = useMemo(
    () => (passage?.verses ?? []).filter((v) => selectedSet.has(v.ref)),
    [passage, selectedSet],
  );
  const selectedCompareVerses = useMemo(
    () => (comparePassage?.verses ?? []).filter((v) => selectedSet.has(v.ref)),
    [comparePassage, selectedSet],
  );

  React.useEffect(() => {
    void initialize();
  }, [searchParams.toString()]);

  const initialize = async () => {
    setIsLoading(true);
    try {
      const boot = await api.bootstrap();
      setBootstrap(boot);
      const queryTranslation = (searchParams.get("translation") ?? "").toUpperCase() as Translation;
      const initialTranslation = boot.supportedTranslations.includes(queryTranslation)
        ? queryTranslation
        : boot.settings.translation;
      setTranslation(initialTranslation);
      const requestedRef = searchParams.get("ref")?.trim();
      const parsed = parseReference(requestedRef || boot.today.johnRef || "John 1");
      setBook(parsed.book);
      setChapter(parsed.chapter);
      await loadPassage(parsed.book, parsed.chapter, initialTranslation, "");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load Bible module");
    } finally {
      setIsLoading(false);
    }
  };

  const loadPassage = async (
    nextBook: string,
    nextChapter: string,
    nextTranslation: Translation,
    nextCompare: Translation | "",
    options?: { clearSelection?: boolean },
  ) => {
    setIsLoadingPassage(true);
    try {
      const ref = `${nextBook} ${nextChapter}`;
      const compareTranslationToUse = nextCompare && nextCompare !== nextTranslation ? nextCompare : "";
      const [primary, highlightPayload, compare] = await Promise.all([
        api.getPassage(ref, nextTranslation),
        api.getBibleHighlights(ref, nextTranslation),
        compareTranslationToUse ? api.getPassage(ref, compareTranslationToUse) : Promise.resolve(null),
      ]);

      setPassage(primary);
      setHighlights(highlightPayload.highlights);
      setComparePassage(compare);
      if (options?.clearSelection ?? true) {
        setSelectedVerseRefs([]);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load chapter");
    } finally {
      setIsLoadingPassage(false);
    }
  };

  const onBookChange = async (nextBook: string) => {
    const nextChapter = "1";
    setBook(nextBook);
    setChapter(nextChapter);
    await loadPassage(nextBook, nextChapter, translation, compareEnabled ? compareTranslation : "");
  };

  const onChapterChange = async (nextChapter: string) => {
    setChapter(nextChapter);
    await loadPassage(book, nextChapter, translation, compareEnabled ? compareTranslation : "");
  };

  const onTranslationChange = async (nextTranslation: Translation) => {
    setTranslation(nextTranslation);
    const nextCompare = compareEnabled && compareTranslation !== nextTranslation ? compareTranslation : "";
    if (!nextCompare) {
      setCompareTranslation("");
      setComparePassage(null);
      setIsLoadingCompare(false);
    }
    await loadPassage(book, chapter, nextTranslation, nextCompare);
  };

  const onCompareToggle = async () => {
    const nextEnabled = !compareEnabled;
    setCompareEnabled(nextEnabled);
    if (!nextEnabled) {
      setCompareTranslation("");
      setComparePassage(null);
      setIsLoadingCompare(false);
      setIsCompareModalOpen(false);
      return;
    }
    const available = (bootstrap?.supportedTranslations ?? []).filter((t) => t !== translation);
    const nextCompare = compareTranslation && compareTranslation !== translation
      ? compareTranslation
      : (available[0] ?? "");
    setCompareTranslation(nextCompare);
    if (nextCompare) {
      setIsLoadingCompare(true);
      await loadPassage(book, chapter, translation, nextCompare, { clearSelection: false });
      setIsLoadingCompare(false);
    }
  };

  const onCompareTranslationChange = async (nextCompare: Translation | "") => {
    setCompareTranslation(nextCompare);
    if (!nextCompare) {
      setComparePassage(null);
      setIsLoadingCompare(false);
      setIsCompareModalOpen(false);
      return;
    }
    setIsLoadingCompare(true);
    await loadPassage(book, chapter, translation, nextCompare, { clearSelection: false });
    setIsLoadingCompare(false);
  };

  const toggleVerseSelection = (verseRef: string) => {
    setSelectedVerseRefs((prev) => (prev.includes(verseRef) ? prev.filter((x) => x !== verseRef) : [...prev, verseRef]));
  };

  const refreshHighlights = async () => {
    const refreshed = await api.getBibleHighlights(currentReference, translation);
    setHighlights(refreshed.highlights);
  };

  const applyHighlight = async (color: VerseHighlight["color"]) => {
    if (selectedVerseRefs.length === 0) return;
    setActiveColor(color);
    try {
      await Promise.all(selectedVerseRefs.map((verseRef) => api.saveBibleHighlight({ translation, verseRef, color })));
      await refreshHighlights();
      toast.success("Highlight applied");
    } catch {
      toast.error("Unable to save highlight");
    }
  };

  const clearHighlights = async () => {
    if (selectedVerseRefs.length === 0) return;
    try {
      await Promise.all(selectedVerseRefs.map((verseRef) => api.deleteBibleHighlight(translation, verseRef)));
      await refreshHighlights();
      toast.success("Highlight removed");
    } catch {
      toast.error("Unable to remove highlight");
    }
  };

  const shareSelection = async () => {
    if (!passage || selectedVerseRefs.length === 0) return;
    const selectedVerses = passage.verses.filter((v) => selectedSet.has(v.ref));
    if (!selectedVerses.length) return;

    const citation = formatSelectionCitation(selectedVerses);
    const content = `${selectedVerses.map((v) => v.text).join("\n")}\n\n${citation} (${translation})`;
    try {
      if (navigator.share) {
        await navigator.share({ title: currentReference, text: content });
      } else {
        await navigator.clipboard.writeText(content);
      }
      toast.success("Selection copied");
    } catch {
      toast.error("Unable to share selection");
    }
  };

  const openCompareModal = () => {
    if (!compareEnabled || !compareTranslation) {
      toast.error("Enable compare and choose a translation first");
      return;
    }
    if (!selectedVerseRefs.length) {
      toast.error("Select one or more verses first");
      return;
    }
    if (!comparePassage) {
      toast.error("Comparison passage is still loading");
      return;
    }
    setIsCompareModalOpen(true);
  };

  if (isLoading) return <LoadingSpinner message="Loading Bible module..." />;

  return (
    <div className="min-h-screen">
      <div className="fixed top-0 left-0 right-0 z-30">
        <div className="max-w-4xl mx-auto px-6 pt-4 pb-3 space-y-3">
          <div className="glass-strong p-3 rounded-2xl relative">
            <button onClick={() => navigate("/")} className="text-sm text-foreground-muted hover:text-foreground">&lt; Home</button>
            <h1 className="text-2xl font-light text-foreground absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 whitespace-nowrap">
              Bible Studio
            </h1>
          </div>

          <div className="glass-strong p-3 rounded-2xl">
            <div className="flex items-center gap-2 overflow-x-auto">
              <select
                value={book}
                onChange={(e) => void onBookChange(e.target.value)}
                className="min-w-[150px] h-9 px-2 rounded-lg glass border border-glass-border bg-input-background text-foreground text-sm"
              >
                {BOOKS.map((b) => <option key={b.name} value={b.name}>{b.name}</option>)}
              </select>
              <select
                value={chapter}
                onChange={(e) => void onChapterChange(e.target.value)}
                className="w-20 h-9 px-2 rounded-lg glass border border-glass-border bg-input-background text-foreground text-sm"
              >
                {chapterOptions.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <select
                value={translation}
                onChange={(e) => void onTranslationChange(e.target.value)}
                className="min-w-[84px] h-9 px-2 rounded-lg glass border border-glass-border bg-input-background text-foreground text-sm"
              >
                {(bootstrap?.supportedTranslations ?? []).map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              {isLoadingPassage && <span className="text-xs text-foreground-muted">Loading...</span>}
            </div>
          </div>
        </div>
      </div>

      <div className={`fixed left-0 right-0 z-30 ${selectedVerseRefs.length > 0 ? "bottom-32" : "bottom-16"}`}>
        <div className="max-w-4xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 glass-strong p-2 rounded-2xl border border-glass-border">
            <button
              onClick={() => void onCompareToggle()}
              className={`w-10 h-10 rounded-full border flex items-center justify-center ${compareEnabled ? "bg-primary/20 border-primary/50" : "glass border-glass-border"}`}
              aria-label="Toggle compare translation"
              title="Compare translation"
            >
              <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M3 7h8M3 12h6M3 17h8M13 7h8M15 12h6M13 17h8" />
              </svg>
            </button>
            {compareEnabled && (
              <select
                value={compareTranslation}
                onChange={(e) => void onCompareTranslationChange(e.target.value as Translation | "")}
                className="min-w-[110px] h-10 px-2 rounded-lg glass border border-glass-border bg-input-background text-foreground text-sm"
              >
                <option value="">Off</option>
                {(bootstrap?.supportedTranslations ?? []).filter((t) => t !== translation).map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            )}
          </div>
        </div>
      </div>

      {selectedVerseRefs.length > 0 && (
        <div className="fixed left-0 right-0 bottom-16 z-30">
          <div className="max-w-4xl mx-auto px-6">
            <div className="glass-strong p-2 rounded-2xl border border-glass-border flex items-center gap-2 overflow-x-auto">
              <span className="text-[11px] text-foreground-muted px-1 whitespace-nowrap">{selectedVerseRefs.length} selected</span>

              {HIGHLIGHT_COLORS.map((c) => (
                <button
                  key={c.key}
                  onClick={() => void applyHighlight(c.key)}
                  className={`w-7 h-7 rounded-full border ${activeColor === c.key ? "border-white" : "border-white/30"}`}
                  style={{
                    backgroundColor:
                      c.key === "amber" ? "#f59e0b" :
                      c.key === "mint" ? "#10b981" :
                      c.key === "sky" ? "#0ea5e9" :
                      c.key === "rose" ? "#f43f5e" : "#8b5cf6",
                  }}
                  aria-label={`Highlight ${c.label}`}
                  title={c.label}
                />
              ))}

              {compareEnabled && (
                <button
                  onClick={openCompareModal}
                  className="w-10 h-10 rounded-full glass border border-glass-border flex items-center justify-center"
                  aria-label="Open compare"
                  title="Compare selected verses"
                >
                  <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M3 7h8M3 12h6M3 17h8M13 7h8M15 12h6M13 17h8" />
                  </svg>
                </button>
              )}

              <button
                onClick={() => void clearHighlights()}
                className="w-10 h-10 rounded-full glass border border-glass-border flex items-center justify-center"
                aria-label="Remove highlight"
                title="Remove highlight"
              >
                <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 7h12M9 7v10m6-10v10M8 7l1-2h6l1 2M8 17h8" />
                </svg>
              </button>

              <button
                onClick={() => void shareSelection()}
                className="w-10 h-10 rounded-full glass border border-glass-border flex items-center justify-center"
                aria-label="Share selection"
                title="Share selection"
              >
                <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 16V7M8 11l4-4 4 4M5 13v5h14v-5" />
                </svg>
              </button>

              <button
                onClick={() => {
                  setSelectedVerseRefs([]);
                  setIsCompareModalOpen(false);
                }}
                className="w-10 h-10 rounded-full glass border border-glass-border flex items-center justify-center"
                aria-label="Clear selection"
                title="Clear selection"
              >
                <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`max-w-4xl mx-auto p-6 space-y-5 ${selectedVerseRefs.length > 0 ? "pt-44 pb-44" : "pt-44 pb-32"}`}>

        {passage && (
          <div className="grid gap-4 grid-cols-1">
            <div className="glass p-4 rounded-2xl border border-glass-border">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-medium text-foreground">{passage.ref}</h2>
                <span className="text-xs text-foreground-muted">{passage.translation}</span>
              </div>
              <div className="space-y-0.5">
                {passage.verses.map((verse) => {
                  const selected = selectedVerseRefs.includes(verse.ref);
                  const highlight = highlightByRef.get(verse.ref);
                  const highlightStyle = highlight ? HIGHLIGHT_COLORS.find((x) => x.key === highlight.color) : undefined;
                  const bgClass = highlightStyle?.bgClass ?? "";
                  const showOtEcho = isOtEcho(verse.text);

                  return (
                    <button
                      key={verse.ref}
                      onClick={() => toggleVerseSelection(verse.ref)}
                      className={`w-full text-left rounded-lg px-2 py-2 border transition-colors ${selected ? "ring-2 ring-primary border-primary/30" : "border-transparent"}`}
                    >
                      <div className="flex items-start gap-2">
                        <p className="flex-1 leading-relaxed text-foreground">
                          <span className="text-xs align-super mr-1 text-foreground-subtle">{verse.verse}</span>
                          <span className={`px-1 rounded ${bgClass}`}>{verse.text}</span>
                        </p>
                        {showOtEcho && (
                          <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-secondary text-foreground-muted">OT Echo</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        )}
      </div>

      {isCompareModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 px-4 py-6" onClick={() => setIsCompareModalOpen(false)}>
          <div
            className="max-w-3xl mx-auto glass-strong rounded-2xl border border-glass-border p-4 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-medium text-foreground">Compare Selected Verses</h2>
              <button
                onClick={() => setIsCompareModalOpen(false)}
                className="w-9 h-9 rounded-full glass border border-glass-border flex items-center justify-center"
                aria-label="Close compare"
              >
                <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-foreground-muted mb-4">
              {translation} vs {compareTranslation || "Off"}
            </p>
            {isLoadingCompare ? (
              <p className="text-sm text-foreground-muted">Loading comparison translation...</p>
            ) : (
              <div className="space-y-3">
                {selectedPrimaryVerses.map((verse) => {
                  const compareVerse = selectedCompareVerses.find((v) => v.ref === verse.ref);
                  return (
                    <div key={verse.ref} className="rounded-xl border border-glass-border p-3 bg-black/[0.05]">
                      <p className="text-xs text-foreground-muted mb-2">{verse.ref}</p>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div>
                          <p className="text-[11px] uppercase tracking-wide text-foreground-subtle mb-1">{translation}</p>
                          <p className="text-sm leading-relaxed text-foreground">{verse.text}</p>
                        </div>
                        <div>
                          <p className="text-[11px] uppercase tracking-wide text-foreground-subtle mb-1">{compareTranslation}</p>
                          <p className="text-sm leading-relaxed text-foreground">{compareVerse?.text ?? "Not available"}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function parseChapterVerse(ref: string): { chapter: number; verse: number } | null {
  const match = ref.match(/(\d+):(\d+)$/);
  if (!match) return null;
  return { chapter: Number.parseInt(match[1], 10), verse: Number.parseInt(match[2], 10) };
}

function formatSelectionCitation(verses: Array<{ ref: string }>): string {
  if (verses.length === 0) return "";
  const refs = verses.map((v) => v.ref);
  const parsed = refs.map(parseChapterVerse);
  const allParsed = parsed.every((p) => p !== null);
  if (!allParsed) return refs.join(", ");

  const values = parsed as Array<{ chapter: number; verse: number }>;
  const first = values[0];
  const sameChapter = values.every((v) => v.chapter === first.chapter);
  const sequential = values.every((v, idx) => idx === 0 || v.verse === values[idx - 1].verse + 1);

  if (sameChapter && sequential) {
    const firstVerse = values[0].verse;
    const lastVerse = values[values.length - 1].verse;
    const prefix = refs[0].replace(/:\d+$/, "");
    return firstVerse === lastVerse ? `${prefix}:${firstVerse}` : `${prefix}:${firstVerse}-${lastVerse}`;
  }

  return refs.join(", ");
}
