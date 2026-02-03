import React from 'react';
import ReactDOM from 'react-dom/client';
import { ErrorBoundary } from './ErrorBoundary';
import App from './App';
import '@orderly.network/ui/dist/styles.css';
import './theme-orderly.css';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element #root not found');

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
