"use client";

import MaterialIcon from "@/components/ui/MaterialIcon";

interface AlbumArtProps {
  title: string;
  artist: string;
}

export default function AlbumArt({ title, artist }: AlbumArtProps) {
  return (
    <div className="flex flex-col items-center space-y-8">
      <div className="relative group">
        <div className="absolute -inset-4 bg-primary/20 blur-2xl rounded-xl opacity-50 group-hover:opacity-100 transition-opacity" />
        <div className="relative aspect-square size-64 md:size-80 rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-gradient-to-br from-primary/40 via-purple-900/60 to-bg-dark flex items-center justify-center">
          <MaterialIcon icon="music_note" className="text-primary/30 text-9xl" />
        </div>
      </div>
      <div className="text-center space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">{title}</h1>
        <p className="text-lg text-primary font-medium">{artist}</p>
      </div>
      {/* Animated bars */}
      <div className="w-full max-w-xs flex items-end justify-center gap-1 h-12">
        <div className="w-1.5 bg-primary/40 rounded-full h-4" />
        <div className="w-1.5 bg-primary/60 rounded-full h-8" />
        <div className="w-1.5 bg-primary rounded-full h-12" />
        <div className="w-1.5 bg-accent-cyan rounded-full h-10" />
        <div className="w-1.5 bg-primary rounded-full h-6" />
        <div className="w-1.5 bg-primary/60 rounded-full h-9" />
        <div className="w-1.5 bg-primary/40 rounded-full h-5" />
      </div>
    </div>
  );
}
