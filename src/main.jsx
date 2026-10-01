import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import { CRMProvider } from './context/CRMContext.jsx';
import App from './App.jsx';
import './styles.css';
import { AuthProvider } from './context/AuthContext.jsx';
// Local development keeps clean URLs; published builds support static hosting.
const Router = import.meta.env.PROD ? HashRouter : BrowserRouter;

createRoot(document.getElementById('root')).render(<React.StrictMode>
  <Router>
    <AuthProvider>
      <CRMProvider>
        <App />
      </CRMProvider>
    </AuthProvider>
  </Router>
</React.StrictMode>);

