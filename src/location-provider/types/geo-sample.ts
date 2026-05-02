export interface GeoSample {
  lat: number;
  lng: number;
  alt?: number;
  accuracy?: number;
  altitudeAccuracy?: number;
  speed?: number;
  heading?: number;
  timestamp: number;
}
