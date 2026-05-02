import type { Hike } from '../types/hike';
import type { HikesRepository } from '../types/hikes-repository';

interface ImportPayload {
  schemaVersion: number;
  hikes: unknown[];
}

function isImportPayload(value: unknown): value is ImportPayload {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return typeof v.schemaVersion === 'number' && Array.isArray(v.hikes);
}

function isValidHike(value: unknown): value is Hike {
  if (!value || typeof value !== 'object') return false;
  const h = value as Record<string, unknown>;
  return (
    typeof h.id === 'string' &&
    typeof h.name === 'string' &&
    typeof h.startedAt === 'number' &&
    Array.isArray(h.points) &&
    h.stats !== undefined
  );
}

export interface ImportResult {
  total: number;
  added: number;
  skipped: number;
}

export function importHikesFromJson(json: string, repo: HikesRepository): ImportResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error('The file does not contain valid JSON.');
  }

  if (!isImportPayload(parsed)) {
    throw new Error('The file is not a valid Yahapp export.');
  }

  const validHikes = parsed.hikes.filter(isValidHike);
  if (validHikes.length === 0 && parsed.hikes.length > 0) {
    throw new Error('The file contains hike entries but none are valid.');
  }

  let added = 0;
  let skipped = 0;

  for (const hike of validHikes) {
    const existing = repo.getById(hike.id);
    if (existing) {
      skipped++;
    } else {
      repo.save({
        ...hike,
        checkpoints: Array.isArray(hike.checkpoints) ? hike.checkpoints : [],
      });
      added++;
    }
  }

  return { total: validHikes.length, added, skipped };
}

export function pickFileAndImport(repo: HikesRepository): Promise<ImportResult> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';

    input.addEventListener('change', () => {
      const file = input.files?.[0];
      if (!file) return reject(new Error('No file selected.'));

      const reader = new FileReader();
      reader.onload = () => {
        try {
          const result = importHikesFromJson(reader.result as string, repo);
          resolve(result);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read the file.'));
      reader.readAsText(file);
    });

    input.click();
  });
}
