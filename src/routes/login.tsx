import { createFileRoute } from "@tanstack/react-router";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — BSO254" }] }),
  component: LoginPage,
});

function LoginPage() {
  return (
    <div className="mx-auto grid min-h-[70vh] max-w-md place-items-center px-4 py-16">
      <div className="panel w-full space-y-4 p-6">
        <p className="text-xs tracking-[0.22em] text-primary">ACCOUNT</p>
        <h1 className="font-display text-5xl">Sign in</h1>
        <p className="text-sm text-muted">
          Google or X. A paid song stays on this account, so you can listen again from another phone. Nothing downloads.
        </p>
        {authEnabled ? (
          GROK_PROVIDERS.map((provider) => (
            <button
              key={provider.providerId}
              type="button"
              className="btn-solid w-full"
              onClick={() => signIn(provider.providerId, { callbackURL: "/library" })}
            >
              Continue with {provider.label}
            </button>
          ))
        ) : (
          <p className="text-sm text-muted">Sign-in is off.</p>
        )}
      </div>
    </div>
  );
}
