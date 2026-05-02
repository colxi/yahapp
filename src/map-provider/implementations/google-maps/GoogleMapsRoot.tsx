import { APIProvider } from '@vis.gl/react-google-maps';
import type { ReactNode } from 'react';
import { googleMapsApiKey, isGoogleMapsConfigured } from './api-key';

interface Props {
  children: ReactNode;
}

export function GoogleMapsRoot({ children }: Props) {
  if (!isGoogleMapsConfigured) {
    return <>{children}</>;
  }
  return <APIProvider apiKey={googleMapsApiKey}>{children}</APIProvider>;
}
