import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { api } from "../lib/api";
import { PrimaryButton } from "../components/PrimaryButton";
import { config } from "../lib/config";

export function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        await api.me();
        navigate("/", { replace: true });
      } catch {
        // Not signed in yet.
      }
    })();
  }, [navigate]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.login(email);
      toast.success("Signed in");
      navigate("/", { replace: true });
    } catch {
      toast.error("Sign in failed. Check email and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full glass-strong rounded-3xl p-8 space-y-6">
        {config.isDemoMode && (
          <p className="text-xs text-foreground-subtle">Demo mode enabled</p>
        )}
        <div>
          <h1 className="text-3xl font-light text-foreground">QuietWord</h1>
          <p className="text-sm text-foreground-muted mt-1">Sign in to keep your reading plan in sync.</p>
        </div>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full p-3.5 rounded-xl glass border border-glass-border focus:ring-2 focus:ring-primary focus:border-primary transition-all text-foreground bg-input-background"
              placeholder="you@example.com"
            />
          </div>
          <PrimaryButton type="submit" disabled={isLoading || !email.trim()} fullWidth>
            {isLoading ? "Signing in..." : "Continue"}
          </PrimaryButton>
        </form>
      </div>
    </div>
  );
}
