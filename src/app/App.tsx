import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { ThemeProvider } from './providers/ThemeProvider';
import { LocationProviderProvider } from '@/location-provider/use-cases/LocationProviderProvider';
import { MapProviderProvider } from '@/map-provider/use-cases/MapProviderProvider';
import { HikesRepositoryProvider } from '@/hike-storage/use-cases/HikesRepositoryProvider';
import { SettingsProvider } from '@/settings/use-cases/SettingsProvider';
import { HomeView } from '@/home/components/HomeView';
import { RecordHikeView } from '@/hike-recorder/components/RecordHikeView';
import { HikesListView } from '@/hike-history/components/HikesListView';
import { HikeDetailView } from '@/hike-history/components/HikeDetailView';
import { AllHikesView } from '@/hike-history/components/AllHikesView';
import { SettingsView } from '@/settings/components/SettingsView';

export function App() {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <HikesRepositoryProvider>
          <LocationProviderProvider>
            <MapProviderProvider>
              <BrowserRouter basename={import.meta.env.BASE_URL}>
                <Routes>
                  <Route element={<AppShell />}>
                    <Route index element={<HomeView />} />
                    <Route path="record" element={<RecordHikeView />} />
                    <Route path="history" element={<HikesListView />} />
                    <Route path="history/all" element={<AllHikesView />} />
                    <Route path="history/:id" element={<HikeDetailView />} />
                    <Route path="settings" element={<SettingsView />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Route>
                </Routes>
              </BrowserRouter>
            </MapProviderProvider>
          </LocationProviderProvider>
        </HikesRepositoryProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}
