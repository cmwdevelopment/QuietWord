// Mock API Client for Demo Mode
// This allows exploring the UI/UX without a backend connection

import type {
  BootstrapData,
  Passage,
  Translation,
  ResumeStatePayload,
  CreateNotePayload,
  Note,
  CompleteDayResponse,
  PendingRecall,
  RecallAnswerPayload,
  RecallAnswerResponse,
  Settings,
  TodayReading,
  Feedback,
  CreateFeedbackPayload,
  AdminOverview,
  BibleHighlightsResponse,
  VerseHighlight,
} from "./types";
import { DEFAULT_TRANSLATIONS } from "./translations";

// Mock data store
let mockState = {
  dayIndex: 0,
  completedToday: false,
  streak: 3,
  graceStreak: 0,
  settings: {
    translation: "WEB" as Translation,
    pace: "standard" as "short" | "standard",
    reminderTime: "08:00",
    fontFamily: "Roboto",
    recapVoice: "classic_pastor" as const,
    accentColor: "teal_calm",
    listeningEnabled: false,
    listeningVoice: "warm_guide" as const,
    listeningStyle: "calm_presence" as const,
    listeningSpeed: 1.0,
  },
  resume: {
    section: "John" as "John" | "Psalm",
    lastRef: "John 1:1-14",
    lastChunkIndex: 2,
    verseAnchor: "John 1:5",
    updatedAt: new Date().toISOString(),
  },
  pendingRecall: {
    recallId: "recall-1",
    dayIndex: 0,
    choices: [
      { text: "Jesus began his ministry by turning water into wine at a wedding", isCorrect: false },
      { text: "John the Baptist testified that Jesus is the Lamb of God", isCorrect: true },
      { text: "Jesus called his first disciples while they were fishing", isCorrect: false },
    ],
  },
  notes: [] as Note[],
  feedback: [] as Feedback[],
  highlights: [] as VerseHighlight[],
};

// Mock passages
const mockPassages: Record<string, Passage> = {
  "John 1:1-14": {
    ref: "John 1:1-14",
    translation: "WEB",
    verses: [
      { ref: "John 1:1", text: "In the beginning was the Word, and the Word was with God, and the Word was God.", chapter: 1, verse: 1 },
      { ref: "John 1:2", text: "The same was in the beginning with God.", chapter: 1, verse: 2 },
      { ref: "John 1:3", text: "All things were made through him. Without him, nothing was made that has been made.", chapter: 1, verse: 3 },
      { ref: "John 1:4", text: "In him was life, and the life was the light of men.", chapter: 1, verse: 4 },
      { ref: "John 1:5", text: "The light shines in the darkness, and the darkness hasn't overcome it.", chapter: 1, verse: 5 },
      { ref: "John 1:6", text: "There came a man sent from God, whose name was John.", chapter: 1, verse: 6 },
      { ref: "John 1:7", text: "The same came as a witness, that he might testify about the light, that all might believe through him.", chapter: 1, verse: 7 },
      { ref: "John 1:8", text: "He was not the light, but was sent that he might testify about the light.", chapter: 1, verse: 8 },
      { ref: "John 1:9", text: "The true light that enlightens everyone was coming into the world.", chapter: 1, verse: 9 },
      { ref: "John 1:10", text: "He was in the world, and the world was made through him, and the world didn't recognize him.", chapter: 1, verse: 10 },
      { ref: "John 1:11", text: "He came to his own, and those who were his own didn't receive him.", chapter: 1, verse: 11 },
      { ref: "John 1:12", text: "But as many as received him, to them he gave the right to become God's children, to those who believe in his name.", chapter: 1, verse: 12 },
      { ref: "John 1:13", text: "These were born, not of blood, nor of the will of the flesh, nor of the will of man, but of God.", chapter: 1, verse: 13 },
      { ref: "John 1:14", text: "The Word became flesh and lived among us. We saw his glory, such glory as of the only born Son of the Father, full of grace and truth.", chapter: 1, verse: 14 },
    ],
    chunks: [
      {
        chunkIndex: 0,
        verseRefs: ["John 1:1", "John 1:2", "John 1:3"],
        text: "In the beginning was the Word, and the Word was with God, and the Word was God.\n\nThe same was in the beginning with God.\n\nAll things were made through him. Without him, nothing was made that has been made.",
      },
      {
        chunkIndex: 1,
        verseRefs: ["John 1:4", "John 1:5"],
        text: "In him was life, and the life was the light of men.\n\nThe light shines in the darkness, and the darkness hasn't overcome it.",
      },
      {
        chunkIndex: 2,
        verseRefs: ["John 1:6", "John 1:7", "John 1:8"],
        text: "There came a man sent from God, whose name was John.\n\nThe same came as a witness, that he might testify about the light, that all might believe through him.\n\nHe was not the light, but was sent that he might testify about the light.",
      },
      {
        chunkIndex: 3,
        verseRefs: ["John 1:9", "John 1:10", "John 1:11"],
        text: "The true light that enlightens everyone was coming into the world.\n\nHe was in the world, and the world was made through him, and the world didn't recognize him.\n\nHe came to his own, and those who were his own didn't receive him.",
      },
      {
        chunkIndex: 4,
        verseRefs: ["John 1:12", "John 1:13", "John 1:14"],
        text: "But as many as received him, to them he gave the right to become God's children, to those who believe in his name.\n\nThese were born, not of blood, nor of the will of the flesh, nor of the will of man, but of God.\n\nThe Word became flesh and lived among us. We saw his glory, such glory as of the only born Son of the Father, full of grace and truth.",
      },
    ],
  },
  "Psalm 23:1-6": {
    ref: "Psalm 23:1-6",
    translation: "WEB",
    verses: [
      { ref: "Psalm 23:1", text: "Yahweh is my shepherd; I shall lack nothing.", chapter: 23, verse: 1 },
      { ref: "Psalm 23:2", text: "He makes me lie down in green pastures. He leads me beside still waters.", chapter: 23, verse: 2 },
      { ref: "Psalm 23:3", text: "He restores my soul. He guides me in the paths of righteousness for his name's sake.", chapter: 23, verse: 3 },
      { ref: "Psalm 23:4", text: "Even though I walk through the valley of the shadow of death, I will fear no evil, for you are with me. Your rod and your staff, they comfort me.", chapter: 23, verse: 4 },
      { ref: "Psalm 23:5", text: "You prepare a table before me in the presence of my enemies. You anoint my head with oil. My cup runs over.", chapter: 23, verse: 5 },
      { ref: "Psalm 23:6", text: "Surely goodness and loving kindness shall follow me all the days of my life, and I will dwell in Yahweh's house forever.", chapter: 23, verse: 6 },
    ],
    chunks: [
      {
        chunkIndex: 0,
        verseRefs: ["Psalm 23:1", "Psalm 23:2"],
        text: "Yahweh is my shepherd; I shall lack nothing.\n\nHe makes me lie down in green pastures. He leads me beside still waters.",
      },
      {
        chunkIndex: 1,
        verseRefs: ["Psalm 23:3", "Psalm 23:4"],
        text: "He restores my soul. He guides me in the paths of righteousness for his name's sake.\n\nEven though I walk through the valley of the shadow of death, I will fear no evil, for you are with me. Your rod and your staff, they comfort me.",
      },
      {
        chunkIndex: 2,
        verseRefs: ["Psalm 23:5", "Psalm 23:6"],
        text: "You prepare a table before me in the presence of my enemies. You anoint my head with oil. My cup runs over.\n\nSurely goodness and loving kindness shall follow me all the days of my life, and I will dwell in Yahweh's house forever.",
      },
    ],
  },
};

