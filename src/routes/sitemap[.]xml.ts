import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin;
        const { readLiveCatalog } = await import("@/lib/catalog.server");
        const catalog = await readLiveCatalog();
        const paths = [
          "/",
          "/music",
          "/merch",
          "/about",
          "/gallery",
          "/contact",
          "/community",
          ...catalog.releases.map((release) => `/music/${release.slug}`),
          ...catalog.products.map((product) => `/merch/${product.slug}`),
        ];
        const urls = paths
          .map((path) => `<url><loc>${origin}${path}</loc></url>`)
          .join("");
        const body = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
        return new Response(body, {
          headers: { "Content-Type": "application/xml; charset=utf-8" },
        });
      },
    },
  },
});
