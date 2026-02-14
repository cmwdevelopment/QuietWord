// QuietWord API Client

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
  AuthMe,
  Feedback,
  CreateFeedbackPayload,
} from "./types";
import { config } from "./config";
import { mockApi } from "./mock-api";

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseUrl}/api${endpoint}`;
    const response = await fetch(url, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      if (response.status === 401 && !endpoint.startsWith("/auth/")) {
        window.location.assign("/signin");
      }

      const bodyText = await response.text();
      const message = bodyText || `${response.status} ${response.statusText}`;
      throw new Error(`API Error: ${message}`);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return null as T;
    }

    return response.json();
  }

  async login(email: string): Promise<AuthMe> {
    if (config.isDemoMode) return { userId: "demo-user", email };
    return this.request<AuthMe>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async me(): Promise<AuthMe> {
    if (config.isDemoMode) return { userId: "demo-user", email: "demo@quietword.local" };
    return this.request<AuthMe>("/auth/me");
  }

  async logout(): Promise<{ loggedOut: boolean }> {
    if (config.isDemoMode) return { loggedOut: true };
    return this.request<{ loggedOut: boolean }>("/auth/logout", { method: "POST" });
  }

  // Bootstrap - get all initial app data
  async bootstrap(): Promise<BootstrapData> {
    if (config.isDemoMode) return mockApi.bootstrap();
    return this.request<BootstrapData>("/bootstrap");
  }

  // Get today's reading
  async getToday(): Promise<TodayReading> {
    if (config.isDemoMode) return mockApi.getToday();
    return this.request<TodayReading>("/day/today");
  }

  // Fetch a passage
  async getPassage(ref: string, translation: Translation): Promise<Passage> {
    if (config.isDemoMode) return mockApi.getPassage(ref, translation);
    const params = new URLSearchParams({ ref, translation });
    return this.request<Passage>(`/passage?${params}`);
  }

  // Save resume state
  async saveResumeState(payload: ResumeStatePayload): Promise<{ saved: boolean }> {
    if (config.isDemoMode) return mockApi.saveResumeState(payload);
    return this.request("/state/resume", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  // Create a note
  async createNote(payload: CreateNotePayload): Promise<Note> {
    if (config.isDemoMode) return mockApi.createNote(payload);
    return this.request<Note>("/notes", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  // Get notes
  async getNotes(limit = 10): Promise<Note[]> {
    if (config.isDemoMode) return mockApi.getNotes(limit);
    return this.request<Note[]>(`/notes?limit=${limit}`);
  }

  // Complete today's reading
  async completeDay(): Promise<CompleteDayResponse> {
    if (config.isDemoMode) return mockApi.completeDay();
    return this.request<CompleteDayResponse>("/day/complete", {
      method: "POST",
    });
  }

  // Get pending recall
  async getPendingRecall(): Promise<PendingRecall | null> {
    if (config.isDemoMode) return mockApi.getPendingRecall();
    return this.request<PendingRecall | null>("/recall/pending");
  }

  // Submit recall answer
  async submitRecallAnswer(payload: RecallAnswerPayload): Promise<RecallAnswerResponse> {
    if (config.isDemoMode) return mockApi.submitRecallAnswer(payload);
    return this.request<RecallAnswerResponse>("/recall/answer", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  // Get settings
  async getSettings(): Promise<Settings> {
    if (config.isDemoMode) return mockApi.getSettings();
    return this.request<Settings>("/settings");
  }

  // Update settings
  async updateSettings(payload: Partial<Settings>): Promise<Settings> {
    if (config.isDemoMode) return mockApi.updateSettings(payload);
    return this.request<Settings>("/settings", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async synthesizeAudio(payload: { text: string; voice?: string; speed?: number }): Promise<Blob> {
    if (config.isDemoMode) {
      throw new Error("Audio synthesis is unavailable in demo mode.");
    }

    const url = `${this.baseUrl}/api/audio/synthesize`;
    const response = await fetch(url, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const bodyText = await response.text();
      throw new Error(bodyText || `API Error: ${response.status}`);
    }

    return response.blob();
  }

  async createFeedback(payload: CreateFeedbackPayload): Promise<Feedback> {
    if (config.isDemoMode) return mockApi.createFeedback(payload);
    return this.request<Feedback>("/feedback", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async getFeedback(limit = 20): Promise<Feedback[]> {
    if (config.isDemoMode) return mockApi.getFeedback(limit);
    return this.request<Feedback[]>(`/feedback?limit=${limit}`);
  }
}

export const api = new ApiClient(config.apiBaseUrl);
