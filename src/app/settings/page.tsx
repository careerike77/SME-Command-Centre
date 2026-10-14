"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Settings, Building2, Globe, CheckCircle2 } from "lucide-react";

export default function SettingsPage() {
  const [tenantName, setTenantName] = useState("Accra Wholesale Mart");
  const [country, setCountry] = useState("GH");
  const [currency, setCurrency] = useState("GHS");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <AppShell activeModule="settings">
      <div className="space-y-6 max-w-3xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-600" /> Business Tenant Settings
          </h1>
          <p className="text-sm text-slate-500">Configure jurisdiction, regional currency, and multi-tenant parameters</p>
        </div>

        {saved && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Business tenant settings updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="p-6 bg-white border border-slate-200 rounded-xl shadow-xs space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Business Registered Name</label>
            <div className="flex items-center gap-2 border border-slate-300 rounded-lg px-3 py-2">
              <Building2 className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                className="w-full text-xs outline-hidden text-slate-900 font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Country / Jurisdiction</label>
              <div className="flex items-center gap-2 border border-slate-300 rounded-lg px-3 py-2 bg-slate-50">
                <Globe className="w-4 h-4 text-slate-400" />
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full text-xs outline-hidden bg-transparent font-medium"
                >
                  <option value="GH">Ghana (GH)</option>
                  <option value="NG">Nigeria (NG)</option>
                  <option value="KE">Kenya (KE)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Default Base Currency</label>
              <div className="flex items-center gap-2 border border-slate-300 rounded-lg px-3 py-2 bg-slate-50">
                <span className="text-xs font-extrabold text-blue-600">GH₵</span>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full text-xs outline-hidden bg-transparent font-medium"
                >
                  <option value="GHS">GHS (Ghanaian Cedi)</option>
                  <option value="USD">USD ($)</option>
                  <option value="NGN">NGN (Nigerian Naira)</option>
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-colors"
          >
            Save Configuration
          </button>
        </form>
      </div>
    </AppShell>
  );
}
