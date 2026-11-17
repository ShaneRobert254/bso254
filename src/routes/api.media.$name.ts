import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/media/$name")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { readMediaFile } = await import("@/lib/inbox.server");
        const file = await readMediaFile(params.name);
        if (!file) return new Response("Not found", { status: 404 });
        return new Response(new Uint8Array(file.bytes), {
          headers: {
            "Content-Type": file.type,
            "Content-Disposition": "inline",
            "Cache-Control": "public, max-age=86400",
          },
        });
      },
    },
  },
});
