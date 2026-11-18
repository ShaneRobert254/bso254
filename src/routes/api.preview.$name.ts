import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/preview/$name")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const name = params.name;
        const { readLiveCatalog, readAudioFile } = await import("@/lib/catalog.server");
        const catalog = await readLiveCatalog();
        const allowed = catalog.releases.some((release) =>
          release.tracks.some((track) => track.preview?.endsWith(`/${name}`)),
        );
        if (!allowed) return new Response("No preview", { status: 404 });
        const file = await readAudioFile(name);
        if (!file) return new Response("Not found", { status: 404 });
        return new Response(new Uint8Array(file.bytes), {
          headers: {
            "Content-Type": file.type,
            "Content-Disposition": "inline",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
