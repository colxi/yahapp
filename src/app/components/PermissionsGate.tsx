import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useLocationProvider } from '@/location-provider/use-cases/use-location-provider';
import './permissions-gate.css';

const STORAGE_KEY = 'yahapp:permissions-granted';

function needsOrientationPermission(): boolean {
  const DOE = DeviceOrientationEvent as unknown as {
    requestPermission?: () => Promise<string>;
  };
  return typeof DOE.requestPermission === 'function';
}

async function requestOrientationPermission(): Promise<boolean> {
  const DOE = DeviceOrientationEvent as unknown as {
    requestPermission?: () => Promise<string>;
  };
  if (typeof DOE.requestPermission !== 'function') return true;
  try {
    const state = await DOE.requestPermission();
    return state === 'granted';
  } catch {
    return false;
  }
}

interface Props {
  children: ReactNode;
}

export function PermissionsGate({ children }: Props) {
  const locationProvider = useLocationProvider();
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    if (dismissed) return;

    // Auto-dismiss if permissions are already granted and no iOS orientation prompt is needed.
    void (async () => {
      const locStatus = await locationProvider.requestPermissions().catch(() => 'unknown' as const);
      if (locStatus === 'granted' && !needsOrientationPermission()) {
        markDone();
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markDone = useCallback(() => {
    setDismissed(true);
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // storage unavailable
    }
  }, []);

  const handleGrant = useCallback(async () => {
    setRequesting(true);
    try {
      await locationProvider.requestPermissions();
      await requestOrientationPermission();
    } finally {
      setRequesting(false);
      markDone();
    }
  }, [locationProvider, markDone]);

  if (dismissed) return <>{children}</>;

  return (
    <div className="permissions-gate">
      <div className="permissions-gate__card">
        <h1 className="permissions-gate__title">Welcome to Yahapp</h1>
        <p className="permissions-gate__text">
          To track your hikes we need access to your <strong>location</strong> and{' '}
          <strong>compass</strong>. These stay on your device — nothing is sent to a server.
        </p>
        <button
          type="button"
          className="button permissions-gate__button"
          onClick={handleGrant}
          disabled={requesting}
        >
          {requesting ? 'Requesting…' : 'Allow permissions'}
        </button>
        <button
          type="button"
          className="permissions-gate__skip"
          onClick={markDone}
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
