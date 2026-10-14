"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Money } from "@/lib/money";
import { BadgeDollarSign, Plus, ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function FinancePage() {
  const [entries, setEntries] = useState([
    { id: "f1", type: "income", category: "sale_revenue", amount: 4250.0, desc: "POS Terminal Daily Sales Settlement", date: "2025-01-14" },
    { id: "f2", type: "expense", category: "rent", amount: 1200.0, desc: "Storefront Rent - January", date: "2025-01-10" },
    { id: "f3", type: "expense", category: "inventory_purchase", amount: 2500.0, desc: "Wholesale Grain Restock Invoice #9921", date: "2025-01-08" },
  ]);

  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !desc) return;

    setEntries([
      {
        id: `f-${Date.now()}`,
        type,
        category: type === "income" ? "sale_revenue" : "other_expense",
        amount: parseFloat(amount),
        desc,
        date: new Date().toISOString().split("T")[0],
      },
      ...entries,
    ]);

    setAmount("");
    setDesc("");
  };

  const totalIncome = entries.filter((e) => e.type === "income").reduce((acc, e) => acc + e.amount, 0);
  const totalExpense = entries.filter((e) => e.type === "expense").reduce((acc, e) => acc + e.amount, 0);
  const netPosition = totalIncome - totalExpense;

  return (
    <AppShell activeModule="finance">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <BadgeDollarSign className="w-6 h-6 text-blue-600" /> Structured Financial Ledger
            </h1>
            <p className="text-sm text-slate-500">Record structured income, expenses, and cash movement tracking</p>
          </div>
          <span className="text-xs bg-slate-200 text-slate-700 px-3 py-1 rounded font-semibold">
            Default Currency: GHS (GH₵)
          </span>
        </div>

        {/* Financial Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
            <span className="text-xs font-semibold text-slate-500">Total Recorded Income</span>
            <p className="text-xl font-bold text-emerald-600 mt-1">{new Money(totalIncome, "GHS").formatSymbol()}</p>
          </div>
          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
            <span className="text-xs font-semibold text-slate-500">Total Recorded Expenses</span>
            <p className="text-xl font-bold text-amber-600 mt-1">{new Money(totalExpense, "GHS").formatSymbol()}</p>
          </div>
          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
            <span className="text-xs font-semibold text-slate-500">Net Ledger Position</span>
            <p className={`text-xl font-bold mt-1 ${netPosition >= 0 ? "text-slate-900" : "text-red-600"}`}>
              {new Money(netPosition, "GHS").formatSymbol()}
            </p>
          </div>
        </div>

        {/* Entry Form */}
        <form onSubmit={handleAddEntry} className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3">
          <h2 className="font-bold text-xs uppercase tracking-wider text-slate-700">Record New Financial Voucher</h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <select
              value={type}
              onChange={(e) => setType(e.target.value as "income" | "expense")}
              className="px-3 py-2 border border-slate-300 rounded text-xs font-bold bg-white"
            >
              <option value="expense">Expense Voucher</option>
              <option value="income">Income Entry</option>
            </select>
            <input
              type="text"
              placeholder="Voucher description..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded text-xs outline-hidden"
            />
            <input
              type="number"
              placeholder="Amount (GHS)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded text-xs font-bold outline-hidden"
            />
            <button
              type="submit"
              className="py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded text-xs transition-colors flex items-center justify-center gap-1"
            >
              <Plus className="w-4 h-4" /> Save Ledger Entry
            </button>
          </div>
        </form>

        {/* Ledger Table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">Date</th>
                <th className="p-4">Type / Category</th>
                <th className="p-4">Description</th>
                <th className="p-4 text-right">Amount (GHS)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {entries.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50">
                  <td className="p-4 font-mono text-slate-400">{item.date}</td>
                  <td className="p-4">
                    {item.type === "income" ? (
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 font-bold px-2 py-0.5 rounded text-[11px]">
                        <ArrowUpRight className="w-3 h-3" /> Income
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-600 font-bold px-2 py-0.5 rounded text-[11px]">
                        <ArrowDownRight className="w-3 h-3" /> Expense
                      </span>
                    )}
                  </td>
                  <td className="p-4 font-medium text-slate-800">{item.desc}</td>
                  <td className={`p-4 text-right font-extrabold text-sm ${item.type === "income" ? "text-emerald-600" : "text-slate-800"}`}>
                    {item.type === "income" ? "+" : "-"}{new Money(item.amount, "GHS").formatSymbol()}
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
