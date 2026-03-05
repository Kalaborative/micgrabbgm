"use client";

import { useRef, useEffect } from "react";
import { useWaveSurfer } from "@/hooks/useWaveSurfer";
import MaterialIcon from "@/components/ui/MaterialIcon";
import { formatTime } from "@/lib/audio/formatTime";

interface TrimStepProps {
  audioUrl: string;
  onRegionChange: (start: number, end: number) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function TrimStep({ audioUrl, onRegionChange, onNext, onBack }: TrimStepProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isReady, isPlaying, duration, currentTime, regionStart, regionEnd, playRegion, playPause, stop } =
    useWaveSurfer({
      url: audioUrl,
      container: containerRef,
    });

  // Spacebar toggles play/pause when not in a text field
  useEffect(() => {
    if (!isReady) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.code !== "Space") return;
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement).isContentEditable) return;
      e.preventDefault();
      playPause();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isReady, playPause]);

  // Notify parent of region changes (in useEffect to avoid setState-during-render)
  useEffect(() => {
    if (isReady) {
      onRegionChange(regionStart, regionEnd);
    }
  }, [isReady, regionStart, regionEnd, onRegionChange]);

  return (
    <div className="p-5 flex flex-col gap-3">
      {/* Waveform with clip markers */}
      <div className="relative w-full">
        <div
          ref={containerRef}
          className="w-full bg-slate-800/50 rounded-lg overflow-hidden"
          style={{ minHeight: "100px" }}
        />

        {/* Start marker overlay */}
        {isReady && duration > 0 && (
          <div
            className="absolute pointer-events-none"
            style={{
              left: `${(regionStart / duration) * 100}%`,
              top: "-20px",
              bottom: "0",
              transform: "translateX(-50%)",
            }}
          >
            <div className="flex flex-col items-center h-full">
              <MaterialIcon icon="arrow_drop_down" className="text-white text-xl shrink-0" />
              <div className="flex-1 w-0.5 bg-white/80 shadow-[0_0_6px_rgba(255,255,255,0.4)]" />
            </div>
          </div>
        )}

        {/* End marker overlay */}
        {isReady && duration > 0 && (
          <div
            className="absolute pointer-events-none"
            style={{
              left: `${(regionEnd / duration) * 100}%`,
              top: "-20px",
              bottom: "0",
              transform: "translateX(-50%)",
            }}
          >
            <div className="flex flex-col items-center h-full">
              <MaterialIcon icon="arrow_drop_down" className="text-white text-xl shrink-0" />
              <div className="flex-1 w-0.5 bg-white/80 shadow-[0_0_6px_rgba(255,255,255,0.4)]" />
            </div>
          </div>
        )}
      </div>
      {isReady && (
        <p className="text-xs text-slate-500 text-center -mt-2">
          Drag the markers to set the clip boundaries
        </p>
      )}

      {isReady && (
        <>
          {/* Clip start/end labels */}
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 bg-primary/15 border border-primary/30 rounded-lg px-3 py-1.5">
              <span className="text-slate-400">Start</span>
              <span className="text-primary font-bold">{formatTime(regionStart)}</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold">Clip Length</span>
              <span className="text-white font-bold text-sm">{formatTime(regionEnd - regionStart)}</span>
            </div>
            <div className="flex items-center gap-2 bg-primary/15 border border-primary/30 rounded-lg px-3 py-1.5">
              <span className="text-slate-400">End</span>
              <span className="text-primary font-bold">{formatTime(regionEnd)}</span>
            </div>
          </div>

          {/* Time + playback info */}
          <div className="flex items-center justify-center text-sm font-mono text-slate-400">
            <span className="text-primary font-bold">{formatTime(currentTime)}</span>
            <span className="mx-2">/</span>
            <span>{formatTime(duration)}</span>
          </div>

          {/* Transport controls */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={playRegion}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-primary/20 hover:bg-primary/10 transition-colors"
            >
              <MaterialIcon icon="replay" className="text-lg" />
              <span className="font-bold text-sm">Preview Selection</span>
            </button>

            <button
              onClick={playPause}
              className="size-12 bg-primary text-white rounded-full flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
            >
              <MaterialIcon
                icon={isPlaying ? "pause" : "play_arrow"}
                className="text-3xl"
              />
            </button>

            <button
              onClick={stop}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-primary/20 hover:bg-primary/10 transition-colors"
            >
              <MaterialIcon icon="stop" className="text-lg" />
              <span className="font-bold text-sm">Stop</span>
            </button>
          </div>
        </>
      )}

      {!isReady && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin size-6 border-2 border-primary border-t-transparent rounded-full" />
          <span className="ml-3 text-sm text-slate-400">Loading waveform...</span>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-3 border-t border-primary/10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-primary/20 hover:bg-primary/10 transition-colors"
        >
          <MaterialIcon icon="arrow_back" className="text-lg" />
          <span className="font-bold text-sm">Back</span>
        </button>
        <button
          onClick={onNext}
          disabled={!isReady}
          className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg font-bold text-sm glow-button disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span>Next</span>
          <MaterialIcon icon="arrow_forward" className="text-lg" />
        </button>
      </div>
    </div>
  );
}
