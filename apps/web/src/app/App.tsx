// QuietWord main application entry

import { useEffect } from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { NetworkStatus } from "../components/NetworkStatus";
import { toast, Toaster } from "sonner";
import { applyFontPreference, getSavedFontPreference, saveFontPreference } from "../lib/fontPreferences";
import { applyAccentPreference, getSavedAccentPreference, saveAccentPreference } from "../lib/accentTheme";
import { api } from "../lib/api";

export default function App() {
  useEffect(() => {
    applyFontPreference(getSavedFontPreference());
    applyAccentPreference(getSavedAccentPreference());

    if (!window.location.pathname.startsWith("/signin")) {
      void (async () => {
        try {
          const settings = await api.getSettings();
          if (settings.fontFamily) {
            applyFontPreference(settings.fontFamily);
            saveFontPreference(settings.fontFamily);
          }
          if (settings.accentColor) {
            applyAccentPreference(settings.accentColor);
            saveAccentPreference(settings.accentColor);
          }
        } catch {
          // Keep local fallback when API is unavailable.
        }
      })();
    }

    const onToastClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("[data-sonner-toast]")) {
        toast.dismiss();
      }
    };

    document.addEventListener("click", onToastClick);
    return () => document.removeEventListener("click", onToastClick);
  }, []);

  return (
    <ErrorBoundary>
      <NetworkStatus />
      <RouterProvider router={router} />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "rgba(17, 22, 28, 0.85)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            color: "#F8FAFC",
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
            borderRadius: "14px"
          }
        }}
      />
    </ErrorBoundary>
  );
}
