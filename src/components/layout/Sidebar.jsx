import Icon from '../ui/Icon.jsx';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
export default function Sidebar() {
  const {
    logout,
    displayName
  } = useAuth();
  return <aside className="sidebar">
    <div className="profile">
      <span className="avatar" aria-hidden="true" />
      <span>{displayName || 'Пользователь'}</span>
    </div>
    <nav aria-label="Основная навигация">
      <NavLink to="/" end><Icon name="home" />Основной экран</NavLink>
      <NavLink to="/pipeline"><Icon name="deals" />Сделки</NavLink>
      <NavLink to="/clients"><Icon name="users" />Клиенты</NavLink>
    </nav>
    <button className="logout text-button" onClick={logout}>Выйти</button>
  </aside>;
}
