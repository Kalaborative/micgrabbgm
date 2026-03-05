"use client";

import { usePlayer } from "@/context/PlayerContext";
import MaterialIcon from "@/components/ui/MaterialIcon";
import { formatTime } from "@/lib/audio/formatTime";

export default function BottomPlayer() {
  const { currentTrack, isPlaying, currentTime, duration, togglePlay, seek, volume, setVolume } =
    usePlayer();

  if (!currentTrack) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="h-24 bg-bg-dark/95 border-t border-primary/20 backdrop-blur-xl px-6 flex items-center justify-between z-50">
      {/* Track info */}
      <div className="flex items-center gap-4 w-1/4">
        <div className="size-14 rounded-lg bg-primary/20 flex items-center justify-center shadow-lg shadow-primary/10">
          <MaterialIcon icon="music_note" className="text-primary text-2xl" />
        </div>
        <div className="overflow-hidden">
          <p className="font-bold text-white truncate">{currentTrack.title}</p>
          <p className="text-xs text-primary font-medium">{currentTrack.artist}</p>
        </div>
        <button className="p-1 text-slate-400 hover:text-primary transition-colors">
          <MaterialIcon icon="favorite" className="text-xl" />
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-2 flex-1 max-w-2xl px-8">
        <div className="flex items-center gap-6">
          <button className="text-slate-400 hover:text-primary transition-colors">
            <MaterialIcon icon="shuffle" />
          </button>
          <button className="text-slate-400 hover:text-primary transition-colors">
            <MaterialIcon icon="skip_previous" />
          </button>
          <button
            onClick={togglePlay}
            className="size-12 bg-primary text-white rounded-full flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-105 transition-transform"
          >
            <MaterialIcon icon={isPlaying ? "pause" : "play_arrow"} className="text-3xl" />
          </button>
          <button className="text-slate-400 hover:text-primary transition-colors">
            <MaterialIcon icon="skip_next" />
          </button>
          <button className="text-slate-400 hover:text-primary transition-colors">
            <MaterialIcon icon="repeat" />
          </button>
        </div>
        <div className="w-full flex items-center gap-3">
          <span className="text-[10px] text-slate-400 font-bold font-mono">
            {formatTime(currentTime)}
          </span>
          <div
            className="flex-1 h-1.5 bg-primary/10 rounded-full relative overflow-hidden group cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = (e.clientX - rect.left) / rect.width;
              seek(pct * duration);
            }}
          >
            <div
              className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 size-3 bg-white border-2 border-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              style={{ left: `${progress}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400 font-bold font-mono">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Volume */}
      <div className="flex items-center justify-end gap-4 w-1/4">
        <button className="text-slate-400 hover:text-primary transition-colors">
          <MaterialIcon icon="lyrics" />
        </button>
        <button className="text-slate-400 hover:text-primary transition-colors">
          <MaterialIcon icon="queue_music" />
        </button>
        <div className="flex items-center gap-2 group w-32">
          <MaterialIcon icon="volume_up" className="text-slate-400 group-hover:text-primary transition-colors" />
          <div
            className="flex-1 h-1 bg-primary/10 rounded-full overflow-hidden cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = (e.clientX - rect.left) / rect.width;
              setVolume(Math.max(0, Math.min(1, pct)));
            }}
          >
            <div className="h-full bg-primary" style={{ width: `${volume * 100}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
