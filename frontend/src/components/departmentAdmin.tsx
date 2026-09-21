import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { api } from '../services/api';
import type { Department } from '../types';

export default function DepartmentAdmin() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { loadDepartments(); }, []);

  const loadDepartments = async () => {
    try {
      const data = await api.departments.getAll();
      setDepartments(data);
    } catch (err) {
      setError('Error fetching departments');
    }
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await api.departments.create({ departmentName: name });
      setName('');
      loadDepartments();
    } catch (err) {
      alert('Failed to create department');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this department?')) return;
    try {
      await api.departments.delete(id);
      loadDepartments();
    } catch (err) {
      alert('Failed to delete department (it may still have staff)');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md border border-gray-100">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Clinic Departments</h2>
        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 border-b">ID</th>
              <th className="p-3 border-b">Department Name</th>
              <th className="p-3 border-b"></th>
            </tr>
          </thead>
          <tbody>
            {departments.map(d => (
              <tr key={d.departmentId} className="hover:bg-gray-50 border-b">
                <td className="p-3">{d.departmentId}</td>
                <td className="p-3 font-semibold">{d.departmentName}</td>
                <td className="p-3">
                  <button
                    onClick={() => handleDelete(d.departmentId)}
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
        <h2 className="text-xl font-bold mb-4 text-gray-800">Add Department</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Department Name</label>
            <input
              type="text" required className="w-full border p-2 rounded"
              placeholder="e.g. Outpatient"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            Create Department
          </button>
        </form>
      </div>
    </div>
  );
}
