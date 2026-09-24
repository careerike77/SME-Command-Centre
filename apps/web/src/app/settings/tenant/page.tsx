'use client';

import { useState, useEffect } from 'react';

export default function TenantSettingsPage() {
  const [tenant, setTenant] = useState({
    name: '',
    country: '',
    currency: '',
    industry: '',
    logoUrl: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/v1/tenants/me')
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setTenant({
            name: data.name || '',
            country: data.country || 'US',
            currency: data.currency || 'USD',
            industry: data.industry || '',
            logoUrl: data.logoUrl || '',
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
      const res = await fetch('/api/v1/tenants/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tenant),
      });

      if (!res.ok) throw new Error('Failed to update tenant');
      setMessage('Tenant profile updated successfully');
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-slate-400">Loading tenant profile...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-2xl font-bold text-white">Organization Profile</h2>
        <p className="text-slate-400 text-sm">Manage company details, default currency, and branding settings</p>
      </div>

      {message && (
        <div className={`p-3 rounded-md text-sm ${message.startsWith('Error') ? 'bg-rose-950/50 border border-rose-800 text-rose-300' : 'bg-emerald-950/50 border border-emerald-800 text-emerald-300'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4 max-w-xl bg-slate-900 p-6 border border-slate-800 rounded-xl shadow-lg">
        <div>
          <label className="block text-sm font-medium text-slate-300">Company Name</label>
          <input
            type="text"
            value={tenant.name}
            onChange={(e) => setTenant({ ...tenant, name: e.target.value })}
            className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300">Country / Region</label>
            <input
              type="text"
              value={tenant.country}
              onChange={(e) => setTenant({ ...tenant, country: e.target.value })}
              className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300">Default Currency</label>
            <input
              type="text"
              value={tenant.currency}
              onChange={(e) => setTenant({ ...tenant, currency: e.target.value })}
              className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300">Industry Type</label>
          <input
            type="text"
            value={tenant.industry}
            onChange={(e) => setTenant({ ...tenant, industry: e.target.value })}
            className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 font-semibold text-white bg-emerald-600 rounded-md hover:bg-emerald-500 transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
}
