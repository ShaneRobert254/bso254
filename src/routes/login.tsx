import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { authClient, authEnabled } from "@/lib/auth/client";
import { hiddenMeta } from "@/lib/seo";

export const Route = createFileRoute("/login")({
  head: () => hiddenMeta("Sign in — Bso254"),
  component: LoginPage,
});

function LoginPage() {
  const [mode, setMode] = useState<"in" | "up">("up");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      const result =
        mode === "up"
          ? await authClient.signUp.email({ email, password, name: name.trim() || "Fan", callbackURL: "/library" })
          : await authClient.signIn.email({ email, password, callbackURL: "/library" });
      if (result.error) {
        setError(result.error.message || "Sign-in failed.");
        return;
      }
      window.location.href = "/library";
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Sign-in failed.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto grid min-h-[70vh] max-w-md place-items-center px-4 py-16">
      <form className="panel w-full space-y-4 p-6" onSubmit={(event) => void submit(event)}>
        <p className="text-xs tracking-[0.22em] text-primary">ACCOUNT</p>
        <h1 className="font-display text-5xl">{mode === "up" ? "Create account" : "Sign in"}</h1>
        <p className="text-sm text-muted">
          Use your email. A paid song stays on this account, so you can listen again from another phone. Nothing downloads.
        </p>
        {authEnabled ? (
          <>
            {mode === "up" ? (
              <label className="grid gap-1 text-sm text-muted">
                Name
                <input className="field" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required />
              </label>
            ) : null}
            <label className="grid gap-1 text-sm text-muted">
              Email
              <input className="field" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
            </label>
            <label className="grid gap-1 text-sm text-muted">
              Password
              <input className="field" type="password" value={password} minLength={8} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === "up" ? "new-password" : "current-password"} required />
            </label>
            <button type="submit" className="btn-solid w-full" disabled={pending}>
              {pending ? "Please wait" : mode === "up" ? "Create account" : "Sign in"}
            </button>
            <button
              type="button"
              className="text-sm text-primary"
              onClick={() => {
                setMode(mode === "up" ? "in" : "up");
                setError("");
              }}
            >
              {mode === "up" ? "I already have an account" : "Create an account"}
            </button>
          </>
        ) : (
          <p className="text-sm text-muted">Sign-in is off.</p>
        )}
        {error ? <p className="text-sm text-primary">{error}</p> : null}
      </form>
    </div>
  );
}
