import type {
  BootstrapResponse,
  CompleteDayResponse,
  DayTodayResponse,
  Note,
  NoteType,
  Pace,
  PassageResponse,
  ReadingSection,
  RecallPendingResponse,
  Translation,
  UserSettings
} from "./types";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    },
    ...init
  });

  if (response.status === 204) {
    return undefined as T;
  }

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return (await response.json()) as T;
}

export const api = {
  bootstrap: () => request<BootstrapResponse>("/api/bootstrap"),
  today: () => request<DayTodayResponse>("/api/day/today"),
  passage: (ref: string, translation: Translation) =>
    request<PassageResponse>(`/api/passage?ref=${encodeURIComponent(ref)}&translation=${translation}`),
  saveResume: (payload: {
    section: ReadingSection;
    ref: string;
    chunkIndex: number;
    verseAnchor?: string;
  }) => request<{ saved: boolean }>("/api/state/resume", { method: "POST", body: JSON.stringify(payload) }),
  saveNote: (payload: { noteType: NoteType; ref: string; body: string }) =>
    request<Note>("/api/notes", { method: "POST", body: JSON.stringify(payload) }),
  listNotes: (limit = 10) => request<Note[]>(`/api/notes?limit=${limit}`),
  completeDay: () => request<CompleteDayResponse>("/api/day/complete", { method: "POST" }),
  pendingRecall: () => request<RecallPendingResponse | undefined>("/api/recall/pending"),
  answerRecall: (recallId: string, selectedChoiceIndex: number) =>
    request<{ saved: boolean; correct: boolean }>("/api/recall/answer", {
      method: "POST",
      body: JSON.stringify({ recallId, selectedChoiceIndex })
    }),
  getSettings: () => request<UserSettings>("/api/settings"),
  saveSettings: (payload: { translation: Translation; pace: Pace; reminderTime: string }) =>
    request<UserSettings>("/api/settings", { method: "POST", body: JSON.stringify(payload) })
};
