import React, { useState } from 'react';
import { api } from '../services/api';
import type { Visit } from '../types';
import MpesaPayment from './MpesaPayment';

interface Props {
  unpaidVisits: Visit[];
  onSuccess: () => void;
}

export default function BillingForm({ unpaidVisits, onSuccess }: Props) {
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [consultationCharge, setConsultationCharge] = useState<number>(1000);
  const [labTestCharge, setLabTestCharge] = useState<number>(0);
  const [medicationCharge, setMedicationCharge] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('Cash');
  const [showMpesa, setShowMpesa] = useState(false);
  const totalBill = consultationCharge + labTestCharge + medicationCharge;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVisit) return;

    try {
      await api.billing.create({
        visitId: selectedVisit.visitId,
        consultationCharge,
        labTestCharge,
        medicationCharge,
        paymentMethod,
        total: totalBill,
      });

      alert('Receipt posted successfully!');
      setSelectedVisit(null);
      setConsultationCharge(1000);
      setLabTestCharge(0);
      setMedicationCharge(0);
      setShowMpesa(false);
      onSuccess();
    } catch (err) {
      alert('Error updating payment records');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Billing Desk & Accounts Department</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Waiting Patients */}
        <div className="lg:col-span-1 border-r pr-6">
          <h3 className="font-semibold text-gray-700 mb-3">Awaiting Payment Settlement</h3>
          {unpaidVisits.length === 0 ? (
            <p className="text-gray-500 text-sm italic">All current patients are clear on payments.</p>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {unpaidVisits.map(v => (
                <div 
                  key={v.visitId}
                  onClick={() => {
                    setSelectedVisit(v);
                    // Autofill medication charges based on number of prescriptions issued
                    const estimatedPrescriptionCost = (v.prescriptions?.length || 0) * 350;
                    setMedicationCharge(estimatedPrescriptionCost);
                    setShowMpesa(false);
                  }}
                  className={`p-3 border rounded cursor-pointer hover:bg-violet-50 transition-colors ${selectedVisit?.visitId === v.visitId ? 'border-violet-500 bg-violet-50' : 'border-gray-200'}`}
                >
                  <p className="font-bold text-sm text-gray-800">{v.ticketNumber}</p>
                  <p className="text-xs text-gray-600">Patient: {v.patient?.fullName}</p>
                  <p className="text-[11px] text-gray-500">Prescriptions Pending: {v.prescriptions?.length || 0}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Invoice Generator */}
        <div className="lg:col-span-2">
          {selectedVisit ? (
            <form onSubmit={handlePay} className="space-y-4">
              <div className="bg-violet-50 p-4 rounded-lg border border-violet-100 text-sm text-violet-900">
                <p className="font-bold">Patient Name: {selectedVisit.patient?.fullName}</p>
                <p>Ticket Number: {selectedVisit.ticketNumber}</p>
                {selectedVisit.consultations?.[0] && (
                  <p className="italic mt-1">Diagnosis: {selectedVisit.consultations[0].diagnosis}</p>
                )}
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-gray-700">Consultation Charge (KES)</label>
                    <input 
                      type="number" required className="w-full border p-2 rounded"
                      value={consultationCharge}
                      onChange={(e) => setConsultationCharge(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-gray-700">Laboratory Fees (KES)</label>
                    <input 
                      type="number" required className="w-full border p-2 rounded"
                      value={labTestCharge}
                      onChange={(e) => setLabTestCharge(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-gray-700">Pharmacy Fees (KES)</label>
                    <input 
                      type="number" required className="w-full border p-2 rounded"
                      value={medicationCharge}
                      onChange={(e) => setMedicationCharge(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-gray-700">Payment Channel</label>
                    <select 
                      className="w-full border p-2 rounded bg-white"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                      <option value="Cash">Cash Payments</option>
                      <option value="M-Pesa">Lipa na M-Pesa</option>
                      <option value="Insurance">Corporate Insurance Cover</option>
                    </select>
                  </div>

                  <div className="flex flex-col justify-end items-end p-2 bg-gray-50 border rounded">
                    <p className="text-xs text-gray-500 uppercase font-semibold">Consolidated Balance Due</p>
                    <p className="text-2xl font-black text-gray-800">KES {totalBill.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-2.5 px-4 rounded transition-colors shadow"
              >
                Settle Invoice & Issue Official Receipt (Cash / Manual)
              </button>

              <div className="pt-2 border-t">
                {!showMpesa ? (
                  <button
                    type="button"
                    onClick={() => setShowMpesa(true)}
                    className="w-full bg-green-50 hover:bg-green-100 text-green-800 font-semibold py-2.5 rounded text-sm border border-green-200"
                  >
                    Or pay by M-Pesa
                  </button>
                ) : (
                  <MpesaPayment
                    visitId={selectedVisit.visitId}
                    amount={totalBill}
                    onSuccess={(receiptNumber) => {
                      alert(`M-Pesa payment confirmed. Receipt: ${receiptNumber}`);
                      setSelectedVisit(null);
                      setShowMpesa(false);
                      onSuccess();
                    }}
                  />
                )}
              </div>
            </form>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 italic">
              Please choose a patient from the outstanding balance log to construct an invoice.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}