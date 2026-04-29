import { useEffect, useState } from 'react';
import type { AuthResponse, ApiKeyRequest, UserDto } from '../types';
import { deleteAdminUser, getAdminUsers, getApiKeyConfig, updateAdminUser, updateApiKeyConfig } from '../api';
import ErrorBanner from '../components/ErrorBanner';
import AdminUserTable from '../components/AdminUserTable';
import ApiKeyEditor from '../components/ApiKeyEditor';

interface Props {
  auth: AuthResponse;
  onLogout: () => void;
}

export default function AdminPage({ auth, onLogout }: Props) {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [apiKey, setApiKey] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadAdminUsers();
    loadApiKey();
  }, []);

  const handleError = (error: unknown) => {
    if (error instanceof Error) {
      setErrorMessage(error.message);
      if (error.message.includes('login required') || error.message.includes('Access denied')) {
        onLogout();
      }
    } else {
      setErrorMessage('Unexpected error. Please try again.');
    }
  };

  const loadAdminUsers = async () => {
    setErrorMessage('');
    try {
      const adminUsers = await getAdminUsers();
      setUsers(adminUsers);
    } catch (error) {
      handleError(error);
    }
  };

  const loadApiKey = async () => {
    setErrorMessage('');
    try {
      const config = await getApiKeyConfig();
      setApiKey(config.apiKey ?? '');
    } catch (error) {
      handleError(error);
    }
  };

  const handleUpdateUser = async (id: number, update: Partial<UserDto>) => {
    setStatusMessage('');
    setErrorMessage('');
    try {
      await updateAdminUser(id, update);
      setStatusMessage('User updated successfully.');
      await loadAdminUsers();
    } catch (error) {
      handleError(error);
    }
  };

  const handleDeleteUser = async (id: number) => {
    setStatusMessage('');
    setErrorMessage('');
    try {
      await deleteAdminUser(id);
      setStatusMessage('User deleted successfully.');
      await loadAdminUsers();
    } catch (error) {
      handleError(error);
    }
  };

  const handleSaveApiKey = async (request: ApiKeyRequest) => {
    setStatusMessage('');
    setErrorMessage('');
    try {
      const config = await updateApiKeyConfig(request);
      setApiKey(config.apiKey ?? '');
      setStatusMessage('API key saved successfully.');
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <div className="app-shell container">
      <div className="status-row">
        <div>
          <h1 className="page-title">Admin dashboard</h1>
          <p className="small-text">Welcome, {auth.username}. Your role is {auth.roles.join(', ')}.</p>
        </div>
        <button className="secondary" onClick={onLogout}>
          Logout
        </button>
      </div>

      {errorMessage && <ErrorBanner message={errorMessage} />}
      {statusMessage && <ErrorBanner message={statusMessage} variant="success" />}

      <AdminUserTable users={users} onUpdate={handleUpdateUser} onDelete={handleDeleteUser} />
      <ApiKeyEditor initialApiKey={apiKey} onSave={handleSaveApiKey} />
    </div>
  );
}
