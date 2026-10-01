import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
export default function WelcomePage() {
  const navigate = useNavigate();
  const { displayName } = useAuth();
  useEffect(() => {
    const timeout = setTimeout(() => navigate('/', {
      replace: true
    }), 2400);
    return () => clearTimeout(timeout);
  }, [navigate]);
  return (
    <main className="welcome" aria-live="polite">
      <p className="welcome-message">
        Добро пожаловать, {displayName || 'Пользователь'}!
      </p>
    </main>
  );
}
