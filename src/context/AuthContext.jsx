import { createContext, useContext, useEffect, useState } from 'react';
const AuthContext = createContext(null);
const SESSION_KEY = 'internal-crm:demo-session';
const NAME_KEY = 'internal-crm:display-name';
export function AuthProvider({
  children
}) {
  const [displayName, setDisplayName] = useState(() => {
    try {
      return sessionStorage.getItem(SESSION_KEY) === 'active'
        ? sessionStorage.getItem(NAME_KEY) || ''
        : '';
    } catch {
      return '';
    }
  });
  const [authenticated, setAuthenticated] = useState(() => {
    try {
      return sessionStorage.getItem(SESSION_KEY) === 'active';
    } catch {
      return false;
    }
  });
  useEffect(() => {
    if (!authenticated || !displayName) return;
    try {
      sessionStorage.setItem(NAME_KEY, displayName);
    } catch {/* The displayed name still works in memory. */}
  }, [authenticated, displayName]);

  function login(name) {
    setDisplayName(name.trim());
    // Store only the demo session and display name; never store the password.
    try {
      sessionStorage.setItem(SESSION_KEY, 'active');
      sessionStorage.setItem(NAME_KEY, name.trim());
    } catch {/* In-memory session still works. */}
    setAuthenticated(true);
  }
  function logout() {
    setDisplayName('');
    try {
      sessionStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(NAME_KEY);
    } catch {/* Clear in-memory session regardless. */}
    setAuthenticated(false);
  }
  return <AuthContext.Provider value={{
    authenticated,
    displayName,
    login,
    logout
  }}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('AuthProvider отсутствует');
  return context;
}
