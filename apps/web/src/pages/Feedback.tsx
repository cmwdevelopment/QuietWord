import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { api } from "../lib/api";
import type { Feedback } from "../lib/types";
import { PrimaryButton } from "../components/PrimaryButton";
import { LoadingSpinner } from "../components/LoadingSpinner";

const CATEGORIES = [
  { value: "general", label: "General" },
  { value: "bug", label: "Bug" },
  { value: "content", label: "Content" },
  { value: "ux", label: "UX" },
  { value: "feature", label: "Feature request" },
];

export function FeedbackPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [items, setItems] = useState<Feedback[]>([]);
  const [category, setCategory] = useState("general");
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");

  const loadFeedback = async () => {
    setIsLoading(true);
    try {
      const latest = await api.getFeedback(20);
      setItems(latest);
    } catch {
      toast.error("Unable to load previous feedback.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadFeedback();
  }, []);

  const submit = async () => {
    const body = message.trim();
    if (!body) {
      toast.error("Please enter feedback before submitting.");
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await api.createFeedback({
        category,
        rating,
        message: body,
        contextPath: window.location.pathname,
      });
      setItems((prev) => [created, ...prev].slice(0, 20));
      setMessage("");
      setRating(5);
      setCategory("general");
      toast.success("Thanks for the feedback.");
    } catch {
      toast.error("Could not submit feedback.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading feedback..." />;
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <button
          onClick={() => navigate("/")}
          className="text-foreground-muted hover:text-foreground text-sm transition-colors flex items-center gap-2"
        >
          <span aria-hidden="true">&lt;</span>
          Home
        </button>

        <div className="glass-strong p-6 rounded-2xl space-y-4">
          <h1 className="text-2xl font-light text-foreground">Feedback</h1>
          <p className="text-sm text-foreground-muted">Share bugs, friction, or ideas from your testing run.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs uppercase tracking-wide text-foreground-muted">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 w-full p-3 rounded-xl glass border border-glass-border bg-input-background"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wide text-foreground-muted">Rating (1-5)</label>
              <input
                type="number"
                min={1}
                max={5}
                value={rating}
                onChange={(e) => setRating(Math.max(1, Math.min(5, Number(e.target.value) || 1)))}
                className="mt-1 w-full p-3 rounded-xl glass border border-glass-border bg-input-background"
              />
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wide text-foreground-muted">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              maxLength={2000}
              className="mt-1 w-full p-3 rounded-xl glass border border-glass-border bg-input-background"
              placeholder="What worked? What felt off? What should change?"
            />
          </div>

          <PrimaryButton onClick={submit} disabled={isSubmitting} fullWidth>
            {isSubmitting ? "Submitting..." : "Submit feedback"}
          </PrimaryButton>
        </div>

        <div className="glass p-5 rounded-2xl space-y-3">
          <h2 className="text-base font-medium text-foreground">Recent submissions</h2>
          {items.length === 0 && (
            <p className="text-sm text-foreground-muted">No feedback submitted yet.</p>
          )}
          {items.map((item) => (
            <div key={item.id} className="p-3 rounded-xl border border-glass-border">
              <div className="text-xs text-foreground-muted uppercase tracking-wide">
                {item.category} · {item.rating}/5
              </div>
              <p className="text-sm text-foreground mt-1 whitespace-pre-wrap">{item.message}</p>
              <div className="text-xs text-foreground-subtle mt-2">
                {new Date(item.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
