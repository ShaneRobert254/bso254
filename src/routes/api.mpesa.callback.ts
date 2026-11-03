import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/mpesa/callback")({
  server: {
    handlers: {
      POST: async () => Response.json({ ResultCode: 0, ResultDesc: "Accepted" }),
    },
  },
});
