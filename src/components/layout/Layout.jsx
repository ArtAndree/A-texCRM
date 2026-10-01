import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Sidebar from './Sidebar.jsx';
import { useCRM } from '../../context/CRMContext.jsx';
export default function Layout() {
  const {
    storageError,
    resetDemo
  } = useCRM();
  const {
    pathname
  } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return <div className="app">
    <a
      className="skip-link"
      href="#main"
      onClick={e => {
        e.preventDefault();
        document.getElementById('main')?.focus();
      }}
    >К содержимому</a>
    <Sidebar />
    <div className={`workspace ${pathname === '/clients' ? 'clients-workspace' : pathname === '/pipeline' ? 'pipeline-workspace' : ''}`}>
      <main id="main" tabIndex={-1}>
        {storageError && <p className="alert" role="alert">{storageError}</p>}
        <Outlet />
      </main>
      <footer>
        <button className="text-button" onClick={() => {
          if (window.confirm('Сбросить изменения и восстановить демо-данные?')) resetDemo();
        }}>Сбросить демо-данные</button>
      </footer>
    </div>
  </div>;
}
