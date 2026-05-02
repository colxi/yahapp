import type { Hike } from '@/hike-storage/types/hike';

export interface UpdateHikeMetadataInput {
  hike: Hike;
  name?: string;
  description?: string;
}

export function updateHikeMetadata({ hike, name, description }: UpdateHikeMetadataInput): Hike {
  const trimmedName = name?.trim();
  const trimmedDescription = description?.trim();

  const next: Hike = {
    ...hike,
    name: name === undefined ? hike.name : trimmedName || hike.name,
    description:
      description === undefined
        ? hike.description
        : trimmedDescription
          ? trimmedDescription
          : undefined,
  };
  return next;
}
