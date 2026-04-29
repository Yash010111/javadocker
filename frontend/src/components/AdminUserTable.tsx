import { useState } from 'react';
import type { UserDto } from '../types';

interface Props {
  users: UserDto[];
  onUpdate: (id: number, update: Partial<UserDto>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export default function AdminUserTable({ users, onUpdate, onDelete }: Props) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<UserDto>>({});
  const [isSaving, setIsSaving] = useState(false);

  const startEdit = (user: UserDto) => {
    setEditingId(user.id);
    setFormData({ username: user.username, role: user.role });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({});
  };

  const handleSave = async (id: number) => {
    setIsSaving(true);
    try {
      await onUpdate(id, formData);
      cancelEdit();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="card">
      <h2 className="page-title">Admin users</h2>
      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>
                {editingId === user.id ? (
                  <input
                    value={formData.username ?? ''}
                    onChange={(event) => setFormData({ ...formData, username: event.target.value })}
                  />
                ) : (
                  user.username
                )}
              </td>
              <td>
                {editingId === user.id ? (
                  <select
                    value={formData.role ?? user.role}
                    onChange={(event) => setFormData({ ...formData, role: event.target.value })}
                  >
                    <option value="ROLE_USER">ROLE_USER</option>
                    <option value="ROLE_ADMIN">ROLE_ADMIN</option>
                  </select>
                ) : (
                  user.role
                )}
              </td>
              <td>
                {editingId === user.id ? (
                  <>
                    <button className="primary" onClick={() => handleSave(user.id)} disabled={isSaving}>
                      Save
                    </button>
                    <button className="secondary" onClick={cancelEdit} disabled={isSaving}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button className="primary" onClick={() => startEdit(user)}>
                      Edit
                    </button>
                    <button className="danger" onClick={() => onDelete(user.id)}>
                      Delete
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
