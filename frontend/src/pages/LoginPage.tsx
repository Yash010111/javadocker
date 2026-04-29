import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AuthResponse } from '../types';
import type { AuthRequest } from '../types';
import { login, register } from '../api';
import ErrorBanner from '../components/ErrorBanner';

interface Props {
  auth: AuthResponse | null;
  onAuthSuccess: (auth: AuthResponse) => void;
}

export default function LoginPage({ auth, onAuthSuccess }: Props) {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState<AuthRequest>({ username: '', password: '' });
  const [registerData, setRegisterData] = useState<AuthRequest>({ username: '', password: '' });
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (auth) {
      navigate(auth.roles.includes('ROLE_ADMIN') ? '/admin' : '/home');
    }
  }, [auth, navigate]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>, mode: 'login' | 'register') => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = mode === 'login' ? await login(loginData) : await register(registerData);
      onAuthSuccess(response);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Unable to authenticate. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-shell container">
      <div className="card">
        <h1 className="page-title">StockPulse Login</h1>
        <p className="small-text">Sign in or register to access your portfolio, trade stocks, and manage admin settings.</p>
        <ErrorBanner message={error} />
        <div className="field-group">
          <form onSubmit={(event) => handleSubmit(event, 'login')}>
            <h2>Login</h2>
            <label>
              Username
              <input
                value={loginData.username}
                onChange={(event) => setLoginData({ ...loginData, username: event.target.value })}
                required
              />
            </label>
            <label>
              Password
              <input
                value={loginData.password}
                onChange={(event) => setLoginData({ ...loginData, password: event.target.value })}
                type="password"
                required
              />
            </label>
            <button type="submit" className="primary" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <form onSubmit={(event) => handleSubmit(event, 'register')}>
            <h2>Register</h2>
            <label>
              Username
              <input
                value={registerData.username}
                onChange={(event) => setRegisterData({ ...registerData, username: event.target.value })}
                required
              />
            </label>
            <label>
              Password
              <input
                value={registerData.password}
                onChange={(event) => setRegisterData({ ...registerData, password: event.target.value })}
                type="password"
                required
              />
            </label>
            <button type="submit" className="primary" disabled={isLoading}>
              {isLoading ? 'Registering...' : 'Register'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
