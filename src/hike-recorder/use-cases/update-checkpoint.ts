import type { Hike } from '@/hike-storage/types/hike';

export interface UpdateCheckpointInput {
  hike: Hike;
  id: string;
  title?: string;
  note?: string;
}

export function updateCheckpoint({ hike, id, title, note }: UpdateCheckpointInput): Hike {
  const index = hike.checkpoints.findIndex((c) => c.id === id);
  if (index < 0) return hike;

  const checkpoints = hike.checkpoints.slice();
  const current = checkpoints[index];
  const trimmedTitle = title?.trim();
  const trimmedNote = note?.trim();

  checkpoints[index] = {
    ...current,
    title: title === undefined ? current.title : trimmedTitle || current.title,
    note: note === undefined ? current.note : trimmedNote ? trimmedNote : undefined,
  };

  return { ...hike, checkpoints };
}

export function removeCheckpoint(hike: Hike, id: string): Hike {
  const next = hike.checkpoints.filter((c) => c.id !== id);
  if (next.length === hike.checkpoints.length) return hike;
  return { ...hike, checkpoints: next };
}
