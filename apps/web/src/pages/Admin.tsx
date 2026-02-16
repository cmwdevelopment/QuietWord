import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { api } from "../lib/api";
import type { AdminOverview } from "../lib/types";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { PrimaryButton } from "../components/PrimaryButton";

export function AdminPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<AdminOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void load();
  }, []);

  const load = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.getAdminOverview(150);
      setData(response);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load admin overview.";
      setError(message);
      toast.error("Unable to load admin overview.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading admin overview..." />;
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-lg w-full glass-strong p-8 rounded-2xl space-y-4">
          <h1 className="text-xl font-medium text-foreground">Admin overview unavailable</h1>
          <p className="text-sm text-foreground-muted">{error ?? "Unexpected response."}</p>
          <div className="flex gap-3">
            <PrimaryButton onClick={() => navigate("/")} variant="secondary">Home</PrimaryButton>
            <PrimaryButton onClick={() => void load()}>Retry</PrimaryButton>
          </div>
        </div>
      </div>
    );
  }

  const { summary, users } = data;

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto p-6 pb-16 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light text-foreground">Admin</h1>
            <p className="text-sm text-foreground-muted">Users, settings, and activity metrics.</p>
          </div>
          <button onClick={() => navigate("/")} className="text-sm text-foreground-muted hover:text-foreground">Back to Home</button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="glass p-4 rounded-xl"><p className="text-xs text-foreground-subtle">Total users</p><p className="text-2xl text-foreground">{summary.totalUsers}</p></div>
          <div className="glass p-4 rounded-xl"><p className="text-xs text-foreground-subtle">New (7d)</p><p className="text-2xl text-foreground">{summary.newUsersLast7Days}</p></div>
          <div className="glass p-4 rounded-xl"><p className="text-xs text-foreground-subtle">Active sessions</p><p className="text-2xl text-foreground">{summary.activeSessions}</p></div>
          <div className="glass p-4 rounded-xl"><p className="text-xs text-foreground-subtle">Readers active (7d)</p><p className="text-2xl text-foreground">{summary.usersWithCompletionsLast7Days}</p></div>
        </div>

        <div className="glass-strong rounded-2xl overflow-hidden border border-glass-border">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-glass-highlight">
                <tr className="text-left">
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Plan / Day</th>
                  <th className="px-4 py-3">Completions</th>
                  <th className="px-4 py-3">Settings</th>
                  <th className="px-4 py-3">Usage</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.userId} className="border-t border-glass-border align-top">
                    <td className="px-4 py-3">
                      <p className="text-foreground font-medium">{u.email}</p>
                      <p className="text-xs text-foreground-subtle">{new Date(u.createdAt).toLocaleString()}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-foreground">{u.activePlanSlug ?? "none"}</p>
                      <p className="text-xs text-foreground-subtle">Day {u.currentDayIndex}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-foreground">{u.totalCompletions}</p>
                      <p className="text-xs text-foreground-subtle">{u.completedToday ? "Completed today" : "Not completed today"}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-foreground-subtle">{u.settings.translation} / {u.settings.pace}</p>
                      <p className="text-xs text-foreground-subtle">{u.settings.fontFamily}</p>
                      <p className="text-xs text-foreground-subtle">{u.settings.listeningVoice} / {u.settings.listeningStyle}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-foreground-subtle">Notes: {u.notesCount}</p>
                      <p className="text-xs text-foreground-subtle">Feedback: {u.feedbackCount}</p>
                      <p className="text-xs text-foreground-subtle">Sessions: {u.activeSessions}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

