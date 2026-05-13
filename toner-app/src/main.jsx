import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { TonerProvider } from './context/TonerContext';
import App from './App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <TonerProvider>
      <App />
    </TonerProvider>
  </React.StrictMode>
);
