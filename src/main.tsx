import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './web/App';
import './index.css';
import { initCustomTemplatesFromStorage } from './core/customTemplates';

// Restaura templates customizados persistidos no navegador
initCustomTemplatesFromStorage();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
