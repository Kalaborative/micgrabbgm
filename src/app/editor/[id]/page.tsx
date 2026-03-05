"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import MaterialIcon from "@/components/ui/MaterialIcon";
import ProgressStepper from "@/components/editor/ProgressStepper";
import UploadStep from "@/components/editor/UploadStep";
import TrimStep from "@/components/editor/TrimStep";
import MetadataStep from "@/components/editor/MetadataStep";
import LyricsStep from "@/components/editor/LyricsStep";
import AuthGuard from "@/components/auth/AuthGuard";
import { useAuth } from "@/context/AuthContext";
import { createTrack } from "@/lib/firebase/firestore";
import { uploadToCloudinary } from "@/lib/cloudinary/upload";
import { trimAudio } from "@/lib/audio/trimAudio";

const stepTitles = [
  { title: "Upload Audio", subtitle: "Upload MP3/WAV (Max 20MB) or paste a YouTube link" },
  { title: "Trim Track", subtitle: "Drag the handles to define start and end" },
  { title: "Track Metadata", subtitle: "Add a title and artist name" },
  { title: "Lyrics Editor", subtitle: "Add lyrics for the player display" },
];

export default function EditorPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [audioUrl, setAudioUrl] = useState("");
  const [duration, setDuration] = useState(0);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUploadComplete = useCallback((url: string, dur: number, ytTitle?: string) => {
    setAudioUrl(url);
    setDuration(dur);
    setTrimEnd(dur);
    if (ytTitle) setTitle(ytTitle);
    setCurrentStep(2);
  }, []);

  const handleRegionChange = useCallback((start: number, end: number) => {
    setTrimStart(start);
    setTrimEnd(end);
  }, []);

  const handleSaveDraft = async () => {
    try {
      await createTrack({
        userId: user?.uid || "",
        uploadedBy: user?.displayName || user?.email || "Anonymous",
        title: title || "Untitled",
        artist: artist || "Unknown",
        lyrics,
        audioUrl,
        trimmedAudioUrl: "",
        trimStart,
        trimEnd,
        duration,
        status: "draft",
      });
      alert("Draft saved!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  };

  const handlePublish = async () => {
    if (!title.trim() || !artist.trim()) {
      setError("Please fill in title and artist");
      return;
    }

    setPublishing(true);
    setError(null);

    try {
      const trimmedBlob = await trimAudio(audioUrl, trimStart, trimEnd);
      const trimmedFile = new File([trimmedBlob], "trimmed.wav", { type: "audio/wav" });
      const trimmedResult = await uploadToCloudinary(trimmedFile);

      const trackId = await createTrack({
        userId: user?.uid || "",
        uploadedBy: user?.displayName || user?.email || "Anonymous",
        title,
        artist,
        lyrics,
        audioUrl,
        trimmedAudioUrl: trimmedResult.url,
        trimStart,
        trimEnd,
        duration: trimEnd - trimStart,
        status: "published",
      });

      router.push(`/player/${trackId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Publish failed");
      setPublishing(false);
    }
  };

  const info = stepTitles[currentStep - 1];

  return (
    <AuthGuard>
      <div className="relative flex flex-col h-screen w-full overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-primary/20 px-6 py-4 lg:px-10 bg-bg-dark/50 backdrop-blur-md z-50">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 bg-primary rounded-lg text-white">
              <MaterialIcon icon="mic_external_on" className="block" />
            </Link>
            <div>
              <h2 className="text-xl font-bold leading-tight tracking-tight">Mic Grab BGM</h2>
              <p className="text-xs text-primary font-medium uppercase tracking-widest">
                Creator Studio
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link
              href="/"
              className="flex items-center justify-center rounded-xl size-10 bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
            >
              <MaterialIcon icon="home" />
            </Link>
          </div>
        </header>

        {/* Content — fills remaining space */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 lg:p-8 overflow-hidden">
          <div className="w-full max-w-3xl flex flex-col gap-6 h-full max-h-[700px]">
            {/* Stepper */}
            <ProgressStepper currentStep={currentStep} />

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm flex items-center gap-2 shrink-0">
                <MaterialIcon icon="error" />
                {error}
                <button onClick={() => setError(null)} className="ml-auto hover:text-red-300">
                  <MaterialIcon icon="close" className="text-lg" />
                </button>
              </div>
            )}

            {/* Single step card */}
            <div className="bg-primary/5 rounded-xl border border-primary/20 overflow-hidden flex flex-col flex-1 min-h-0">
              {/* Card header */}
              <div className="p-6 border-b border-primary/10 shrink-0">
                <h3 className="text-lg font-bold">
                  Step {currentStep}: {info.title}
                </h3>
                <p className="text-sm text-slate-500">{info.subtitle}</p>
              </div>

              {/* Card body — scrollable if needed */}
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {currentStep === 1 && (
                  <UploadStep onUploadComplete={handleUploadComplete} />
                )}

                {currentStep === 2 && (
                  <TrimStep
                    audioUrl={audioUrl}
                    onRegionChange={handleRegionChange}
                    onNext={() => setCurrentStep(3)}
                    onBack={() => setCurrentStep(1)}
                  />
                )}

                {currentStep === 3 && (
                  <MetadataStep
                    title={title}
                    artist={artist}
                    onTitleChange={setTitle}
                    onArtistChange={setArtist}
                    onNext={() => setCurrentStep(4)}
                    onBack={() => setCurrentStep(2)}
                  />
                )}

                {currentStep === 4 && (
                  <LyricsStep
                    lyrics={lyrics}
                    onLyricsChange={setLyrics}
                    onSaveDraft={handleSaveDraft}
                    onPublish={handlePublish}
                    onBack={() => setCurrentStep(3)}
                    publishing={publishing}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
