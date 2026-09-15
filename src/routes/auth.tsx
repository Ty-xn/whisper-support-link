import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — SafePath" },
      {
        name: "description",
        content:
          "An optional account lets you save a private journal and emergency plan. Browsing support, pathways and readings never needs one.",
      },
      { property: "og:title", content: "Sign in — SafePath" },
      { property: "og:description", content: "An optional account for private, saved records." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/journal", replace: true });
    });
  }, [navigate]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setNotice("");
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Use a password of at least 8 characters.");
      return;
    }
    setBusy(true);
    if (mode === "signup") {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      setBusy(false);
      if (signUpError) {
        setError(signUpError.message);
        return;
      }
      if (!data.session) {
        setNotice("Check your email to confirm your account, then come back and sign in.");
        return;
      }
      navigate({ to: "/journal", replace: true });
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (signInError) {
        setError("That email and password did not match.");
        return;
      }
      navigate({ to: "/journal", replace: true });
    }
  };

  const google = async () => {
    setError("");
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setError("Google sign-in could not start.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/journal", replace: true });
  };

  return (
    <AppShell>
      <h1 className="font-display text-[28px] leading-tight text-foreground">
        {mode === "signin" ? "Sign in" : "Create an account"}
      </h1>
      <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
        An account is only needed to save a private journal or emergency plan. Finding support, pathways and readings
        never require one.
      </p>
      <p className="mt-3 rounded-xl border border-border bg-muted px-4 py-3 text-[13px] leading-relaxed text-foreground">
        We store your email and, if you choose, a display name. Saved entries are readable only by you — administrators
        cannot see them.
      </p>

      <form onSubmit={submit} className="surface mt-5 space-y-4 px-4 py-4">
        <div>
          <label htmlFor="email" className="eyebrow">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 min-h-12 w-full rounded-xl border border-input bg-background px-4 text-[15px] text-foreground"
          />
        </div>
        <div>
          <label htmlFor="password" className="eyebrow">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 min-h-12 w-full rounded-xl border border-input bg-background px-4 text-[15px] text-foreground"
          />
        </div>
        {error && (
          <p role="alert" className="text-[13px] text-destructive">
            {error}
          </p>
        )}
        {notice && <p className="text-[13px] text-foreground">{notice}</p>}
        <button
          type="submit"
          disabled={busy}
          className="min-h-12 w-full rounded-xl bg-primary text-[15px] font-medium text-primary-foreground disabled:opacity-50"
        >
          {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
        </button>
        <button
          type="button"
          onClick={google}
          className="min-h-12 w-full rounded-xl border border-border text-[15px] font-medium text-foreground"
        >
          Continue with Google
        </button>
      </form>

      <button
        type="button"
        onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        className="mt-4 min-h-11 text-[14px] font-semibold text-brand-deep underline"
      >
        {mode === "signin" ? "I need an account" : "I already have an account"}
      </button>

      <p className="mt-6 text-[13px] leading-relaxed text-muted-foreground">
        Prefer not to sign in?{" "}
        <Link to="/support" className="font-semibold text-brand-deep underline">
          Browse support anonymously
        </Link>
        .
      </p>
    </AppShell>
  );
}
