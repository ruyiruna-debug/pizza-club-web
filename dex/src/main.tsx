import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@orderly.network/ui/dist/styles.css';
import './theme-orderly.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
