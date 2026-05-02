import { createBrowserLocationProvider } from './browser-location-provider';

interface MockGeolocation {
  watchPosition: jest.Mock;
  clearWatch: jest.Mock;
  getCurrentPosition: jest.Mock;
}

function installMockGeolocation(): MockGeolocation {
  const mock: MockGeolocation = {
    watchPosition: jest.fn(),
    clearWatch: jest.fn(),
    getCurrentPosition: jest.fn(),
  };
  Object.defineProperty(global.navigator, 'geolocation', {
    value: mock,
    configurable: true,
    writable: true,
  });
  return mock;
}

describe('createBrowserLocationProvider', () => {
  it('reports id and lack of background support', () => {
    const provider = createBrowserLocationProvider();
    expect(provider.id).toBe('browser');
    expect(provider.supportsBackground).toBe(false);
  });

  it('translates GeolocationPosition into GeoSample on watch', () => {
    const mock = installMockGeolocation();
    let watchId = 0;
    mock.watchPosition.mockImplementation((onSuccess) => {
      watchId += 1;
      onSuccess({
        coords: {
          latitude: 41.4,
          longitude: 2.17,
          altitude: 80,
          accuracy: 5,
          altitudeAccuracy: 3,
          speed: 1.2,
          heading: 90,
        },
        timestamp: 1700_000_000_000,
      });
      return watchId;
    });

    const provider = createBrowserLocationProvider();
    const samples: unknown[] = [];
    const sub = provider.watch({}, (s) => samples.push(s));

    expect(samples).toEqual([
      {
        lat: 41.4,
        lng: 2.17,
        alt: 80,
        accuracy: 5,
        altitudeAccuracy: 3,
        speed: 1.2,
        heading: 90,
        timestamp: 1700_000_000_000,
      },
    ]);

    sub.stop();
    expect(mock.clearWatch).toHaveBeenCalledWith(watchId);
  });

  it('rejects getCurrentPosition when geolocation API is unavailable', async () => {
    Object.defineProperty(global.navigator, 'geolocation', {
      value: undefined,
      configurable: true,
      writable: true,
    });
    const provider = createBrowserLocationProvider();
    await expect(provider.getCurrentPosition()).rejects.toThrow(/not supported/i);
  });
});
