"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { UserCheck, Plus, ShieldCheck, UserX } from "lucide-react";
import { UserRole } from "@/types/database";

export default function StaffPage() {
  const [members, setMembers] = useState([
    { id: "m1", name: "Kwame Mensah", email: "kwame@accramart.gh", role: "owner" as UserRole, status: "Active" },
    { id: "m2", name: "Abena Osei", email: "abena@accramart.gh", role: "manager" as UserRole, status: "Active" },
    { id: "m3", name: "Kofi Annan", email: "kofi.cashier@accramart.gh", role: "cashier" as UserRole, status: "Active" },
  ]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("cashier");

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    setMembers([
      ...members,
      {
        id: `m-${Date.now()}`,
        name,
        email,
        role,
        status: "Active",
      },
    ]);

    setName("");
    setEmail("");
  };

  return (
    <AppShell activeModule="staff">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-6 h-6 text-blue-600" /> Staff & Access Control (RBAC)
            </h1>
            <p className="text-sm text-slate-500">Manage business team members, assign system roles, and set permission boundaries</p>
          </div>
        </div>

        {/* Invite/Add Staff Form */}
        <form onSubmit={handleAddStaff} className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3">
          <h2 className="font-bold text-xs uppercase tracking-wider text-slate-700">Invite New Staff Member</h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded text-xs outline-hidden"
            />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded text-xs outline-hidden"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="px-3 py-2 border border-slate-300 rounded text-xs font-bold bg-white"
            >
              <option value="cashier">Cashier</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
              <option value="auditor">Auditor</option>
            </select>
            <button
              type="submit"
              className="py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded text-xs transition-colors flex items-center justify-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add Team Member
            </button>
          </div>
        </form>

        {/* Staff Table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">Staff Name / Email</th>
                <th className="p-4">Assigned Role</th>
                <th className="p-4">Authorization Scope</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {members.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/50">
                  <td className="p-4">
                    <p className="font-bold text-slate-900 text-sm">{m.name}</p>
                    <p className="text-slate-400 font-mono text-[11px]">{m.email}</p>
                  </td>
                  <td className="p-4">
                    <span className="uppercase font-extrabold text-[11px] bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                      {m.role}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                      {m.role === "owner" || m.role === "admin"
                        ? "Full Operations Access"
                        : m.role === "manager"
                        ? "POS Sales, Restock & Finance Read"
                        : "POS Sales Terminal Only"}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="bg-emerald-50 text-emerald-600 font-bold px-2 py-0.5 rounded text-[11px]">
                      {m.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
