'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MfaPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async (otpCode: string) => {
    setError('');
    setLoading(true);

    const mfaPendingToken = sessionStorage.getItem('mfaPendingToken');

    try {
      const res = await fetch('/api/v1/auth/mfa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-mfa-pending-token': mfaPendingToken || '',
        },
        body: JSON.stringify({ code: otpCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'MFA verification failed');
      }

      sessionStorage.removeItem('mfaPendingToken');
      router.push('/settings/tenant');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCode(val);
    if (val.length === 6) {
      handleVerify(val);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white">Two-Factor Authentication</h2>
          <p className="mt-1 text-sm text-slate-400">Enter the 6-digit code from your authenticator app</p>
        </div>

        {error && (
          <div className="p-3 text-sm text-rose-300 bg-rose-950/50 border border-rose-800 rounded-md">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <input
            type="text"
            maxLength={6}
            value={code}
            onChange={handleInputChange}
            placeholder="000000"
            className="w-full text-center text-3xl font-mono tracking-widest px-3 py-3 bg-slate-950 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <button
            onClick={() => handleVerify(code)}
            disabled={loading || code.length !== 6}
            className="w-full py-2.5 font-semibold text-white bg-emerald-600 rounded-md hover:bg-emerald-500 transition-colors disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>
        </div>
      </div>
    </div>
  );
}
