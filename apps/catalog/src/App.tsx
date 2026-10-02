import { useState } from 'react';
import styles from './App.module.css';

const products = [
  'Manifest explorer',
  'Remote loader',
  'Shared dependency inspector',
];

export default function App() {
  const [selected, setSelected] = useState(products[0]);
  return (
    <section className={styles.panel} aria-labelledby="catalog-title">
      <p>Catalog remote</p>
      <h2 id="catalog-title">Tools catalog</h2>
      <label htmlFor="catalog-product">Select a tool</label>
      <select
        id="catalog-product"
        value={selected}
        onChange={(event) => setSelected(event.target.value)}
      >
        {products.map((product) => (
          <option key={product}>{product}</option>
        ))}
      </select>
      <p aria-live="polite">Selected: {selected}</p>
    </section>
  );
}
