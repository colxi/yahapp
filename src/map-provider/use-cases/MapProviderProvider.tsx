import { useMemo, type ReactNode } from 'react';
import { MapProviderContext } from './map-provider-context';
import { selectMapProvider, type MapProviderId } from './select-map-provider';
import { useSettings } from '@/settings/use-cases/use-settings';

interface Props {
  children: ReactNode;
}

export function MapProviderProvider({ children }: Props) {
  const { settings } = useSettings();
  const provider = useMemo(
    () => selectMapProvider(settings.mapProviderId as MapProviderId),
    [settings.mapProviderId],
  );
  return (
    <MapProviderContext.Provider value={provider}>
      <provider.Root>{children}</provider.Root>
    </MapProviderContext.Provider>
  );
}
