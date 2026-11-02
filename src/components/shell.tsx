import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { PlayerBar } from "@/components/player-bar";
import { usePlayer } from "@/lib/player";
import { useHydrated } from "@/lib/use-hydrated";

export function Shell({ children }: { children: ReactNode }) {
  useHydrated();
  const player = usePlayer();
  return (
    <div className={player.now ? "pb-24" : undefined}>
      <Header />
      <main>{children}</main>
      <Footer />
      <PlayerBar />
      <Toaster theme="dark" position="top-center" />
    </div>
  );
}
