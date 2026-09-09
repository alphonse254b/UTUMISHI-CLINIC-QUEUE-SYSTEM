import React, { useState } from 'react';
import { api } from '../services/api';
import type { Visit, Department } from '../types';

interface Props {
  pendingVisits: Visit[];
  departments: Department[];
  session: any;
  onSuccess: () => void;
}

export default function TriageForm({ pendingVisits, departments, session, onSuccess }: Props) {
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [formData, setFormData] = useState({
    departmentId: 0,
    reasonForVisit: '',
    bloodPressure: '',
    temperature: 36.5,
    weight: 70.0,
    height: 1.70,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVisit || !formData.departmentId || !session) {
      alert('Please fill out all mandatory selection fields');
      return;
    }

    try {
      await api.triages.create({
        ...formData,
        nurseId: session.staffId,
        visitId: selectedVisit.visitId,
      });
      alert('Triage details saved successfully!');
      setSelectedVisit(null);
      onSuccess();
    } catch (err) {
      alert('Error updating triage details');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Triage Assessment Unit</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 border-r pr-6">
          <h3 className="font-semibold text-gray-700 mb-3">Awaiting Vitals Queue</h3>
          {pendingVisits.length === 0 ? (
            <p className="text-gray-500 text-sm italic">All active registrations have been triaged.</p>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {pendingVisits.map(v => (
                <div 
                  key={v.visitId}
                  onClick={() => setSelectedVisit(v)}
                  className={`p-3 border rounded cursor-pointer hover:bg-orange-50 transition-colors ${selectedVisit?.visitId === v.visitId ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}
                >
                  <p className="font-bold text-sm text-gray-800">{v.ticketNumber}</p>
                  <p className="text-xs text-gray-600">Patient: {v.patient?.fullName}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          {selectedVisit ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 mb-4">
                <p className="text-sm font-semibold text-orange-900">Assessing: {selectedVisit.patient?.fullName}</p>
                <p className="text-xs text-orange-700">Ticket: {selectedVisit.ticketNumber}</p>
                <p className="text-xs text-orange-700">Nurse on duty: {session?.staffName}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Target Department</label>
                <select 
                  className="w-full border p-2 rounded bg-white" required
                  value={formData.departmentId}
                  onChange={(e) => setFormData({...formData, departmentId: Number(e.target.value)})}
                >
                  <option value="0">-- Select Department --</option>
                  {departments.map(d => <option key={d.departmentId} value={d.departmentId}>{d.departmentName}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Reason for Visit</label>
                <textarea 
                  rows={2} required className="w-full border p-2 rounded"
                  value={formData.reasonForVisit}
                  onChange={(e) => setFormData({...formData, reasonForVisit: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">BP (e.g. 120/80)</label>
                  <input 
                    type="text" required className="w-full border p-2 rounded"
                    value={formData.bloodPressure}
                    onChange={(e) => setFormData({...formData, bloodPressure: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Temp (°C)</label>
                  <input 
                    type="number" step="0.1" required className="w-full border p-2 rounded"
                    value={formData.temperature}
                    onChange={(e) => setFormData({...formData, temperature: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Weight (Kg)</label>
                  <input 
                    type="number" step="0.1" required className="w-full border p-2 rounded"
                    value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: Number(e.target.value)})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Height (Meters)</label>
                  <input 
                    type="number" step="0.01" required className="w-full border p-2 rounded"
                    value={formData.height}
                    onChange={(e) => setFormData({...formData, height: Number(e.target.value)})}
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded transition-colors"
              >
                Save Vitals & Route to Department Queue
              </button>
            </form>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 italic">
              Please select a patient from the left panel to begin triage entry.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}