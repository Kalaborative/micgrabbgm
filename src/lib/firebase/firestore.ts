import {
  collection,
  doc,
  getDocs,
  getDoc,
  getCountFromServer,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "./config";
import type { Track, TrackCreateInput } from "@/types/track";

const COLLECTION = "tracks";

export interface PaginatedResult {
  tracks: Track[];
  total: number;
  lastDoc: QueryDocumentSnapshot | null;
}

export async function getTracks(
  pageSize: number,
  cursor?: QueryDocumentSnapshot | null,
  userId?: string
): Promise<PaginatedResult> {
  const constraints = [
    where("status", "==", "published"),
    ...(userId ? [where("userId", "==", userId)] : []),
    orderBy("createdAt", "desc"),
    ...(cursor ? [startAfter(cursor)] : []),
    limit(pageSize),
  ];

  const countConstraints = [
    where("status", "==", "published"),
    ...(userId ? [where("userId", "==", userId)] : []),
  ];

  const [snapshot, countSnap] = await Promise.all([
    getDocs(query(collection(db, COLLECTION), ...constraints)),
    getCountFromServer(query(collection(db, COLLECTION), ...countConstraints)),
  ]);

  const tracks = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Track));
  const lastDoc = snapshot.docs[snapshot.docs.length - 1] ?? null;

  return { tracks, total: countSnap.data().count, lastDoc };
}

/** @deprecated Use getTracks with pagination instead */
export async function getAllTracks(): Promise<Track[]> {
  const q = query(
    collection(db, COLLECTION),
    where("status", "==", "published")
  );
  const snapshot = await getDocs(q);
  const tracks = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Track));
  return tracks.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

/** @deprecated Use getTracks with pagination instead */
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
