import { Outlet } from 'react-router-dom';
import { TabBar } from './TabBar';
import './app-shell.css';

export function AppShell() {
  return (
    <div className="app-shell">
      <main className="app-shell__main">
        <Outlet />
      </main>
      <TabBar />
    </div>
  );
}
