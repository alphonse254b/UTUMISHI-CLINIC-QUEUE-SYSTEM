import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Staff, Department } from '../types';
import SetCredentialsButton from './SetCredentialsButton';
import RolesAdmin from './RolesAdmin';


interface Role {
  roleId: number;
  roleName: string;
}

interface Props {
  session: any;
}

export default function StaffAdmin({ session }: Props) {
  const [view, setView] = useState<'staff' | 'roles'>('staff');
  const [staff, setStaff] = useState<Staff[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);

  const [newStaff, setNewStaff] = useState({
    staffName: '',
    departmentId: 0,
    roleId: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
  try {
    const staffList = await api.staff.getAll();
    const deptList = await api.departments.getAll();
    const rolesList = await api.roles.getAll();
    setStaff(staffList);
    setDepartments(deptList);
    setRoles(rolesList);
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
      </div>

      {view === 'roles' ? (
        <RolesAdmin />
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
                     <SetCredentialsButton staffId={s.staffId} staffName={s.staffName} session={session} />
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