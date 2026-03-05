"use client";

import MaterialIcon from "@/components/ui/MaterialIcon";
import WaveformBars from "@/components/ui/WaveformBars";
import type { Track } from "@/types/track";
import Link from "next/link";

interface TrackCardProps {
  track: Track;
}

export default function TrackCard({ track }: TrackCardProps) {
  return (
    <Link href={`/player/${track.id}`} className="group bg-primary/5 hover:bg-primary/10 border border-primary/5 rounded-2xl p-4 transition-all duration-300 block">
      <div className="relative w-full aspect-square mb-4 rounded-xl overflow-hidden shadow-lg group-hover:shadow-primary/20 bg-gradient-to-br from-primary/30 to-purple-900/30 flex items-center justify-center">
        <MaterialIcon icon="music_note" className="text-primary/40 text-8xl" />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
          <div className="size-14 bg-primary text-white rounded-full flex items-center justify-center transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
            <MaterialIcon icon="play_arrow" className="text-3xl" />
          </div>
        </div>
      </div>
      <h3 className="font-bold text-lg text-white mb-1 truncate">{track.title}</h3>
      <p className="text-sm text-slate-400 truncate font-medium">{track.artist}</p>
      {track.uploadedBy && (
        <p className="text-xs text-slate-500 mb-4 truncate">
          Uploaded by {track.uploadedBy}
        </p>
      )}
      <WaveformBars count={20} maxHeight={8} className="h-8" />
    </Link>
  );
}
