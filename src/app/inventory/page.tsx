"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Package, Plus, AlertTriangle, ArrowUpDown } from "lucide-react";

export default function InventoryPage() {
  const [stockItems, setStockItems] = useState([
    { id: "i1", sku: "SKU-1001", name: "Long Grain Rice 50kg", qty: 18, min: 10, unit: "bags", status: "Optimal" },
    { id: "i2", sku: "SKU-1002", name: "Basmati Rice 5kg", qty: 2, min: 5, unit: "bags", status: "Low Stock" },
    { id: "i3", sku: "SKU-1003", name: "Vegetable Oil 5L", qty: 25, min: 15, unit: "gallons", status: "Optimal" },
    { id: "i4", sku: "SKU-1004", name: "Refined Sugar 25kg", qty: 12, min: 10, unit: "bags", status: "Optimal" },
  ]);

  const [newQty, setNewQty] = useState<{ [key: string]: number }>({});

  const handleRestock = (id: string) => {
    const qtyToAdd = newQty[id] || 10;
    setStockItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              qty: item.qty + qtyToAdd,
              status: item.qty + qtyToAdd >= item.min ? "Optimal" : "Low Stock",
            }
          : item
      )
    );
    setNewQty((prev) => ({ ...prev, [id]: 0 }));
  };

  return (
    <AppShell activeModule="inventory">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Package className="w-6 h-6 text-blue-600" /> Inventory & Stock Management
            </h1>
            <p className="text-sm text-slate-500">Track stock levels, record restocks, and monitor min safety thresholds</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">SKU / Product Name</th>
                <th className="p-4">Current Balance</th>
                <th className="p-4">Min Threshold</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Append Restock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stockItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50">
                  <td className="p-4">
                    <p className="font-bold text-slate-900 text-sm">{item.name}</p>
                    <p className="text-slate-400 font-mono text-[11px]">{item.sku}</p>
                  </td>
                  <td className="p-4 font-extrabold text-sm text-slate-800">
                    {item.qty} {item.unit}
                  </td>
                  <td className="p-4 text-slate-500">{item.min} {item.unit}</td>
                  <td className="p-4">
                    {item.status === "Low Stock" ? (
                      <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 font-bold px-2 py-0.5 rounded text-[11px]">
                        <AlertTriangle className="w-3 h-3" /> Low Stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 font-bold px-2 py-0.5 rounded text-[11px]">
                        Optimal
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <input
                        type="number"
                        placeholder="+10"
                        value={newQty[item.id] || ""}
                        onChange={(e) => setNewQty({ ...newQty, [item.id]: parseInt(e.target.value) || 0 })}
                        className="w-16 px-2 py-1 border border-slate-300 rounded text-center text-xs outline-hidden"
                      />
                      <button
                        onClick={() => handleRestock(item.id)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded text-xs transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Restock
                      </button>
                    </div>
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
