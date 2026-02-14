// Environment configuration

export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
  // Enable demo mode when VITE_DEMO_MODE=true or no API URL is set
  isDemoMode: import.meta.env.VITE_DEMO_MODE === "true" || !import.meta.env.VITE_API_BASE_URL,
} as const;