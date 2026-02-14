export type ReadingSection = "john" | "psalm";
export type Translation = "WEB" | "KJV" | "ASV" | "BBE" | "DARBY";
export type Pace = "short" | "standard";
export type NoteType = "question" | "promise" | "conviction" | "action" | "comfort";

export interface UserSettings {
  translation: Translation;
  pace: Pace;
  reminderTime: string;
}

export interface PlanSummary {
  planId: string;
  slug: string;
  name: string;
  totalDays: number;
  currentDayIndex: number;
}

export interface TodaySummary {
  dayIndex: number;
  johnRef: string;
  psalmRef: string;
  theme: string;
  completedToday: boolean;
  streak: number;
  graceStreak: boolean;
}

export interface ResumeSummary {
  section: ReadingSection;
  lastRef: string;
  lastChunkIndex: number;
  verseAnchor?: string | null;
  updatedAt: string;
}

export interface RecallPendingSummary {
  recallId: string;
  dayIndex: number;
  choices: string[];
}

export interface BootstrapResponse {
  plan: PlanSummary;
  settings: UserSettings;
  today: TodaySummary;
  resume?: ResumeSummary | null;
  pendingRecall?: RecallPendingSummary | null;
  supportedTranslations: Translation[];
  translationMicrocopy: string;
}

export interface Verse {
  ref: string;
  text: string;
  chapter: number;
  verse: number;
}

export interface PassageChunk {
  chunkIndex: number;
  verseRefs: string[];
  text: string;
}

export interface PassageResponse {
  ref: string;
  translation: Translation;
  verses: Verse[];
  chunks: PassageChunk[];
}

export interface DayTodayResponse {
  dayIndex: number;
  johnRef: string;
  psalmRef: string;
  theme: string;
}

export interface Note {
  id: string;
  noteType: NoteType;
  ref: string;
  body: string;
  createdAt: string;
}

export interface CompleteDayResponse {
  previousDayIndex: number;
  newCurrentDayIndex: number;
  createdRecall: boolean;
}

export interface RecallPendingResponse {
  recallId: string;
  dayIndex: number;
  choices: string[];
}
