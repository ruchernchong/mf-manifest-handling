import { loadRemote } from '@module-federation/enhanced/runtime';
import { type ComponentType, lazy, Suspense } from 'react';
import RemoteBoundary from './RemoteBoundary';
import './App.css';

const Catalog = lazy(() => import('catalog/App'));
const Analytics = lazy(() => import('analytics/App'));

const Reports = lazy(async () => {
  const remote = await loadRemote<{ default: ComponentType }>('reports/App');
  if (!remote) {
    throw new Error('Reports remote did not return a module');
  }
  return remote;
});

export default function App() {
  return (
    <main className="host-content">
      <header>
        <p>Module Federation playground</p>
        <h1>Host MFE</h1>
        <p>Three independently built applications, composed in one host.</p>
      </header>
      <div className="host-remotes">
        <RemoteBoundary name="Catalog">
          <Suspense fallback={<p role="status">Loading catalog…</p>}>
            <Catalog />
          </Suspense>
        </RemoteBoundary>
        <RemoteBoundary name="Analytics">
          <Suspense fallback={<p role="status">Loading analytics…</p>}>
            <Analytics />
          </Suspense>
        </RemoteBoundary>
        <RemoteBoundary name="Reports">
          <Suspense fallback={<p role="status">Loading reports…</p>}>
            <Reports />
          </Suspense>
        </RemoteBoundary>
      </div>
    </main>
  );
}
