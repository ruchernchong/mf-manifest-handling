import { useState } from 'react';
import styles from './App.module.css';

export default function App() {
  const [events, setEvents] = useState(0);
  return (
    <section className={styles.panel} aria-labelledby="analytics-title">
      <p>Analytics remote</p>
      <h2 id="analytics-title">Event tracker</h2>
      <p aria-live="polite">Recorded events: {events}</p>
      <button type="button" onClick={() => setEvents((count) => count + 1)}>
        Record event
      </button>
      <button type="button" onClick={() => setEvents(0)}>
        Reset
      </button>
    </section>
  );
}
