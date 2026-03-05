export interface Track {
  id: string;
  userId: string;
  uploadedBy: string;
  title: string;
  artist: string;
  lyrics: string;
  audioUrl: string;
  trimmedAudioUrl: string;
  trimStart: number;
  trimEnd: number;
  duration: number;
  status: "draft" | "published";
  createdAt: number;
  updatedAt: number;
}

export type TrackCreateInput = Omit<Track, "id" | "createdAt" | "updatedAt">;
