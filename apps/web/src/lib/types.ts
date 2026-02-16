// QuietWord API Types

export type Translation = string;
export type Pace = "short" | "standard";
export type Section = "John" | "Psalm";
export type NoteType = "Question" | "Promise" | "Conviction" | "Action" | "Comfort";
export type RecapVoice = "classic_pastor" | "gen_z" | "poetic" | "coach" | "scholar";
export type ListeningVoice = "warm_guide" | "calm_narrator" | "pastoral" | "youthful" | "classic";
export type ListeningStyle =
  | "calm_presence"
  | "conversational_shepherd"
  | "reflective_reading"
  | "resonant_orator"
  | "revival_fire";

export interface Plan {
  planId: string;
  slug: string;
  name: string;
  totalDays: number;
  currentDayIndex: number;
}

export interface Settings {
  translation: Translation;
  pace: Pace;
  reminderTime: string;
  fontFamily?: string;
  recapVoice?: RecapVoice;
  accentColor?: string;
  listeningEnabled?: boolean;
  listeningVoice?: ListeningVoice;
  listeningStyle?: ListeningStyle;
  listeningSpeed?: number;
}

export interface TodayReading {
  dayIndex: number;
  johnRef: string;
  psalmRef: string;
  theme: string;
  dailyRecap: string;
  completedToday: boolean;
  streak: number;
  graceStreak: number;
}

export interface Resume {
  section: Section;
  lastRef: string;
  lastChunkIndex: number;
  verseAnchor?: string;
  updatedAt: string;
}

export interface RecallChoice {
  text: string;
  isCorrect?: boolean;
}

export interface PendingRecall {
  recallId: string;
  dayIndex: number;
  choices: Array<RecallChoice | string>;
}

export interface BootstrapData {
  plan: Plan;
  settings: Settings;
  today: TodayReading;
  resume: Resume | null;
  pendingRecall: PendingRecall | null;
  supportedTranslations: Translation[];
  supportedRecapVoices: RecapVoice[];
  supportedAccentColors?: string[];
  supportedListeningVoices?: ListeningVoice[];
  supportedListeningStyles?: ListeningStyle[];
  translationMicrocopy: string;
  appVersion: string;
  isAdmin: boolean;
}

export interface Verse {
  ref: string;
  text: string;
  chapter: number;
  verse: number;
}

export interface Chunk {
  chunkIndex: number;
  verseRefs: string[];
  text: string;
}

export interface Passage {
  ref: string;
  translation: Translation;
  verses: Verse[];
  chunks: Chunk[];
}

export interface Note {
  id: string;
  noteType: NoteType;
  ref: string;
  body: string;
  createdAt: string;
}

export interface ResumeStatePayload {
  section: Section;
  ref: string;
  chunkIndex: number;
  verseAnchor?: string;
}

export interface CreateNotePayload {
  noteType: NoteType;
  ref: string;
  body: string;
}

export interface CompleteDayResponse {
  previousDayIndex: number;
  newCurrentDayIndex: number;
  createdRecall: PendingRecall;
}

export interface RecallAnswerPayload {
  recallId: string;
  selectedChoiceIndex: number;
}

export interface RecallAnswerResponse {
  saved: boolean;
  correct: boolean;
}

export interface AuthMe {
  userId: string;
  email: string;
}

export interface Feedback {
  id: string;
  category: string;
  rating: number;
  message: string;
  contextPath?: string;
  createdAt: string;
}

export interface CreateFeedbackPayload {
  category: string;
  rating: number;
  message: string;
  contextPath?: string;
}

export interface AdminSummary {
  totalUsers: number;
  newUsersLast7Days: number;
  activeSessions: number;
  usersWithCompletionsLast7Days: number;
}

export interface AdminUser {
  userId: string;
  email: string;
  createdAt: string;
  activePlanSlug?: string | null;
  currentDayIndex: number;
  completedToday: boolean;
  totalCompletions: number;
  lastCompletionAt?: string | null;
  notesCount: number;
  feedbackCount: number;
  activeSessions: number;
  settings: Settings;
}

export interface AdminOverview {
  summary: AdminSummary;
  users: AdminUser[];
  generatedAtUtc: string;
}
