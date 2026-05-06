import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { selectMapProvider, type MapProviderId } from './select-map-provider';
import { useSettingsStore } from '@/settings/use-cases/settings-store';
import type { MapProvider } from '../types/map-provider';

interface MapProviderState {
  provider: MapProvider;
}

function createProvider(): MapProvider {
  const { settings } = useSettingsStore.getState();
  return selectMapProvider(settings.mapProviderId as MapProviderId);
}

export const useMapProviderStore = create<MapProviderState>()(
  immer(() => ({
    provider: createProvider(),
  })),
);

useSettingsStore.subscribe((state, prevState) => {
  if (state.settings.mapProviderId !== prevState.settings.mapProviderId) {
    const next = selectMapProvider(state.settings.mapProviderId as MapProviderId);
    useMapProviderStore.setState({ provider: next });
  }
});

export function useMapProvider(): MapProvider {
  return useMapProviderStore((s) => s.provider);
}
