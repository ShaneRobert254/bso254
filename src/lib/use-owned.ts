import { useEffect, useState } from "react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { listPurchases } from "@/lib/purchases";

export function useAccountTracks() {
  const { user, isPending } = useCurrentUserState();
  const [tracks, setTracks] = useState<{ ref: string; trackId: string }[]>([]);

  useEffect(() => {
    if (isPending || !user) {
      setTracks([]);
      return;
    }
    let live = true;
    void listPurchases()
      .then((rows) => {
        if (!live) return;
        setTracks(rows.flatMap((row) => (row.track_id ? [{ ref: row.ref, trackId: row.track_id }] : [])));
      })
      .catch(() => {
        if (live) setTracks([]);
      });
    return () => {
      live = false;
    };
  }, [isPending, user?.id]);

  return tracks;
}

export function accountOwns(tracks: { ref: string; trackId: string }[], slug: string, trackId: string) {
  return tracks.some((track) => track.ref === slug && track.trackId === trackId);
}
