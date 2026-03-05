"use client";

import { useRef, useState, useCallback } from "react";
import MaterialIcon from "@/components/ui/MaterialIcon";
import { uploadToCloudinary } from "@/lib/cloudinary/upload";

interface UploadStepProps {
  onUploadComplete: (url: string, duration: number, title?: string) => void;
}

export default function UploadStep({ onUploadComplete }: UploadStepProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [ytLoading, setYtLoading] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("audio/")) {
        setError("Please upload an audio file (MP3 or WAV)");
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        setError("File must be under 20MB");
        return;
      }

      setError(null);
      setUploading(true);
      setProgress(0);

      try {
        const result = await uploadToCloudinary(file, setProgress);
        const audioCtx = new AudioContext();
        const arrayBuffer = await file.arrayBuffer();
        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
        const duration = audioBuffer.duration;
        audioCtx.close();

        onUploadComplete(result.url, duration);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [onUploadComplete]
  );

  const handleYouTube = useCallback(async () => {
    const trimmed = youtubeUrl.trim();
    if (!trimmed) return;

    setError(null);
    setYtLoading(true);

    try {
      const res = await fetch("/api/youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "YouTube extraction failed");
      }

      onUploadComplete(data.url, data.duration ?? 0, data.title);
    } catch (err) {
      setError(err instanceof Error ? err.message : "YouTube extraction failed");
    } finally {
      setYtLoading(false);
    }
  }, [youtubeUrl, onUploadComplete]);

  return (
    <div className="p-5">
      <div
        className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl bg-primary/5 py-8 px-6 group cursor-pointer transition-colors ${
          dragOver ? "border-primary bg-primary/10" : "border-primary/30 hover:border-primary"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file);
        }}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-4 w-full max-w-xs">
            <div className="animate-spin size-12 border-3 border-primary border-t-transparent rounded-full" />
            <p className="text-sm font-semibold">Uploading... {progress}%</p>
            <div className="w-full h-2 bg-primary/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <>
            <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3 group-hover:scale-110 transition-transform">
              <MaterialIcon icon="cloud_upload" className="text-3xl" />
            </div>
            <h4 className="text-base font-semibold mb-1">Drag and drop your MP3 here</h4>
            <p className="text-xs text-slate-500 mb-4 text-center">
              or browse your computer to find the perfect track
            </p>
            <button className="bg-primary text-white px-6 py-2.5 rounded-lg font-bold text-sm glow-button">
              Select File
            </button>
          </>
        )}

        {error && (
          <p className="mt-4 text-sm text-red-400 flex items-center gap-1">
            <MaterialIcon icon="error" className="text-lg" />
            {error}
          </p>
        )}
      </div>

      {/* YouTube URL input — local dev only (yt-dlp not available on Vercel) */}
      {process.env.NODE_ENV === "development" && (
        <>
          <div className="flex items-center gap-4 my-1.5">
            <div className="flex-1 h-px bg-primary/20" />
            <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold">or</span>
            <div className="flex-1 h-px bg-primary/20" />
          </div>

          <div className="flex gap-3">
            <div className="flex-1 relative">
              <MaterialIcon
                icon="smart_display"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-lg text-slate-500"
              />
              <input
                type="url"
                placeholder="Paste a YouTube link..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleYouTube();
                }}
                disabled={ytLoading || uploading}
                className="w-full bg-primary/5 border border-primary/20 rounded-lg pl-10 pr-4 py-3 text-sm placeholder:text-slate-500 focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
              />
            </div>
            <button
              onClick={handleYouTube}
              disabled={ytLoading || uploading || !youtubeUrl.trim()}
              className="bg-primary text-white px-6 py-3 rounded-lg font-bold text-sm glow-button disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
            >
              {ytLoading ? (
                <>
                  <div className="animate-spin size-4 border-2 border-white border-t-transparent rounded-full" />
                  Extracting...
                </>
              ) : (
                <>
                  <MaterialIcon icon="download" className="text-lg" />
                  Extract
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
