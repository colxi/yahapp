import { useEffect, useState } from 'react';
import { detectPlatform, type PlatformInfo } from './detect-platform';

export function usePlatform(): PlatformInfo {
  const [info, setInfo] = useState<PlatformInfo>(() => detectPlatform());

  useEffect(() => {
    setInfo(detectPlatform());
  }, []);

  return info;
}
