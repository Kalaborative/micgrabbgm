"use client";

import MaterialIcon from "@/components/ui/MaterialIcon";
import { formatTime } from "@/lib/audio/formatTime";

interface TransportControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (vol: number) => void;
}

export default function TransportControls({
  isPlaying,
  currentTime,
  duration,
  volume,
  onTogglePlay,
  onSeek,
  onVolumeChange,
}: TransportControlsProps) {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <footer className="w-full px-6 py-10 z-50 bg-gradient-to-t from-bg-dark/80 to-transparent">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        {/* Seek bar */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-bold tracking-tighter text-slate-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          <div
            className="relative w-full h-1.5 bg-white/10 rounded-full group cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = (e.clientX - rect.left) / rect.width;
              onSeek(pct * duration);
            }}
          >
            <div
              className="absolute left-0 top-0 h-full bg-primary rounded-full"
              style={{ width: `${progress}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 size-4 bg-white border-2 border-primary rounded-full shadow-lg scale-0 group-hover:scale-100 transition-transform"
              style={{ left: `${progress}%` }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-8">
          <button
            onClick={onTogglePlay}
            className="size-16 rounded-full bg-primary text-white flex items-center justify-center shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
          >
            <MaterialIcon
              icon={isPlaying ? "pause" : "play_arrow"}
              className="text-4xl"
              filled
            />
          </button>

          <div className="flex items-center gap-3 w-32">
            <MaterialIcon icon="volume_up" className="text-slate-500" />
            <div
              className="flex-1 h-1 bg-white/10 rounded-full cursor-pointer"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pct = (e.clientX - rect.left) / rect.width;
                onVolumeChange(Math.max(0, Math.min(1, pct)));
              }}
            >
              <div
                className="h-full bg-slate-400 rounded-full"
                style={{ width: `${volume * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
