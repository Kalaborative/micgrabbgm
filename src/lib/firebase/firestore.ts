import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";
import type { Track, TrackCreateInput } from "@/types/track";

const COLLECTION = "tracks";

export async function getAllTracks(): Promise<Track[]> {
  const q = query(
    collection(db, COLLECTION),
    where("status", "==", "published")
  );
  const snapshot = await getDocs(q);
  const tracks = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Track));
  return tracks.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

export async function getTracksByUser(userId: string): Promise<Track[]> {
  const q = query(
    collection(db, COLLECTION),
    where("userId", "==", userId),
    where("status", "==", "published")
  );
  const snapshot = await getDocs(q);
  const tracks = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Track));
  return tracks.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

export async function getTrack(id: string): Promise<Track | null> {
  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Track;
}

export async function createTrack(data: TrackCreateInput): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateTrack(
  id: string,
  data: Partial<TrackCreateInput>
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}
