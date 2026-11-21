import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/audio/$name")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const name = params.name;
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