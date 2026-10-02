// Public remote contract; components currently accept no props.
declare module 'catalog/App' {
  import type { ComponentType } from 'react';

  const App: ComponentType;
  export default App;
}

declare module 'analytics/App' {
  import type { ComponentType } from 'react';

  const App: ComponentType;
  export default App;
}
