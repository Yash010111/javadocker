import { useState, type FormEvent } from 'react';
import type { ApiKeyRequest } from '../types';

interface Props {
  initialApiKey: string;
  onSave: (request: ApiKeyRequest) => Promise<void>;
}

export default function ApiKeyEditor({ initialApiKey, onSave }: Props) {
  const [apiKey, setApiKey] = useState(initialApiKey);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      await onSave({ apiKey });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="card">
      <h2 className="page-title">API key config</h2>
      <form onSubmit={handleSubmit} className="field-group">
        <label>
          API Key
          <input value={apiKey} onChange={(event) => setApiKey(event.target.value)} placeholder="Enter API key" />
        </label>
        <button type="submit" className="primary" disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save API key'}
        </button>
      </form>
    </div>
  );
}
