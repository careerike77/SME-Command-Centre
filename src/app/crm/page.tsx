"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Money } from "@/lib/money";
import { Users, Plus, Phone, Mail, CreditCard } from "lucide-react";

export default function CrmPage() {
  const [customers, setCustomers] = useState([
    { id: "c1", name: "Kofi Trading Enterprise", phone: "+233 24 123 4567", email: "kofi@trading.gh", balance: 1200.0, limit: 5000.0 },
    { id: "c2", name: "Ama Retail Depot", phone: "+233 20 987 6543", email: "ama@retail.gh", balance: 0.0, limit: 3000.0 },
    { id: "c3", name: "Yaw Provisions Mart", phone: "+233 55 444 3322", email: "yaw@mart.gh", balance: 450.0, limit: 2000.0 },
  ]);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    setCustomers([
      ...customers,
      {
        id: `c-${Date.now()}`,
        name,
        phone: phone || "+233 24 000 0000",
        email: `${name.toLowerCase().replace(/\s+/g, "")}@sme.gh`,
        balance: 0.0,
        limit: 1000.0,
      },
    ]);

    setName("");
    setPhone("");
  };

  return (
    <AppShell activeModule="crm">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" /> Customer Relationship Management (CRM)
            </h1>
            <p className="text-sm text-slate-500">Manage customer profiles, credit limits, and outstanding balances</p>
          </div>
        </div>

        {/* Add Customer Form */}
        <form onSubmit={handleAddCustomer} className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3">
          <h2 className="font-bold text-xs uppercase tracking-wider text-slate-700">Add New Customer Account</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Business / Customer Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded text-xs outline-hidden"
            />
            <input
              type="text"
              placeholder="Phone Number (+233...)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded text-xs outline-hidden"
            />
            <button
              type="submit"
              className="py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded text-xs transition-colors flex items-center justify-center gap-1"
            >
              <Plus className="w-4 h-4" /> Save Customer
            </button>
          </div>
        </form>

        {/* Customer Directory */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {customers.map((c) => (
            <div key={c.id} className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="font-bold text-slate-900 text-sm">{c.name}</h3>
                <p className="text-slate-400 text-[11px] flex items-center gap-1 mt-0.5">
                  <Phone className="w-3 h-3" /> {c.phone}
                </p>
                <p className="text-slate-400 text-[11px] flex items-center gap-1">
                  <Mail className="w-3 h-3" /> {c.email}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <div>
                  <span className="text-slate-500 text-[10px]">Outstanding Balance</span>
                  <p className={`font-extrabold ${c.balance > 0 ? "text-amber-600" : "text-emerald-600"}`}>
                    {new Money(c.balance, "GHS").formatSymbol()}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 text-[10px]">Credit Limit</span>
                  <p className="font-bold text-slate-800">{new Money(c.limit, "GHS").formatSymbol()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
