import { lazy, Suspense } from 'react';
import RemoteBoundary from './RemoteBoundary';
import './App.css';

const Catalog = lazy(() => import('catalog/App'));
const Analytics = lazy(() => import('analytics/App'));

export default function App() {
  return (
    <main className="host-content">
      <header>
        <p>Module Federation playground</p>
        <h1>Host MFE</h1>
        <p>Two independently built applications, composed in one host.</p>
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
      </div>
    </main>
  );
}
