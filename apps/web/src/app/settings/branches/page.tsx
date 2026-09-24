'use client';

import { useState, useEffect } from 'react';

interface Branch {
  id: string;
  name: string;
  code?: string;
  address?: string;
  isPrimary: boolean;
  isActive: boolean;
}

export default function BranchesSettingsPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newBranch, setNewBranch] = useState({ name: '', code: '', address: '', isPrimary: false });

  const fetchBranches = () => {
    fetch('/api/v1/branches')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setBranches(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBranch),
      });

      if (res.ok) {
        setShowModal(false);
        setNewBranch({ name: '', code: '', address: '', isPrimary: false });
        fetchBranches();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-6 text-slate-400">Loading branch locations...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Branch Locations</h2>
          <p className="text-slate-400 text-sm">Configure multi-branch outlets and operating locations</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-500 transition-colors"
        >
          Add Branch
        </button>
      </div>

      <div className="overflow-x-auto bg-slate-900 border border-slate-800 rounded-xl shadow-lg">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
            <tr>
              <th className="p-4 font-semibold">Name</th>
              <th className="p-4 font-semibold">Code</th>
              <th className="p-4 font-semibold">Address</th>
              <th className="p-4 font-semibold">Primary</th>
              <th className="p-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {branches.map((b) => (
              <tr key={b.id} className="hover:bg-slate-800/50">
                <td className="p-4 font-medium text-white">{b.name}</td>
                <td className="p-4 font-mono">{b.code || 'N/A'}</td>
                <td className="p-4">{b.address || 'N/A'}</td>
                <td className="p-4">
                  {b.isPrimary ? (
                    <span className="px-2 py-1 text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800 rounded">
                      Primary
                    </span>
                  ) : (
                    <span className="text-slate-500">-</span>
                  )}
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded ${b.isActive ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-400'}`}>
                    {b.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
            <h3 className="text-lg font-bold text-white">Create New Branch</h3>
            <form onSubmit={handleCreateBranch} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300">Branch Name</label>
                <input
                  type="text"
                  required
                  value={newBranch.name}
                  onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300">Code</label>
                <input
                  type="text"
                  value={newBranch.code}
                  onChange={(e) => setNewBranch({ ...newBranch, code: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300">Address</label>
                <input
                  type="text"
                  value={newBranch.address}
                  onChange={(e) => setNewBranch({ ...newBranch, address: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isPrimary"
                  checked={newBranch.isPrimary}
                  onChange={(e) => setNewBranch({ ...newBranch, isPrimary: e.target.checked })}
                  className="rounded bg-slate-950 border-slate-700 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="isPrimary" className="text-sm font-medium text-slate-300">
                  Set as primary branch location
                </label>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 font-medium text-slate-300 bg-slate-800 rounded-md hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-500"
                >
                  Save Branch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
