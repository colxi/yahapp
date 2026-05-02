import type { Hike } from '@/hike-storage/types/hike';
import type { Annotation } from '@/hike-storage/types/annotation';

export interface AddCheckpointInput {
  hike: Hike;
  id: string;
  lat: number;
  lng: number;
  title?: string;
  note?: string;
  createdAt?: number;
}

export function addCheckpoint({ hike, id, lat, lng, title, note, createdAt }: AddCheckpointInput): Hike {
  const nextIndex = hike.checkpoints.length + 1;
  const trimmedNote = note?.trim();
  const checkpoint: Annotation = {
    id,
    lat,
    lng,
    title: title?.trim() || `Checkpoint ${nextIndex}`,
    note: trimmedNote ? trimmedNote : undefined,
    createdAt: createdAt ?? Date.now(),
  };
  return { ...hike, checkpoints: [...hike.checkpoints, checkpoint] };
}
