import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { DebugContext } from './debug-context';
import type { DebugCoordinates, DebugContextValue } from '../types/debug';

export const isDebugEnabled = import.meta.env.VITE_DEBUG_MODE === 'true';

type OrientationMockFn = (deg: number | null) => void;

function getOrientationMock(): OrientationMockFn | undefined {
  if (typeof window === 'undefined') return undefined;
  return (window as unknown as Record<string, unknown>).setDeviceOrientationMock as
    OrientationMockFn | undefined;
}

interface Props {
  children: ReactNode;
}

function DebugProviderInner({ children }: Props) {
  const [mockCoordinates, setMockCoordinates] = useState<DebugCoordinates | null>(null);
  const [mockHeading, setMockHeadingState] = useState<number | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const setMockHeading = useCallback((heading: number | null) => {
    setMockHeadingState(heading);
    getOrientationMock()?.(heading);
  }, []);

  const value = useMemo<DebugContextValue>(() => ({
    mockCoordinates,
    setMockCoordinates,
    mockHeading,
    setMockHeading,
    isPanelOpen,
    setIsPanelOpen,
  }), [mockCoordinates, mockHeading, isPanelOpen, setMockHeading]);

  return (
    <DebugContext.Provider value={value}>
      {children}
    </DebugContext.Provider>
  );
}

export function DebugProvider({ children }: Props) {
  if (!isDebugEnabled) return <>{children}</>;
  return <DebugProviderInner>{children}</DebugProviderInner>;
}
