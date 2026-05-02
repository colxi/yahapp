import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocationProvider } from '@/location-provider/use-cases/use-location-provider';
import { useHikesRepository } from '@/hike-storage/use-cases/use-hikes-repository';
import { useSettings } from '@/settings/use-cases/use-settings';
import { createId } from '@/tools/id/create-id';
import type { Subscription } from '@/location-provider/types/location-provider';
import type { Hike } from '@/hike-storage/types/hike';
import { startHike } from '../use-cases/start-hike';
import { addPoint } from '../use-cases/add-point';
import { pauseHike, resumeHike } from '../use-cases/pause-hike';
import { completeHike } from '../use-cases/complete-hike';
import { clearDestination, setDestination } from '../use-cases/set-destination';
import { addCheckpoint } from '../use-cases/add-checkpoint';
import { removeCheckpoint, updateCheckpoint } from '../use-cases/update-checkpoint';
import { updateHikeMetadata } from '../use-cases/update-hike-metadata';

export interface CompleteOptions {
  name?: string;
  description?: string;
}

export interface UseHikeRecorder {
  hike: Hike | null;
  error: string | null;
  permission: string | null;
  isStarting: boolean;
  start: () => Promise<void>;
  pause: () => void;
  resume: () => void;
  complete: (options?: CompleteOptions) => Hike | null;
  discard: () => void;
  setDestinationAt: (location: { lat: number; lng: number }, opts?: { title?: string; note?: string }) => void;
  clearDestinationAt: () => void;
  addCheckpointAt: (location: { lat: number; lng: number }, opts?: { title?: string; note?: string }) => void;
  updateCheckpointAt: (id: string, opts: { title?: string; note?: string }) => void;
  removeCheckpointAt: (id: string) => void;
}

export function useHikeRecorder(): UseHikeRecorder {
  const provider = useLocationProvider();
  const repo = useHikesRepository();
  const { settings } = useSettings();

  const [hike, setHike] = useState<Hike | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [permission, setPermission] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  const watchRef = useRef<Subscription | null>(null);
  const backgroundRef = useRef<Subscription | null>(null);
  const hikeRef = useRef<Hike | null>(null);

  useEffect(() => {
    hikeRef.current = hike;
  }, [hike]);

  const stopAll = useCallback(async () => {
    if (watchRef.current) {
      await watchRef.current.stop();
      watchRef.current = null;
    }
    if (backgroundRef.current) {
      await backgroundRef.current.stop();
      backgroundRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      void stopAll();
    };
  }, [stopAll]);

  const onSample = useCallback((sample: Parameters<typeof addPoint>[1]) => {
    const current = hikeRef.current;
    if (!current) return;
    const updated = addPoint(current, sample);
    if (updated !== current) {
      hikeRef.current = updated;
      setHike(updated);
    }
  }, []);

  const applyToHike = useCallback((mutator: (h: Hike) => Hike) => {
    const current = hikeRef.current;
    if (!current) return;
    const next = mutator(current);
    if (next !== current) {
      hikeRef.current = next;
      setHike(next);
    }
  }, []);

  const start = useCallback(
    async () => {
      setError(null);
      setIsStarting(true);
      try {
        const status = await provider.requestPermissions();
        setPermission(status);
        if (status === 'denied') {
          throw new Error('Location permission was denied. Enable it in system settings to record a hike.');
        }

        const fresh = startHike({
          id: createId(),
          startedAt: Date.now(),
        });
        hikeRef.current = fresh;
        setHike(fresh);

        watchRef.current = provider.watch({ highAccuracy: true }, onSample, (err) => setError(err.message));

        if (settings.backgroundRecording && provider.supportsBackground && provider.startBackground) {
          try {
            backgroundRef.current = await provider.startBackground(
              { highAccuracy: true, distanceFilterMeters: 5 },
              onSample,
              (err) => setError(err.message),
            );
          } catch (e) {
            setError((e as Error).message);
          }
        }
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setIsStarting(false);
      }
    },
    [provider, settings.backgroundRecording, onSample],
  );

  const pause = useCallback(() => {
    applyToHike(pauseHike);
  }, [applyToHike]);

  const resume = useCallback(() => {
    applyToHike(resumeHike);
  }, [applyToHike]);

  const complete = useCallback(
    (options?: CompleteOptions) => {
      const current = hikeRef.current;
      if (!current) return null;
      const withMeta = options
        ? updateHikeMetadata({ hike: current, name: options.name, description: options.description })
        : current;
      const finished = completeHike({ hike: withMeta, endedAt: Date.now() });
      repo.save(finished);
      hikeRef.current = null;
      setHike(null);
      void stopAll();
      return finished;
    },
    [repo, stopAll],
  );

  const discard = useCallback(() => {
    hikeRef.current = null;
    setHike(null);
    void stopAll();
  }, [stopAll]);

  const setDestinationAt = useCallback(
    (location: { lat: number; lng: number }, opts?: { title?: string; note?: string }) => {
      applyToHike((h) =>
        setDestination({
          hike: h,
          id: createId(),
          lat: location.lat,
          lng: location.lng,
          title: opts?.title,
          note: opts?.note,
        }),
      );
    },
    [applyToHike],
  );

  const clearDestinationAt = useCallback(() => {
    applyToHike(clearDestination);
  }, [applyToHike]);

  const addCheckpointAt = useCallback(
    (location: { lat: number; lng: number }, opts?: { title?: string; note?: string }) => {
      applyToHike((h) =>
        addCheckpoint({
          hike: h,
          id: createId(),
          lat: location.lat,
          lng: location.lng,
          title: opts?.title,
          note: opts?.note,
        }),
      );
    },
    [applyToHike],
  );

  const updateCheckpointAt = useCallback(
    (id: string, opts: { title?: string; note?: string }) => {
      applyToHike((h) => updateCheckpoint({ hike: h, id, title: opts.title, note: opts.note }));
    },
    [applyToHike],
  );

  const removeCheckpointAt = useCallback(
    (id: string) => {
      applyToHike((h) => removeCheckpoint(h, id));
    },
    [applyToHike],
  );

  return {
    hike,
    error,
    permission,
    isStarting,
    start,
    pause,
    resume,
    complete,
    discard,
    setDestinationAt,
    clearDestinationAt,
    addCheckpointAt,
    updateCheckpointAt,
    removeCheckpointAt,
  };
}
