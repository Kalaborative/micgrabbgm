"use client";

import { useMemo } from "react";

interface LyricsDisplayProps {
  lyrics: string;
}

export default function LyricsDisplay({ lyrics }: LyricsDisplayProps) {
  const lines = useMemo(() => {
    return lyrics
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
  }, [lyrics]);

  if (lines.length === 0) {
    return (
      <div className="flex flex-col h-[400px] justify-center items-center">
        <p className="text-xl text-slate-500 italic">No lyrics available</p>
      </div>
    );
  }

  return (
    <div className="h-[400px] overflow-y-auto custom-scrollbar space-y-4 py-8">
      {lines.map((line, i) => (
        <p key={i} className="text-lg text-slate-300 font-medium">
          {line}
        </p>
      ))}
    </div>
  );
}
