import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Layout from './components/layout/Layout.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import PipelinePage from './pages/PipelinePage.jsx';
import ClientsPage from './pages/ClientsPage.jsx';
import ClientDetailsPage from './pages/ClientDetailsPage.jsx';
import DealDetailsPage from './pages/DealDetailsPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import { useAuth } from './context/AuthContext.jsx';
import LoginPage from './pages/LoginPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import WelcomePage from './pages/WelcomePage.jsx';
function DemoSession() {
  const {
    authenticated
  } = useAuth();
  return authenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
export default function App() {
  return <Routes>
    <Route path="login" element={<LoginPage />} />
    <Route path="forgot-password" element={<ForgotPasswordPage />} />
    <Route element={<DemoSession />}>
      <Route path="welcome" element={<WelcomePage />} />
      <Route element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="pipeline" element={<PipelinePage />} />
        <Route path="clients" element={<ClientsPage />} />
        <Route path="clients/:id" element={<ClientDetailsPage />} />
        <Route path="deals/:id" element={<DealDetailsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Route>
  </Routes>;
}
