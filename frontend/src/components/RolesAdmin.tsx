import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { api } from '../services/api';

interface Role {
  roleId: number;
  roleName: string;
}

export default function RolesAdmin() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [roleName, setRoleName] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      const data = await api.roles.getAll();
      setRoles(data);
    } catch (err) {
      setError('Error fetching roles');
    }
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) return;
    try {
      await api.roles.create({ roleName });
      setRoleName('');
      loadRoles();
    } catch (err) {
      alert('Failed to create role');
    }
  };

  const handleDelete = async (roleId: number) => {
    if (!confirm('Delete this role?')) return;
    try {
      await api.roles.delete(roleId);
      loadRoles();
    } catch (err) {
      alert('Failed to delete role (it may still be assigned to staff)');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md border border-gray-100">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Clinic Roles</h2>
        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 border-b">ID</th>
              <th className="p-3 border-b">Role Name</th>
              <th className="p-3 border-b"></th>
            </tr>
          </thead>
          <tbody>
            {roles.map(r => (
              <tr key={r.roleId} className="hover:bg-gray-50 border-b">
                <td className="p-3">{r.roleId}</td>
                <td className="p-3 font-semibold">{r.roleName}</td>
                <td className="p-3">
                  <button
                    onClick={() => handleDelete(r.roleId)}
                    className="text-red-600 hover:text-red-800 text-xs font-semibold"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Add Role</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Role Name</label>
            <input
              type="text" required className="w-full border p-2 rounded"
              placeholder="e.g. Doctor"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            Create Role
          </button>
        </form>
      </div>
    </div>
  );
}