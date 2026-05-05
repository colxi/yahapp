export interface UpdateCheckResult {
  current: string;
  latest: string | null;
  updateAvailable: boolean;
}

/**
 * Fetches the deployed version.json (bypassing all caches) and compares it
 * with the version baked into this build.
 */
export async function checkForUpdate(): Promise<UpdateCheckResult> {
  const current = __APP_VERSION__;
  try {
    const url = `${import.meta.env.BASE_URL}version.json?_=${Date.now()}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return { current, latest: null, updateAvailable: false };
    const data: { version: string } = await res.json();
    return {
      current,
      latest: data.version,
      updateAvailable: data.version !== current,
    };
  } catch {
    return { current, latest: null, updateAvailable: false };
  }
}
