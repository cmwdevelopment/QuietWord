// Shared loading spinner aligned with QuietWord glass theme

import React from "react";

export function LoadingSpinner({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="glass-strong rounded-3xl border border-glass-border px-8 py-7 text-center space-y-4 shadow-lg max-w-sm w-full">
        <div className="mx-auto relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary border-r-accent animate-spin" />
        </div>
        <p className="text-sm text-foreground-muted">{message}</p>
      </div>
    </div>
  );
}
