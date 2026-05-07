import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { PermissionsGate } from './components/PermissionsGate';
import { ThemeInit } from './components/ThemeInit';
import { MapProviderRoot } from '@/map-provider/components/MapProviderRoot';
import { DebugWidget } from '@/debug/components/DebugWidget';
import { HomeView } from '@/home/components/HomeView';
import { RecordHikeView } from '@/hike-recorder/components/RecordHikeView';
import { HikesListView } from '@/hike-history/components/HikesListView';
import { HikeDetailView } from '@/hike-history/components/HikeDetailView';
import { AllHikesView } from '@/hike-history/components/AllHikesView';
import { SettingsView } from '@/settings/components/SettingsView';

export function App() {
  return (
    <>
      <ThemeInit />
      <PermissionsGate>
        <MapProviderRoot>
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
          <DebugWidget />
        </MapProviderRoot>
      </PermissionsGate>
    </>
  );
}
