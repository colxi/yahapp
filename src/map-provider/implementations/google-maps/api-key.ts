export const googleMapsApiKey = ((import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? '') as string).trim();
export const googleMapsMapId = ((import.meta.env.VITE_GOOGLE_MAPS_MAP_ID ?? '') as string).trim();
export const isGoogleMapsConfigured = googleMapsApiKey.length > 0;
export const supportsAdvancedMarkers = googleMapsMapId.length > 0;
