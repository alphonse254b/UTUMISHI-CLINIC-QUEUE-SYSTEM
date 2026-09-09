import { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Prescription } from '../types';

interface Props {
  session: any;
}

export default function PharmacyDispense({ session }: Props) {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const loadPrescriptions = async () => {
    try {
      const data = await api.prescriptions.getAll();
      setPrescriptions(data);
    } catch (err) {
      alert('Error fetching prescriptions');
    }
  };

  const handleDispense = async (prescription: Prescription) => {
    if (!session) return;

    try {
      await api.pharmacy.createDispense({
        prescriptionId: prescription.prescriptionId,
        pharmacistId: session.staffId
      });

      await api.prescriptions.update(prescription.prescriptionId, {
        ...prescription,
        status: 'Fulfilled'
      });

      alert('Prescription dispensed successfully!');
      loadPrescriptions();
    } catch (err) {
      alert('Dispense update failed.');
    }
  };

  const pendingList = prescriptions.filter(p => p.status?.toLowerCase() === 'pending');
  const fulfilledList = prescriptions.filter(p => p.status?.toLowerCase() === 'fulfilled');

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Pharmacy Dispensation Unit</h2>
      
      <div className="flex flex-wrap justify-between items-center bg-gray-50 p-3 rounded-lg mb-6 border border-gray-200">
        <p className="text-sm text-gray-500">
          Current Dispenser: <span className="font-semibold text-gray-700">{session?.staffName}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="font-bold text-gray-700 mb-3 text-sm border-b pb-1 text-orange-600 uppercase">Pending Handout</h3>
          {pendingList.length === 0 ? (
            <p className="text-gray-500 text-sm italic">No pending prescriptions in queue.</p>
          ) : (
            <div className="space-y-3">
              {pendingList.map(p => (
                <div key={p.prescriptionId} className="p-4 border rounded-lg bg-gray-50 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{p.medicationName}</p>
                    <p className="text-xs text-gray-500">Dosage: {p.dosage} | Qty: {p.quantity}</p>
                    <p className="text-[11px] text-indigo-700">Visit Ref: {p.visit?.ticketNumber}</p>
                  </div>
                  <button 
                    onClick={() => handleDispense(p)}
                    className="bg-green-600 text-white font-bold px-3 py-1.5 rounded text-xs hover:bg-green-700"
                  >
                    Dispense Drug
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="font-bold text-gray-700 mb-3 text-sm border-b pb-1 text-green-600 uppercase">Completed Dispenses</h3>
          <div className="space-y-2 max-h-[350px] overflow-y-auto">
            {fulfilledList.map(p => (
              <div key={p.prescriptionId} className="p-3 border rounded text-xs text-gray-600 bg-gray-100 flex justify-between">
                <div>
                  <p className="font-semibold text-gray-700">{p.medicationName}</p>
                  <p>Dosage: {p.dosage} | Qty: {p.quantity}</p>
                </div>
                <span className="text-green-700 font-bold">Dispensed</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}