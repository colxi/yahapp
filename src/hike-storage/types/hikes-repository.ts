import type { Hike } from './hike';

export interface HikesRepository {
  list(): Hike[];
  getById(id: string): Hike | null;
  save(hike: Hike): void;
  update(hike: Hike): void;
  remove(id: string): void;
  clear(): void;
}
