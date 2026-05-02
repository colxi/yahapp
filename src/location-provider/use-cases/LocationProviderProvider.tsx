import { useMemo, type ReactNode } from 'react';
import { LocationProviderContext } from './location-provider-context';
import { selectLocationProvider } from './select-location-provider';

interface Props {
  children: ReactNode;
}

export function LocationProviderProvider({ children }: Props) {
  const provider = useMemo(() => selectLocationProvider(), []);
  return (
    <LocationProviderContext.Provider value={provider}>
      {children}
    </LocationProviderContext.Provider>
  );
}
