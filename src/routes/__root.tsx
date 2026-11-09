import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { getShopCatalog } from "@/lib/admin";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { Shell } from "@/components/shell";
import { PlayerProvider } from "@/lib/player";
import { ShopProvider } from "@/lib/shop";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  loader: () => getShopCatalog(),
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "BSO254 — Music, Merch, Movement" },
      {
        name: "description",
        content: "Official BSO254 store. Albums, singles, and merch. From the trenches to the throne.",
      },
      { name: "theme-color", content: "#070707" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
    ],
  }),
  component: Root,
});

function Root() {
  const catalog = Route.useLoaderData();
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <PreviewHostBridge />
        <AuthProvider>
          <PlayerProvider>
            <ShopProvider value={catalog}>
              <Shell>
                <Outlet />
              </Shell>
            </ShopProvider>
          </PlayerProvider>
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}
