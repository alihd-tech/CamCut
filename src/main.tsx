import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// @ts-expect-error - virtual module provided by vite-plugin-pwa
import { registerSW } from 'virtual:pwa-register';

const root = document.getElementById('root')!;
root.classList.add('app-root');

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      console.log('New content available, please refresh');
      // Optionally show a notification to the user
      if (confirm('New version available! Reload to update?')) {
        updateSW(true);
      }
    },
    onOfflineReady() {
      console.log('App ready to work offline');
    },
    onRegistered(registration: ServiceWorkerRegistration | undefined) {
      console.log('Service Worker registered:', registration);
    },
    onRegisterError(error: Error) {
      console.error('Service Worker registration error:', error);
    }
  });
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
);
