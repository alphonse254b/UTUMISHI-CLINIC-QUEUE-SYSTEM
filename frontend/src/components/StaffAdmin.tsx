import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Staff, Department } from '../types';
import SetCredentialsButton from './SetCredentialsButton';
import RolesAdmin from './RolesAdmin';
import DepartmentAdmin from './departmentAdmin';
import { getTabToken, tokenExpiry } from '../services/tabSession';

interface Role {
  roleId: number;
  roleName: string;
}

interface Props {
  session: any;
}

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5250/api';

export default function StaffAdmin({ session }: Props) {
  // Prefer the prop, but fall back to the admin tab's stored session so a
  // missing prop can't silently produce header-less requests.
  const token: string | undefined = session?.token ?? getTabToken('admin');
  const effectiveSession = { ...session, token };

  const [view, setView] = useState<'staff' | 'roles' | 'departments'>('staff');
  const [staff, setStaff] = useState<Staff[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [authProblem, setAuthProblem] = useState<string | null>(null);

  const [newStaff, setNewStaff] = useState({
    staffName: '',
    departmentId: 0,
    roleId: 0
  });

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const explainUnauthorized = (): string => {
    if (!token) {
      return 'No admin token was sent. Click "Lock Tab" and sign in again on the Admin tab.';
    }
    const expiry = tokenExpiry(token);
    if (expiry && expiry.getTime() < Date.now()) {
      return `Your admin session expired at ${expiry.toLocaleString()}. Click "Lock Tab" and sign in again.`;
    }
    return (
      'The server rejected an admin token that has not expired. That points to a server-side mismatch: ' +
      'check that Jwt:Key, Jwt:Issuer and Jwt:Audience in appsettings.json have not changed since you signed in, ' +
      'restart the backend, then sign in again.'
    );
  };

  const loadData = async () => {
    try {
      const staffList = await api.staff.getAll();
      const deptList = await api.departments.getAll();
      setStaff(staffList);
      setDepartments(deptList);

      const rolesRes = await fetch(`${BASE_URL}/Roles`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (rolesRes.status === 401) {
        setAuthProblem(explainUnauthorized());
        return;
      }
      if (!rolesRes.ok) throw new Error(`Status ${rolesRes.status}`);
      setAuthProblem(null);
      setRoles(await rolesRes.json());
    } catch (err) {
      alert('Error fetching administrative structures');
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaff.departmentId || !newStaff.roleId) {
      alert('Please select valid roles and departments');
      return;
    }
    try {
      await api.staff.create(newStaff);
      alert('Staff created successfully!');
      setNewStaff({ staffName: '', departmentId: 0, roleId: 0 });
      loadData();
    } catch (err) {
      alert('Failed to register employee');
    }
  };

  return (
    <div>
      {authProblem && (
        <div className="mb-4 bg-red-50 text-red-700 text-sm rounded px-4 py-3">{authProblem}</div>
      )}

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setView('staff')}
          className={`px-4 py-2 text-sm font-semibold rounded ${view === 'staff' ? 'bg-indigo-100 text-indigo-950' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          Staff
        </button>
        <button
          onClick={() => setView('roles')}
          className={`px-4 py-2 text-sm font-semibold rounded ${view === 'roles' ? 'bg-indigo-100 text-indigo-950' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          Roles
        </button>
        <button
          onClick={() => setView('departments')}
          className={`px-4 py-2 text-sm font-semibold rounded ${view === 'departments' ? 'bg-indigo-100 text-indigo-950' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          Departments
        </button>
      </div>

      {view === 'roles' ? (
        <RolesAdmin token={token} />
      ) : view === 'departments' ? (
        <DepartmentAdmin />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* List Staff */}
          <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Clinic Roster</h2>
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 border-b">ID</th>
                  <th className="p-3 border-b">Name</th>
                  <th className="p-3 border-b">Department</th>
                  <th className="p-3 border-b">Clinic Role</th>
                  <th className="p-3 border-b">Login</th>
                </tr>
              </thead>
              <tbody>
                {staff.map(s => (
                  <tr key={s.staffId} className="hover:bg-gray-50 border-b">
                    <td className="p-3">{s.staffId}</td>
                    <td className="p-3 font-semibold">{s.staffName}</td>
                    <td className="p-3 text-gray-600">{s.department?.departmentName || 'N/A'}</td>
                    <td className="p-3 text-gray-600">{s.role?.roleName || 'N/A'}</td>
                    <td className="p-3">
                      <SetCredentialsButton staffId={s.staffId} staffName={s.staffName} session={effectiveSession} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Register Staff Member */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Add Staff Member</h2>
            <form onSubmit={handleCreateStaff} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Full Name</label>
                <input
                  type="text" required className="w-full border p-2 rounded"
                  value={newStaff.staffName}
                  onChange={(e) => setNewStaff({...newStaff, staffName: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Department</label>
                <select
                  className="w-full border p-2 rounded bg-white" required
                  value={newStaff.departmentId}
                  onChange={(e) => setNewStaff({...newStaff, departmentId: Number(e.target.value)})}
                >
                  <option value="0">-- Select Department --</option>
                  {departments.map(d => <option key={d.departmentId} value={d.departmentId}>{d.departmentName}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Clinic Role Type</label>
                <select
                  className="w-full border p-2 rounded bg-white" required
                  value={newStaff.roleId}
                  onChange={(e) => setNewStaff({...newStaff, roleId: Number(e.target.value)})}
                >
                  <option value="0">-- Select Role --</option>
                  {roles.map(r => <option key={r.roleId} value={r.roleId}>{r.roleName}</option>)}
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
              >
                Create Staff Profile
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}