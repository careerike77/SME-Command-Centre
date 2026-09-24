'use client';

import { useState, useEffect } from 'react';

export default function TaxSettingsPage() {
  const [tax, setTax] = useState({
    taxNumber: '',
    vatEnabled: false,
    defaultTaxRate: 0.0,
    fiscalYearStart: '01-01',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/v1/tax-settings')
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setTax({
            taxNumber: data.taxNumber || '',
            vatEnabled: !!data.vatEnabled,
            defaultTaxRate: data.defaultTaxRate ?? 0.0,
            fiscalYearStart: data.fiscalYearStart || '01-01',
          });
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const res = await fetch('/api/v1/tax-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...tax,
          defaultTaxRate: parseFloat(tax.defaultTaxRate.toString()),
        }),
      });

      if (!res.ok) throw new Error('Failed to update tax settings');
      setMessage('Tax settings saved successfully');
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6 text-slate-400">Loading tax settings...</div>;

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-2xl font-bold text-white">Tax & Fiscal Configuration</h2>
        <p className="text-slate-400 text-sm">Configure VAT registration, default tax rates, and fiscal year range</p>
      </div>

      {message && (
        <div className={`p-3 rounded-md text-sm ${message.startsWith('Error') ? 'bg-rose-950/50 border border-rose-800 text-rose-300' : 'bg-emerald-950/50 border border-emerald-800 text-emerald-300'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4 max-w-xl bg-slate-900 p-6 border border-slate-800 rounded-xl shadow-lg">
        <div>
          <label className="block text-sm font-medium text-slate-300">Tax Registration Number (VAT/TIN)</label>
          <input
            type="text"
            value={tax.taxNumber}
            onChange={(e) => setTax({ ...tax, taxNumber: e.target.value })}
            className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="VAT-123456789"
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <input
            type="checkbox"
            id="vatEnabled"
            checked={tax.vatEnabled}
            onChange={(e) => setTax({ ...tax, vatEnabled: e.target.checked })}
            className="rounded bg-slate-950 border-slate-700 text-emerald-600 focus:ring-emerald-500"
          />
          <label htmlFor="vatEnabled" className="text-sm font-medium text-slate-300">
            Enable VAT / Sales Tax Calculations
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300">Default Tax Rate (%)</label>
            <input
              type="number"
              step="0.01"
              value={tax.defaultTaxRate}
              onChange={(e) => setTax({ ...tax, defaultTaxRate: parseFloat(e.target.value) || 0 })}
              className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300">Fiscal Year Start (MM-DD)</label>
            <input
              type="text"
              value={tax.fiscalYearStart}
              onChange={(e) => setTax({ ...tax, fiscalYearStart: e.target.value })}
              className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="01-01"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 font-semibold text-white bg-emerald-600 rounded-md hover:bg-emerald-500 transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Tax Settings'}
        </button>
      </form>
    </div>
  );
}
