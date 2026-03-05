"use client";

import { useState, useMemo } from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import BottomPlayer from "@/components/layout/BottomPlayer";
import TrackCard from "@/components/home/TrackCard";
import TrackListItem from "@/components/home/TrackListItem";
import MaterialIcon from "@/components/ui/MaterialIcon";
import { useAuth } from "@/context/AuthContext";
import { useTracks } from "@/hooks/useTracks";

export default function HomePage() {
  const { user } = useAuth();
  const [view, setView] = useState<"all" | "mine">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filterUserId = view === "mine" && user ? user.uid : undefined;
  const { tracks, loading, error } = useTracks(filterUserId);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return tracks;
    const q = searchQuery.toLowerCase();
    return tracks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        t.lyrics.toLowerCase().includes(q)
    );
  }, [tracks, searchQuery]);

  const gridTracks = filtered.slice(0, 4);
  const listTracks = filtered.slice(4);

  const sectionTitle = view === "mine" ? "My Tracks" : "Latest Tracks";
  const sectionIcon = view === "mine" ? "person" : "new_releases";

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden">
      <Header onSearch={setSearchQuery} />
      <div className="flex h-full overflow-hidden">
        <Sidebar view={view} onViewChange={setView} />
        <main className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-bg-dark">
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin size-8 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          )}

          {error && (
            <div className="text-center py-20 text-slate-400">
              <MaterialIcon icon="error" className="text-4xl text-red-400 mb-2" />
              <p>Failed to load tracks. Please check your Firebase configuration.</p>
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="text-center py-20 text-slate-400">
              <MaterialIcon icon="library_music" className="text-6xl text-primary/30 mb-4" />
              <p className="text-lg font-semibold mb-2">
                {view === "mine" ? "No tracks in your library" : "No tracks yet"}
              </p>
              <p className="text-sm">Upload your first track to get started!</p>
            </div>
          )}

          {gridTracks.length > 0 && (
            <section className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <MaterialIcon icon={sectionIcon} className="text-primary" />
                  {sectionTitle}
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {gridTracks.map((track) => (
                  <TrackCard key={track.id} track={track} />
                ))}
              </div>
            </section>
          )}

          {listTracks.length > 0 && (
            <section>
              <div className="space-y-4">
                {listTracks.map((track, i) => (
                  <TrackListItem key={track.id} track={track} index={i} />
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
      <BottomPlayer />
    </div>
  );
}
