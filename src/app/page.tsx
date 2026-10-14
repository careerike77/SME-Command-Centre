import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Money } from "@/lib/money";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ArrowUpRight,
  Package,
  Users,
  Bot,
} from "lucide-react";

export default function DashboardPage() {
  const todaySales = new Money(4250.0, "GHS");
  const monthlyRevenue = new Money(68450.0, "GHS");
  const monthlyExpenses = new Money(41200.0, "GHS");
  const netProfit = monthlyRevenue.subtract(monthlyExpenses);

  const lowStockAlerts = [
    { name: "Basmati Rice 5kg", sku: "SKU-1002", qty: 2, min: 5 },
    { name: "Refined Cooking Oil 1L", sku: "SKU-1005", qty: 4, min: 10 },
  ];

  return (
    <AppShell activeModule="dashboard">
      <div className="space-y-6">
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">SME Command Centre</h1>
            <p className="text-sm text-slate-500">Real-time operational summary for Accra Wholesale Mart</p>
          </div>
          <div className="flex items-center gap-2 text-xs bg-slate-200/60 px-3 py-1.5 rounded-md text-slate-700">
            <span className="font-semibold">Target Jurisdiction:</span> Ghana (GHS / GH₵)
          </div>
        </div>

        {/* Metrics Overview Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Today&apos;s Sales</span>
              <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-md">
                <TrendingUp className="w-4 h-4" />
              </span>
            </div>
            <p className="mt-3 text-2xl font-extrabold text-slate-900">{todaySales.formatSymbol()}</p>
            <p className="mt-1 text-xs text-emerald-600 flex items-center gap-1 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5" /> +14.2% vs yesterday
            </p>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Monthly Revenue</span>
              <span className="p-1.5 bg-blue-50 text-blue-600 rounded-md">
                <TrendingUp className="w-4 h-4" />
              </span>
            </div>
            <p className="mt-3 text-2xl font-extrabold text-slate-900">{monthlyRevenue.formatSymbol()}</p>
            <p className="mt-1 text-xs text-blue-600 font-medium">Recorded for Current Month</p>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Monthly Expenses</span>
              <span className="p-1.5 bg-amber-50 text-amber-600 rounded-md">
                <TrendingDown className="w-4 h-4" />
              </span>
            </div>
            <p className="mt-3 text-2xl font-extrabold text-slate-900">{monthlyExpenses.formatSymbol()}</p>
            <p className="mt-1 text-xs text-slate-500 font-medium">Rent, Salaries & Inventory</p>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Net Profit</span>
              <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-md">
                <TrendingUp className="w-4 h-4" />
              </span>
            </div>
            <p className="mt-3 text-2xl font-extrabold text-emerald-600">{netProfit.formatSymbol()}</p>
            <p className="mt-1 text-xs text-emerald-600 font-medium">Margin: 39.8%</p>
          </div>
        </div>

        {/* AI Business Assistant Banner */}
        <div className="p-5 bg-slate-900 text-white rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-blue-600 rounded-lg text-white">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base">AI Operations Insight</h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Weekend sales increased by 18% in Accra. Reorder Basmati Rice 5kg immediately to prevent stockout.
              </p>
            </div>
          </div>
          <a
            href="/ai"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-lg transition-colors text-center shrink-0"
          >
            View AI Assistant
          </a>
        </div>

        {/* Operational Modules 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Low Stock Alerts */}
          <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-500" />
                <h2 className="font-bold text-sm text-slate-800">Inventory Low-Stock Alerts</h2>
              </div>
              <span className="text-xs text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded">
                2 Items Critical
              </span>
            </div>
            <div className="space-y-3">
              {lowStockAlerts.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg text-xs">
                  <div>
                    <p className="font-semibold text-slate-800">{item.name}</p>
                    <p className="text-slate-400">{item.sku}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-red-600 font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> {item.qty} units left
                    </span>
                    <p className="text-slate-400 text-[10px]">Min Level: {item.min}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CRM Quick Overview */}
          <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                <h2 className="font-bold text-sm text-slate-800">Top Customer Accounts</h2>
              </div>
              <a href="/crm" className="text-xs text-blue-600 font-semibold hover:underline">
                View All
              </a>
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-semibold text-slate-800">Kofi Trading Enterprise</p>
                  <p className="text-slate-400">+233 24 123 4567</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900">GH₵ 1,200.00</p>
                  <p className="text-slate-400 text-[10px]">Outstanding Balance</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-semibold text-slate-800">Ama Retail Depot</p>
                  <p className="text-slate-400">+233 20 987 6543</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-emerald-600">GH₵ 0.00</p>
                  <p className="text-slate-400 text-[10px]">Clear Balance</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
