import React, { useState } from 'react';
import { api } from '../services/api';
import type { Visit } from '../types';

interface Props {
  triagedVisits: Visit[];
  session: any;
  onSuccess: () => void;
}

interface NewPrescription {
  medicationName: string;
  dosage: string;
  quantity: number;
}

export default function ConsultationForm({ triagedVisits, session, onSuccess }: Props) {
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  
  const [prescriptions, setPrescriptions] = useState<NewPrescription[]>([]);
  const [medName, setMedName] = useState('');
  const [dosage, setDosage] = useState('');
  const [qty, setQty] = useState(1);

  const addPrescriptionRow = () => {
    if (!medName || !dosage) return;
    setPrescriptions([...prescriptions, { medicationName: medName, dosage, quantity: qty }]);
    setMedName('');
    setDosage('');
    setQty(1);
  };

  const removePrescriptionRow = (index: number) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVisit || !session) {
      alert('Must select an active patient.');
      return;
    }

    try {
      const consult = await api.consultations.create({
        visitId: selectedVisit.visitId,
        doctorId: session.staffId,
        diagnosis,
        notes,
      });

      for (const p of prescriptions) {
        await api.prescriptions.create({
          consultationId: consult.consultationId,
          visitId: selectedVisit.visitId,
          medicationName: p.medicationName,
          dosage: p.dosage,
          quantity: p.quantity,
        });
      }

      alert('Consultation and prescriptions stored successfully.');
      setSelectedVisit(null);
      setDiagnosis('');
      setNotes('');
      setPrescriptions([]);
      onSuccess();
    } catch (err) {
      alert('Error finalizing doctor consultation entry');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Doctor's Consultation Panel</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-1 border-r pr-6">
          <h3 className="font-semibold text-gray-700 mb-3">Triaged Queue</h3>
          {triagedVisits.length === 0 ? (
            <p className="text-gray-500 text-sm italic">No patients are waiting in consultation queues.</p>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {triagedVisits.map(v => (
                <div 
                  key={v.visitId}
                  onClick={() => { setSelectedVisit(v); setPrescriptions([]); }}
                  className={`p-3 border rounded cursor-pointer hover:bg-emerald-50 transition-colors ${selectedVisit?.visitId === v.visitId ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'}`}
                >
                  <p className="font-bold text-sm text-gray-800">{v.ticketNumber}</p>
                  <p className="text-xs text-gray-600">Patient: {v.patient?.fullName}</p>
                  {v.triages && v.triages.length > 0 && (
                    <p className="text-[11px] text-emerald-700 mt-1">Temp: {v.triages[0].temperature}°C | BP: {v.triages[0].bloodPressure}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          {selectedVisit ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100 grid grid-cols-2 gap-2 text-sm text-emerald-900">
                <div>
                  <p><strong>Patient:</strong> {selectedVisit.patient?.fullName}</p>
                  <p><strong>Vitals Reason:</strong> {selectedVisit.triages?.[0]?.reasonForVisit}</p>
                  <p><strong>Attending:</strong> {session?.staffName}</p>
                </div>
                <div>
                  <p><strong>BP:</strong> {selectedVisit.triages?.[0]?.bloodPressure}</p>
                  <p><strong>Weight/Height:</strong> {selectedVisit.triages?.[0]?.weight}kg / {selectedVisit.triages?.[0]?.height}m</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Diagnosis</label>
                <input 
                  type="text" required className="w-full border p-2 rounded"
                  placeholder="Primary Medical Diagnosis"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Clinical Notes</label>
                <textarea 
                  rows={3} className="w-full border p-2 rounded"
                  placeholder="History, examination findings, and plans..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="border-t pt-4">
                <h4 className="font-bold text-gray-700 mb-2">Prescribe Medication</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                  <input 
                    type="text" placeholder="Drug Name" className="border p-2 rounded text-sm"
                    value={medName} onChange={(e) => setMedName(e.target.value)}
                  />
                  <input 
                    type="text" placeholder="Dosage (e.g. 1x3)" className="border p-2 rounded text-sm"
                    value={dosage} onChange={(e) => setDosage(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <input 
                      type="number" min="1" placeholder="Qty" className="border p-2 rounded text-sm w-20"
                      value={qty} onChange={(e) => setQty(Number(e.target.value))}
                    />
                    <button 
                      type="button" onClick={addPrescriptionRow}
                      className="bg-indigo-600 text-white font-bold px-4 rounded text-sm hover:bg-indigo-700"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {prescriptions.length > 0 && (
                  <table className="w-full text-sm border text-left mt-2">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-2 border-b">Drug</th>
                        <th className="p-2 border-b">Dosage</th>
                        <th className="p-2 border-b">Qty</th>
                        <th className="p-2 border-b">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {prescriptions.map((p, idx) => (
                        <tr key={idx} className="border-b">
                          <td className="p-2">{p.medicationName}</td>
                          <td className="p-2">{p.dosage}</td>
                          <td className="p-2">{p.quantity}</td>
                          <td className="p-2">
                            <button 
                              type="button" onClick={() => removePrescriptionRow(idx)}
                              className="text-red-500 hover:text-red-700 text-xs font-semibold"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <button 
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded transition-colors"
              >
                Publish Clinical Record & Send to Pharmacy
              </button>
            </form>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 italic">
              Please choose a patient in the triage queue to open assessment worksheet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}