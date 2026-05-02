# Yahapp

A React webapp (Vite + TypeScript) that records GPS paths during a hike, draws them on a map, persists hikes locally, can render every saved path on a single map, supports background recording, and ships with a tab-bar UI in dark mode by default.

The same code runs in three places:

- **Browser** — installable PWA with offline app shell. Foreground recording works fully; background recording is best-effort while the tab is alive.
- **iOS** — webview wrapper produced by Capacitor (Xcode project under `ios/`). Real background recording via `@capacitor-community/background-geolocation`.
- **Android** — webview wrapper produced by Capacitor (Gradle project under `android/`). Real background recording via the foreground location service.

The work plan that this project follows lives at `docs/PLAN.md`.

## Architecture

- **App**: React 19 + Vite 6 + TypeScript (strict). Domain-based folder layout under `src/`.
- **Native wrapping**: [Capacitor 6](https://capacitorjs.com/) — produces real `/ios` (Xcode) and `/android` (Gradle) wrappers. No React Native.
- **Maps**: `@vis.gl/react-google-maps`, behind a `MapProvider` interface so additional providers (e.g. real topo tiles) can be plugged in later. Uses `mapTypeId: 'terrain'` for a quasi-topographic view in Google Maps.
- **Location**: `@capacitor/geolocation` for foreground, `@capacitor-community/background-geolocation` for background — both behind a `LocationProvider` interface. Falls back to `navigator.geolocation` in the browser.
- **Persistence**: versioned `HikesRepository` over `localStorage`.
- **State**: local + small React contexts for theme, settings, repository, and the chosen map / location providers.
- **Tests**: Jest + ts-jest + Testing Library; specs live next to the file under test (`foo.ts` + `foo.spec.ts`).
- **Lint**: ESLint flat config (typescript-eslint, react-hooks, react-refresh). No Prettier.

### Folder layout

```
src/
  app/                # Shell, routing, tab bar, ThemeProvider
  home/               # Home view
  hike-recorder/      # Live recording (use-cases, hook, view)
  hike-storage/       # Hike type + repository
  hike-history/       # List / detail / render-all
  location-provider/  # Browser + Capacitor implementations + selector
  map-provider/       # Google Maps implementation + selector
  settings/           # Settings view + persistence + unit formatting
  tools/              # geo, storage, time, id helpers
  styles/             # global theme variables
  main.tsx
ios/                  # Capacitor-generated Xcode project
android/              # Capacitor-generated Gradle project
docs/PLAN.md          # full work plan
```

## Getting started

```bash
npm install
cp .env.example .env   # then add your Google Maps API key
npm run dev            # http://localhost:5173
```

### Google Maps configuration

| Variable                     | Required | Purpose                                                                                                                                      |
| ---------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `VITE_GOOGLE_MAPS_API_KEY`   | Yes      | Renders the map. Without it the map area shows an inline configuration hint and the rest of the app still works.                            |
| `VITE_GOOGLE_MAPS_MAP_ID`    | No       | Enables Google's [Advanced Markers](https://developers.google.com/maps/documentation/javascript/advanced-markers) (rich pins). Without a Map ID, Yahapp automatically uses legacy markers — no warning, no broken UI. |

### Run as a webapp

`npm run dev` is enough for development (geolocation works on `http://localhost`). To deploy to a public URL, build and serve `dist/` over **HTTPS** (geolocation, Wake Lock, and Service Workers all require a secure context).

```bash
npm run build          # produces dist/ + service worker + manifest
npm run preview        # serves dist/ locally to validate the production build
```

The PWA manifest, service worker, and icons are wired up automatically. The first time the production build is loaded, browsers will offer to install Yahapp as an app (mobile home-screen / desktop). When installed, the app launches in a standalone window without browser chrome and the app shell stays available offline (the Google Maps tiles still need network).

### Browser limitations vs. native

| Capability                | Browser (PWA)                                         | iOS / Android (Capacitor) |
| ------------------------- | ----------------------------------------------------- | ------------------------- |
| Foreground tracking       | ✅ via `navigator.geolocation`                        | ✅ via `@capacitor/geolocation` |
| Background tracking       | ⚠️ best-effort; pauses if the tab is killed/suspended | ✅ via `@capacitor-community/background-geolocation` foreground service |
| Keep screen on            | ✅ via the Screen Wake Lock API (handled automatically) | ✅ via the foreground service |
| Offline app shell         | ✅ service worker precache                            | ✅ webview ships the bundle |
| Install to home screen    | ✅ via the browser's PWA install                      | ✅ regular App Store / Play Store install |

### Available scripts

| Script              | Purpose                                   |
| ------------------- | ----------------------------------------- |
| `npm run dev`       | Run the Vite dev server                   |
| `npm run build`     | Type-check + production build to `dist/`  |
| `npm run preview`   | Preview the production build              |
| `npm test`          | Run Jest once                             |
| `npm run test:watch`| Run Jest in watch mode                    |
| `npm run lint`      | Run ESLint                                |
| `npm run cap:sync`  | Build + copy assets into iOS/Android      |
| `npm run cap:open:ios`     | Open the iOS project in Xcode      |
| `npm run cap:open:android` | Open the Android project in Studio |

### Mobile builds

Building the iOS app requires macOS + Xcode; building the Android app requires Android Studio / SDK.

```bash
npm run build
npx cap sync
npx cap open ios       # macOS only
npx cap open android   # any platform with Android SDK
```

The native projects under `ios/` and `android/` are committed to source control. Re-run `npx cap sync` after each `npm run build` to copy the latest webapp into the native wrappers.

#### Permissions
- **iOS** (`ios/App/App/Info.plist`): `NSLocationWhenInUseUsageDescription`, `NSLocationAlwaysAndWhenInUseUsageDescription`, and `UIBackgroundModes` += `location` are pre-configured.
- **Android** (`android/app/src/main/AndroidManifest.xml`): `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`, `ACCESS_BACKGROUND_LOCATION`, `FOREGROUND_SERVICE`, and `FOREGROUND_SERVICE_LOCATION` are pre-configured.

## Adding a new map provider

1. Implement `MapProvider` in `src/map-provider/implementations/<id>/`.
2. Register it in `src/map-provider/use-cases/select-map-provider.ts`.
3. Add the option in `src/settings/components/SettingsView.tsx` and to the `MapProviderId` union.

## Adding a new location provider

1. Implement `LocationProvider` in `src/location-provider/implementations/`.
2. Wire it into `selectLocationProvider`.
