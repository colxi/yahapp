export interface DebugCoordinates {
  lat: number;
  lng: number;
}

export interface DebugContextValue {
  mockCoordinates: DebugCoordinates | null;
  setMockCoordinates: (coords: DebugCoordinates | null) => void;
  mockHeading: number | null;
  setMockHeading: (heading: number | null) => void;
  isPanelOpen: boolean;
  setIsPanelOpen: (open: boolean) => void;
}
