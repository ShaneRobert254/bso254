import { createFileRoute } from "@tanstack/react-router";
import { getCookie } from "@tanstack/react-start/server";

export const Route = createFileRoute("/api/audio/$name")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const name = params.name;
        const allowed = (getCookie("bso_paid") ?? "").split(",").filter(Boolean);
        if (!allowed.includes(name)) return new Response("Pay to listen", { status: 403 });
        const { readAudioFile } = await import("@/lib/catalog.server");
        const file = await readAudioFile(name);
        if (!file) return new Response("Not found", { status: 404 });
        return new Response(new Uint8Array(file.bytes), {
          headers: {
            "Content-Type": file.type,
            "Content-Disposition": "inline",
            "Cache-Control": "private, no-store",
          },
        });
      },
    },
  },
});
