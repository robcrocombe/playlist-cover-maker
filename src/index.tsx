import { createRoot } from 'react-dom/client';
import { App } from './App';
import { AppStoreProvider } from './AppStore';

const container = document.getElementById('app')!;
const root = createRoot(container);
root.render(
  <AppStoreProvider>
    <App />
  </AppStoreProvider>
);
