import { toast } from "sonner";
import { openPreview, openTrack } from "@/lib/admin";
import type { Track } from "@/lib/catalog";
import type { usePlayer } from "@/lib/player";

export async function playIfPaid(
  player: ReturnType<typeof usePlayer>,
  track: Track,
  owned: boolean,
  meta: { artist: string; cover: string },
) {
  if (!owned) {
    if (!track.hasPreview && !track.preview) {
      toast.error("Pay to listen.");
      return;
    }
    try {
      const opened = await openPreview({ data: { trackId: track.id } });
      player.play({
        id: track.id,
        title: `${track.title} (preview)`,
        artist: meta.artist,
        cover: meta.cover,
        src: opened.src,
        duration: track.duration,
      });
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "No preview on this song.");
    }
    return;
  }
  if (!track.hasAudio && !track.audio) {
    toast.error("This song is not up yet.");
    return;
  }
  try {
    const opened = await openTrack({ data: { trackId: track.id } });
    player.play({
      id: track.id,
      title: track.title,
      artist: meta.artist,
      cover: meta.cover,
      src: opened.src,
      duration: track.duration,
    });
  } catch (reason) {
    toast.error(reason instanceof Error ? reason.message : "This song is not up yet.");
  }
}