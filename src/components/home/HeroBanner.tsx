"use client";

import Link from "next/link";
import MaterialIcon from "@/components/ui/MaterialIcon";

export default function HeroBanner() {
  return (
    <section className="mb-12">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-purple-600 to-indigo-800 p-8 h-64 flex flex-col justify-center">
        <div className="relative z-10 max-w-lg">
          <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">
            The ultimate BGM hub for your stream
          </h1>
          <p className="text-white/80 text-lg mb-6">
            Upload, trim, and play tracks with waveform visualization and lyrics display.
          </p>
          <Link
            href="/editor/new"
            className="px-6 py-3 bg-white text-primary rounded-xl font-bold hover:bg-slate-100 transition-all flex items-center gap-2 w-fit"
          >
            <MaterialIcon icon="cloud_upload" />
            Upload Track
          </Link>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-30 mix-blend-overlay">
          <MaterialIcon
            icon="music_note"
            className="text-[20rem] absolute -right-16 -bottom-16 rotate-12"
          />
        </div>
      </div>
    </section>
  );
}
