import type { ReactNode } from 'react';
import { useMapProvider } from '../use-cases/map-provider-store';

interface Props {
  children: ReactNode;
}

export function MapProviderRoot({ children }: Props) {
  const provider = useMapProvider();
  const Root = provider.Root;
  return <Root>{children}</Root>;
}
