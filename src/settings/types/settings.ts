export type UnitsSystem = 'metric' | 'imperial';
export type MapProviderId = 'google-maps';

export interface AppSettings {
  units: UnitsSystem;
  mapProviderId: MapProviderId;
  backgroundRecording: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  units: 'metric',
  mapProviderId: 'google-maps',
  backgroundRecording: true,
};
