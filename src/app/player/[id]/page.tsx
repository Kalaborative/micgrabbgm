"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import MaterialIcon from "@/components/ui/MaterialIcon";
import AlbumArt from "@/components/player/AlbumArt";
import LyricsDisplay from "@/components/player/LyricsDisplay";
import TransportControls from "@/components/player/TransportControls";
import { getTrack } from "@/lib/firebase/firestore";
import type { Track } from "@/types/track";

export default function PlayerPage() {
  const params = useParams();
  const id = params.id as string;
  const [track, setTrack] = useState<Track | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);

  useEffect(() => {
    async function load() {
      try {
        const data = await getTrack(id);
        if (!data) {
          setError("Track not found");
        } else {
          setTrack(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load track");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  useEffect(() => {
    if (!track) return;
    const audio = new Audio(track.trimmedAudioUrl || track.audioUrl);
    audio.volume = volume;
    audioRef.current = audio;

    const onTime = () => setCurrentTime(audio.currentTime);
    const onDur = () => setDuration(audio.duration || 0);
    const onEnd = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onDur);
    audio.addEventListener("ended", onEnd);

    // Auto-play when track loads
    audio.play().then(() => setIsPlaying(true)).catch(() => {});

    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onDur);
      audio.removeEventListener("ended", onEnd);
      audio.pause();
    };
  }, [track, volume]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play();
      setIsPlaying(true);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  }, []);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (audio) audio.currentTime = time;
  }, []);

  const handleVolumeChange = useCallback((vol: number) => {
    setVolume(vol);
    if (audioRef.current) audioRef.current.volume = vol;
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg-dark">
        <div className="animate-spin size-10 border-3 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !track) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-bg-dark gap-4">
        <MaterialIcon icon="error" className="text-5xl text-red-400" />
        <p className="text-lg text-slate-400">{error || "Track not found"}</p>
        <Link
          href="/"
          className="mt-4 px-6 py-2 bg-primary/20 text-primary rounded-xl font-bold hover:bg-primary/30 transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="relative flex h-screen w-full flex-col bg-bg-dark">
      {/* Background glow effects */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary rounded-full blur-[120px]" />
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-accent-cyan rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-6 z-50">
        <Link
          href="/"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-slate-100 transition-colors"
        >
          <MaterialIcon icon="arrow_back" />
          <span className="text-sm font-bold tracking-tight">Dashboard</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <h2 className="text-xs uppercase tracking-widest text-primary/70 font-bold">
              Now Playing
            </h2>
            <p className="text-sm font-semibold">Mic Grab BGM</p>
          </div>
          <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
            <MaterialIcon icon="graphic_eq" />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 relative overflow-hidden">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center z-10">
          <AlbumArt title={track.title} artist={track.artist} />
          <LyricsDisplay lyrics={track.lyrics} />
        </div>
      </main>

      {/* Transport */}
      <TransportControls
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        onTogglePlay={togglePlay}
        onSeek={seek}
        onVolumeChange={handleVolumeChange}
      />
    </div>
  );
}
