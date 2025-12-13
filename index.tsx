
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { I18nProvider } from './context/I18nContext';
import { initializeLocationService } from './services/locationService';
import ErrorBoundary from './components/ErrorBoundary';
import { logger } from './utils/logger';
import { initSentry } from './config/monitoring';

// Initialize Sentry error monitoring
initSentry();

// Initialize location service on app start
initializeLocationService().catch((error) => logger.error('Failed to initialize location service', error));

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <I18nProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </I18nProvider>
    </ErrorBoundary>
  </React.StrictMode>
);