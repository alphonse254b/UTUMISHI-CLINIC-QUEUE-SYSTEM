import { useState, useRef, useEffect } from 'react';
import type { FormEvent } from 'react';
import { api } from '../services/api';

interface Props {
  visitId: number;
  amount: number;
  onSuccess: (receiptNumber: string) => void;
}

type PaymentState = 'idle' | 'pushed' | 'waiting' | 'success' | 'failed';

export default function MpesaPayment({ visitId, amount, onSuccess }: Props) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [state, setState] = useState<PaymentState>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<number | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  function startPolling(txId: number) {
    let attempts = 0;
    pollRef.current = setInterval(async () => {
      attempts += 1;
      try {
        const status = await api.payments.getStatus(txId);
        if (status.status === 'Success') {
          clearInterval(pollRef.current!);
          setState('success');
          onSuccess(status.mpesaReceiptNumber ?? '');
        } else if (status.status === 'Failed' || status.status === 'Cancelled') {
          clearInterval(pollRef.current!);
          setState('failed');
          setMessage(status.resultDesc ?? 'Payment was not completed.');
        }
      } catch {
        // transient network hiccup — keep polling
      }

      // Stop after ~90 seconds (STK prompts expire on the phone by then anyway)
      if (attempts >= 30) {
        clearInterval(pollRef.current!);
        setState('failed');
        setMessage('Payment timed out. Ask the patient to check their phone, or try again.');
      }
    }, 3000);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setState('pushed');
    setMessage(null);
    try {
      const result = await api.payments.initiate(visitId, phoneNumber, amount);
      setTransactionId(result.mpesaTransactionId);
      setMessage(result.message);
      setState('waiting');
      startPolling(result.mpesaTransactionId);
    } catch (err) {
      setState('failed');
      setMessage(err instanceof Error ? err.message : 'Could not start M-Pesa payment.');
    }
  }

  if (state === 'success') {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-sm text-emerald-800">
        Payment received. Transaction ID: <strong>{transactionId}</strong>
      </div>
    );
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <h4 className="font-bold text-green-900 text-sm mb-2">Pay with M-Pesa</h4>

      {state === 'idle' || state === 'failed' ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Phone number (2547XXXXXXXX)
            </label>
            <input
              type="tel"
              required
              pattern="2547[0-9]{8}"
              placeholder="254712345678"
              className="w-full border p-2 rounded text-sm"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>
          {message && <p className="text-xs text-red-600">{message}</p>}
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded text-sm"
          >
            Send Payment Request — KES {amount.toLocaleString()}
          </button>
        </form>
      ) : (
        <div className="text-sm text-gray-700">
          <p className="mb-2">{message ?? 'Sending payment request to phone…'}</p>
          <p className="text-xs text-gray-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Waiting for the patient to approve on their phone…
          </p>
        </div>
      )}
    </div>
  );
}