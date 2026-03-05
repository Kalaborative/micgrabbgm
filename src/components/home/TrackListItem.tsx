"use client";

import Link from "next/link";
import MaterialIcon from "@/components/ui/MaterialIcon";
import WaveformBars from "@/components/ui/WaveformBars";
import { formatTime } from "@/lib/audio/formatTime";
import type { Track } from "@/types/track";

interface TrackListItemProps {
  track: Track;
  index: number;
}

export default function TrackListItem({ track, index }: TrackListItemProps) {
  return (
    <Link
      href={`/player/${track.id}`}
      className="flex items-center gap-4 p-3 bg-primary/5 rounded-xl border border-primary/5 hover:bg-primary/10 transition-all cursor-pointer"
    >
      <span className="text-slate-400 font-bold w-6 text-center">
        {String(index + 1).padStart(2, "0")}
      </span>
      <div className="size-12 rounded-lg bg-gradient-to-br from-primary/20 to-purple-900/20 flex items-center justify-center flex-shrink-0">
        <MaterialIcon icon="music_note" className="text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-white leading-none mb-1 truncate">{track.title}</p>
        <p className="text-xs text-slate-400 truncate">
          {track.artist}
          {track.uploadedBy && <span className="text-slate-500"> &middot; {track.uploadedBy}</span>}
        </p>
      </div>
      <div className="hidden md:block flex-1 max-w-xs px-4">
        <WaveformBars count={30} maxHeight={4} className="h-4 opacity-60" />
      </div>
      <span className="text-xs text-slate-400 font-medium">{formatTime(track.duration)}</span>
      <div className="p-2 text-primary hover:bg-primary/20 rounded-full transition-all">
        <MaterialIcon icon="play_arrow" />
      </div>
    </Link>
  );
}
