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
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return null as T;
    }

    return response.json();
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
}

export const api = new ApiClient(config.apiBaseUrl);