class MockApiClient {
  private delay(ms: number = 300) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async bootstrap(): Promise<BootstrapData> {
    await this.delay();
    return {
      plan: {
        planId: "plan-1",
        slug: "john-psalms-90",
        name: "John + Psalms",
        totalDays: 90,
        currentDayIndex: mockState.dayIndex,
      },
      settings: mockState.settings,
      today: {
        dayIndex: mockState.dayIndex,
        johnRef: "John 1:1-14",
        psalmRef: "Psalm 23:1-6",
        theme: "The Word became flesh and dwelt among us",
        dailyRecap: "Today, the Word draws near and the Shepherd leads gently. Receive both truth and rest.",
        completedToday: mockState.completedToday,
        streak: mockState.streak,
        graceStreak: mockState.graceStreak,
      },
      resume: mockState.completedToday ? null : mockState.resume,
      pendingRecall: mockState.pendingRecall,
      supportedTranslations: DEFAULT_TRANSLATIONS,
      supportedRecapVoices: ["classic_pastor", "gen_z", "poetic", "coach", "scholar"],
      supportedAccentColors: ["teal_calm", "sage_mist", "sky_blue", "lavender_hush", "rose_dawn", "sand_warm"],
      supportedListeningVoices: ["warm_guide", "calm_narrator", "pastoral", "youthful", "classic"],
      supportedListeningStyles: ["calm_presence", "conversational_shepherd", "reflective_reading", "resonant_orator", "revival_fire"],
      translationMicrocopy: "More translations coming as licensing allows.",
      appVersion: "0.6.0",
      isAdmin: true,
    };
  }

  async getToday(): Promise<TodayReading> {
    await this.delay();
    return {
      dayIndex: mockState.dayIndex,
      johnRef: "John 1:1-14",
      psalmRef: "Psalm 23:1-6",
      theme: "The Word became flesh and dwelt among us",
      dailyRecap: "Today, the Word draws near and the Shepherd leads gently. Receive both truth and rest.",
      completedToday: mockState.completedToday,
      streak: mockState.streak,
      graceStreak: mockState.graceStreak,
    };
  }

  async getPassage(ref: string, translation: Translation): Promise<Passage> {
    await this.delay();
    const passage = mockPassages[ref];
    if (!passage) {
      throw new Error(`Passage not found: ${ref}`);
    }
    return { ...passage, translation };
  }

