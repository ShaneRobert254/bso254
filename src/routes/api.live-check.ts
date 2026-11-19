import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/live-check")({
  server: {
    handlers: {
      GET: async () => {
        const safe = (value: string) => value.replace(/postgres(?:ql)?:\/\/\S+/gi, "postgres://redacted").slice(0, 400);
        const out: Record<string, string> = {
          vercel: process.env.VERCEL ?? "",
          database: process.env.DATABASE_URL ? "set" : "missing",
          authUrl: process.env.BETTER_AUTH_URL ? "set" : "missing",
          grokClient: process.env.GROK_AUTH_CLIENT_ID ? "set" : "missing",
          authFlag: process.env.VITE_AUTH_ENABLED ?? "unset",
        };
        try {
          const { getSql } = await import("@/lib/db");
          const sql = await getSql();
          await sql.query("select 1 as ok");
          out.databasePing = "ok";
        } catch (error) {
          out.databasePing = safe(error instanceof Error ? error.message : "failed");
        }
        return Response.json(out);
      },
    },
  },
});
