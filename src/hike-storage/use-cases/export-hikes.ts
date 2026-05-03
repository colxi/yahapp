import type { Hike } from '../types/hike';

interface ExportPayload {
  schemaVersion: 1;
  exportedAt: string;
  hikes: Hike[];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
}

function triggerDownload(json: string, filename: string): void {
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportHikes(hikes: Hike[]): void {
  const payload: ExportPayload = {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    hikes,
  };

  const json = JSON.stringify(payload, null, 2);
  const date = new Date().toISOString().slice(0, 10);
  triggerDownload(json, `yahapp-hikes-${date}.json`);
}

export function exportSingleHike(hike: Hike): void {
  const payload: ExportPayload = {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    hikes: [hike],
  };

  const json = JSON.stringify(payload, null, 2);
  const slug = slugify(hike.name) || 'hike';
  triggerDownload(json, `yahapp-${slug}.json`);
}

function buildHikeFile(hike: Hike): File {
  const payload: ExportPayload = {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    hikes: [hike],
  };
  const json = JSON.stringify(payload, null, 2);
  const slug = slugify(hike.name) || 'hike';
  return new File([json], `yahapp-${slug}.json`, { type: 'application/json' });
}

export function canShare(): boolean {
  return typeof navigator.share === 'function';
}

export async function shareHike(hike: Hike): Promise<void> {
  const text = `Check out my hike "${hike.name}" recorded with Yahapp!`;

  // Try sharing with the file attached first.
  const file = buildHikeFile(hike);
  const withFile: ShareData = { title: hike.name, text, files: [file] };

  if (navigator.canShare?.(withFile)) {
    await navigator.share(withFile);
    return;
  }

  // Fallback: share text only.
  await navigator.share({ title: hike.name, text });
}
