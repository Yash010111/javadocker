import { useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { clearAuthData, loadAuthData, saveAuthData } from './utils/auth';
import type { AuthResponse } from './types';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  const [auth, setAuth] = useState<AuthResponse | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setAuth(loadAuthData());
  }, []);

  const isAdmin = useMemo(() => auth?.roles.some((role) => role === 'ROLE_ADMIN') ?? false, [auth]);

  const handleAuthSuccess = (data: AuthResponse) => {
    saveAuthData(data);
    setAuth(data);
    if (data.roles.includes('ROLE_ADMIN')) {
      navigate('/admin');
    } else {
      navigate('/home');
    }
  };

  const handleLogout = () => {
    clearAuthData();
    setAuth(null);
    navigate('/');
  };

  return (
    <Routes>
      <Route path="/" element={<LoginPage auth={auth} onAuthSuccess={handleAuthSuccess} />} />
      <Route
        path="/home"
        element={
          auth ? (
            <HomePage auth={auth} onLogout={handleLogout} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/admin"
        element={
          auth && isAdmin ? (
            <AdminPage auth={auth} onLogout={handleLogout} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
