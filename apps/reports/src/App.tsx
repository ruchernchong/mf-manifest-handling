import { useState } from 'react';
import styles from './App.module.css';

export default function App() {
  const [generated, setGenerated] = useState(0);
  return (
    <section className={styles.panel} aria-labelledby="reports-title">
      <p>Reports remote</p>
      <h2 id="reports-title">Reports dashboard</h2>
      <button type="button" onClick={() => setGenerated((count) => count + 1)}>
        Generate report
      </button>
      <p aria-live="polite">Generated reports: {generated}</p>
    </section>
  );
}
