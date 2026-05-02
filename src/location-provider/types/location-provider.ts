import type { GeoSample } from './geo-sample';

export type PermissionStatus = 'granted' | 'denied' | 'prompt' | 'unknown';

export interface WatchOptions {
  highAccuracy?: boolean;
  distanceFilterMeters?: number;
  intervalMs?: number;
}

export interface Subscription {
  stop: () => void | Promise<void>;
}

export interface LocationProvider {
  readonly id: string;
  readonly supportsBackground: boolean;

  requestPermissions(): Promise<PermissionStatus>;
  getCurrentPosition(): Promise<GeoSample>;
  watch(options: WatchOptions, onSample: (sample: GeoSample) => void, onError?: (err: Error) => void): Subscription;
  startBackground?(
    options: WatchOptions,
    onSample: (sample: GeoSample) => void,
    onError?: (err: Error) => void,
  ): Promise<Subscription>;
}
