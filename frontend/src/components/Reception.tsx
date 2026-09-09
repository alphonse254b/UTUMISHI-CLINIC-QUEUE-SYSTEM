import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Patient } from '../types';

interface Props {
  session: any;
  onSuccess: () => void;
}

export default function Reception({ session, onSuccess }: Props) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const [newPatient, setNewPatient] = useState({
    fullName: '',
    nationalId: '',
    dateOfBirth: '',
    phoneNumber: '',
    gender: 'Male',
    residence: ''
  });

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const data = await api.patients.getAll();
      setPatients(data);
    } catch (err) {
      alert('Error fetching patient list');
    }
  };

  const handleRegisterPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await api.patients.create(newPatient);
      alert('Patient registered successfully!');
      setSelectedPatient(created);
      loadPatients();
    } catch (err) {
      alert('Failed to register patient');
    }
  };

  const handleCreateVisit = async () => {
    if (!selectedPatient || !session) {
      alert('Please select a patient');
      return;
    }
    try {
      const visit = await api.visits.create({
        patientId: selectedPatient.patientId,
        receptionistId: session.staffId
      });
      alert(`Visit registered successfully! Ticket: ${visit.ticketNumber}`);
      setSelectedPatient(null);
      onSuccess();
    } catch (err) {
      alert('Failed to register visit');
    }
  };

  const filteredPatients = patients.filter(p => 
    p.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.nationalId?.includes(searchTerm)
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Check-In / Find Patient</h2>
        <input 
          type="text" 
          placeholder="Search by Name or ID Number..." 
          className="w-full border p-2 rounded mb-4 focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="max-h-60 overflow-y-auto border rounded mb-4">
          {filteredPatients.map(p => (
            <div 
              key={p.patientId} 
              onClick={() => setSelectedPatient(p)}
              className={`p-3 border-b cursor-pointer hover:bg-blue-50 transition-colors ${selectedPatient?.patientId === p.patientId ? 'bg-blue-50 border-blue-300' : ''}`}
            >
              <p className="font-semibold">{p.fullName}</p>
              <p className="text-xs text-gray-500">National ID: {p.nationalId} | DOB: {p.dateOfBirth}</p>
            </div>
          ))}
        </div>

        {selectedPatient && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h3 className="font-bold text-blue-800 mb-2">Create Clinic Visit</h3>
            <p className="text-sm mb-1"><strong>Selected:</strong> {selectedPatient.fullName}</p>
            <p className="text-xs text-blue-700 mb-4">Checking in as: {session?.staffName}</p>

            <button 
              onClick={handleCreateVisit}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              Generate Queue Ticket & Book Visit
            </button>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
        <h2 className="text-xl font-bold mb-4 text-gray-800">New Patient Registration</h2>
        <form onSubmit={handleRegisterPatient} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Full Name</label>
            <input 
              type="text" required 
              className="w-full border p-2 rounded"
              value={newPatient.fullName}
              onChange={(e) => setNewPatient({...newPatient, fullName: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">National ID</label>
              <input 
                type="text" required 
                className="w-full border p-2 rounded"
                value={newPatient.nationalId}
                onChange={(e) => setNewPatient({...newPatient, nationalId: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">Date of Birth</label>
              <input 
                type="date" required 
                className="w-full border p-2 rounded"
                value={newPatient.dateOfBirth}
                onChange={(e) => setNewPatient({...newPatient, dateOfBirth: e.target.value})}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">Phone Number</label>
              <input 
                type="text" required 
                className="w-full border p-2 rounded"
                value={newPatient.phoneNumber}
                onChange={(e) => setNewPatient({...newPatient, phoneNumber: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">Gender</label>
              <select 
                className="w-full border p-2 rounded bg-white"
                value={newPatient.gender}
                onChange={(e) => setNewPatient({...newPatient, gender: e.target.value})}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Residential Area</label>
            <input 
              type="text" required 
              className="w-full border p-2 rounded"
              value={newPatient.residence}
              onChange={(e) => setNewPatient({...newPatient, residence: e.target.value})}
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            Register Patient
          </button>
        </form>
      </div>
    </div>
  );
}