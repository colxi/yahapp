import type { ComponentType, ReactNode } from 'react';
import type { LatLng } from '@/tools/geo/haversine';

export interface BBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface PathStyle {
  color?: string;
  width?: number;
  opacity?: number;
}

export interface MapRootProps {
  children: ReactNode;
}

export interface MapViewProps {
  center?: LatLng;
  zoom?: number;
  bounds?: BBox;
  followLocation?: LatLng | null;
  className?: string;
  cursor?: 'default' | 'crosshair';
  onMapClick?: (location: LatLng) => void;
  children?: ReactNode;
}

export interface PathOverlayProps {
  points: readonly LatLng[];
  style?: PathStyle;
}

export interface MarkerOverlayProps {
  position: LatLng;
  label?: string;
  variant?: 'default' | 'start' | 'end' | 'live' | 'destination' | 'checkpoint';
  onClick?: () => void;
}

export interface MapProvider {
  readonly id: string;
  readonly displayName: string;

  Root: ComponentType<MapRootProps>;
  View: ComponentType<MapViewProps>;
  PathOverlay: ComponentType<PathOverlayProps>;
  MarkerOverlay: ComponentType<MarkerOverlayProps>;
}