  async saveResumeState(payload: ResumeStatePayload): Promise<{ saved: boolean }> {
    await this.delay(100);
    mockState.resume = {
      ...payload,
      verseAnchor: payload.verseAnchor,
      updatedAt: new Date().toISOString(),
    };
    return { saved: true };
  }

  async createNote(payload: CreateNotePayload): Promise<Note> {
    await this.delay(200);
    const note: Note = {
      id: `note-${Date.now()}`,
      ...payload,
      createdAt: new Date().toISOString(),
    };
    mockState.notes.unshift(note);
    return note;
  }

  async getNotes(limit = 10): Promise<Note[]> {
    await this.delay();
    return mockState.notes.slice(0, limit);
  }

  async completeDay(): Promise<CompleteDayResponse> {
    await this.delay();
    const previousDayIndex = mockState.dayIndex;
    mockState.dayIndex += 1;
    mockState.completedToday = false;
    mockState.streak += 1;
    mockState.resume = {
      section: "John",
      lastRef: "John 1:15-28",
      lastChunkIndex: 0,
      updatedAt: new Date().toISOString(),
    };

    const newRecall: PendingRecall = {
      recallId: `recall-${mockState.dayIndex}`,
      dayIndex: previousDayIndex,
      choices: [
        { text: "The Word was in the beginning with God", isCorrect: true },
        { text: "John the Baptist was the light of the world", isCorrect: false },
        { text: "All who believed received eternal life immediately", isCorrect: false },
      ],
    };
    mockState.pendingRecall = newRecall;

    return {
      previousDayIndex,
      newCurrentDayIndex: mockState.dayIndex,
      createdRecall: newRecall,
    };
  }

  async getPendingRecall(): Promise<PendingRecall | null> {
    await this.delay();
    return mockState.pendingRecall;
  }

  async submitRecallAnswer(payload: RecallAnswerPayload): Promise<RecallAnswerResponse> {
    await this.delay(200);
    const isCorrect = mockState.pendingRecall?.choices[payload.selectedChoiceIndex]?.isCorrect || false;
    mockState.pendingRecall = null;
    return {
      saved: true,
      correct: isCorrect,
    };
  }

  async getSettings(): Promise<Settings> {
    await this.delay();
    return mockState.settings;
  }

  async updateSettings(payload: Partial<Settings>): Promise<Settings> {
    await this.delay(200);
    mockState.settings = { ...mockState.settings, ...payload };
    return mockState.settings;
  }

  async createFeedback(payload: CreateFeedbackPayload): Promise<Feedback> {
    await this.delay(150);
    const item: Feedback = {
      id: `feedback-${Date.now()}`,
      category: payload.category,
      rating: payload.rating,
      message: payload.message,
      contextPath: payload.contextPath,
      createdAt: new Date().toISOString(),
    };
    mockState.feedback.unshift(item);
    return item;
  }

  async getFeedback(limit = 20): Promise<Feedback[]> {
    await this.delay(120);
    return mockState.feedback.slice(0, limit);
  }

  async getAdminOverview(_limit = 100): Promise<AdminOverview> {
    await this.delay(200);
    return {
      summary: {
        totalUsers: 3,
        newUsersLast7Days: 2,
        activeSessions: 2,
        usersWithCompletionsLast7Days: 2,
      },
      users: [
        {
          userId: "u1",
          email: "admin@quietword.org",
          createdAt: new Date().toISOString(),
          activePlanSlug: "john-psalms-30",
          currentDayIndex: 2,
          completedToday: false,
          totalCompletions: 1,
          lastCompletionAt: new Date(Date.now() - 86400000).toISOString(),
          notesCount: 3,
          feedbackCount: 1,
          activeSessions: 1,
          settings: { ...mockState.settings }
        }
      ],
      generatedAtUtc: new Date().toISOString()
    };
  }

  async getBibleHighlights(ref: string, translation: Translation): Promise<BibleHighlightsResponse> {
    await this.delay(120);
    const passage = await this.getPassage(ref, translation);
    const verseSet = new Set(passage.verses.map((v) => v.ref));
    return {
      ref,
      translation,
      highlights: mockState.highlights.filter((h) => h.translation === translation && verseSet.has(h.verseRef)),
    };
  }

  async saveBibleHighlight(payload: { translation: Translation; verseRef: string; color: VerseHighlight["color"] }): Promise<VerseHighlight> {
    await this.delay(80);
    const existing = mockState.highlights.find((h) => h.translation === payload.translation && h.verseRef === payload.verseRef);
    if (existing) {
      existing.color = payload.color;
      existing.updatedAt = new Date().toISOString();
      return existing;
    }

    const next: VerseHighlight = {
      id: `hl-${Date.now()}`,
      translation: payload.translation,
      verseRef: payload.verseRef,
      color: payload.color,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockState.highlights.push(next);
    return next;
  }

  async deleteBibleHighlight(translation: Translation, verseRef: string): Promise<{ deleted: boolean }> {
    await this.delay(60);
    const before = mockState.highlights.length;
    mockState.highlights = mockState.highlights.filter((h) => !(h.translation === translation && h.verseRef === verseRef));
    return { deleted: mockState.highlights.length < before };
  }
}

export const mockApi = new MockApiClient();
