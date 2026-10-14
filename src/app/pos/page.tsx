"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Money } from "@/lib/money";
import { PosService } from "@/services/pos-service";
import { ShoppingCart, Plus, Minus, Trash2, CreditCard, CheckCircle2 } from "lucide-react";

interface CatalogItem {
  id: string;
  sku: string;
  name: string;
  price: number;
  cost: number;
  taxRate: number;
  stock: number;
}

export default function PosPage() {
  const catalog: CatalogItem[] = [
    { id: "p1", sku: "SKU-1001", name: "Long Grain Rice 50kg", price: 650.0, cost: 520.0, taxRate: 15, stock: 18 },
    { id: "p2", sku: "SKU-1002", name: "Basmati Rice 5kg", price: 85.0, cost: 65.0, taxRate: 15, stock: 2 },
    { id: "p3", sku: "SKU-1003", name: "Vegetable Oil 5L", price: 140.0, cost: 110.0, taxRate: 15, stock: 25 },
    { id: "p4", sku: "SKU-1004", name: "Refined Sugar 25kg", price: 320.0, cost: 260.0, taxRate: 15, stock: 12 },
  ];

  const [cart, setCart] = useState<{ item: CatalogItem; qty: number }[]>([]);
  const [paidAmount, setPaidAmount] = useState<string>("");
  const [lastReceipt, setLastReceipt] = useState<string | null>(null);

  const addToCart = (item: CatalogItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.item.id === item.id);
      if (existing) {
        return prev.map((c) => (c.item.id === item.id ? { ...c, qty: c.qty + 1 } : c));
      }
      return [...prev, { item, qty: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => {
          if (c.item.id === id) {
            const newQty = c.qty + delta;
            return newQty > 0 ? { ...c, qty: newQty } : null;
          }
          return c;
        })
        .filter(Boolean) as { item: CatalogItem; qty: number }[]
    );
  };

  const subtotalNum = cart.reduce((acc, c) => acc + c.item.price * c.qty, 0);
  const taxNum = cart.reduce((acc, c) => acc + (c.item.price * c.qty * c.item.taxRate) / 100, 0);
  const grandTotalNum = subtotalNum + taxNum;

  const handleCheckout = () => {
    if (cart.length === 0) return;

    const paid = parseFloat(paidAmount) || grandTotalNum;

    const result = PosService.processSale({
      tenantId: "tenant-accra-01",
      cashierId: "usr-cashier-1",
      paymentMethod: "cash",
      paidAmount: paid,
      items: cart.map((c) => ({
        productId: c.item.id,
        productName: c.item.name,
        quantity: c.qty,
        unitPrice: c.item.price,
        costPrice: c.item.cost,
        taxRatePercent: c.item.taxRate,
      })),
      currency: "GHS",
    });

    setLastReceipt(result.sale.receipt_number);
    setCart([]);
    setPaidAmount("");
  };

  return (
    <AppShell activeModule="pos">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        {/* Product Catalog Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-blue-600" /> POS Terminal / Sales
            </h1>
            <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded">
              Currency: GHS (GH₵)
            </span>
          </div>

          {lastReceipt && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Sale Completed successfully!
              </span>
              <span>Receipt #: <strong>{lastReceipt}</strong></span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {catalog.map((item) => (
              <div
                key={item.id}
                onClick={() => addToCart(item)}
                className="p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-500 cursor-pointer transition-all shadow-xs flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold text-slate-400">{item.sku}</span>
                  <h3 className="font-bold text-sm text-slate-800">{item.name}</h3>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="font-extrabold text-blue-600 text-sm">
                    {new Money(item.price, "GHS").formatSymbol()}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                      item.stock <= 5 ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    Stock: {item.stock}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Order Summary Column */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-3 mb-4">
              Current Basket
            </h2>

            {cart.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">No items added to sale</p>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {cart.map(({ item, qty }) => (
                  <div key={item.id} className="flex items-center justify-between text-xs p-2 bg-slate-50 rounded">
                    <div>
                      <p className="font-semibold text-slate-800">{item.name}</p>
                      <p className="text-slate-400">{new Money(item.price, "GHS").formatSymbol()} / unit</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQty(item.id, -1)}
                        className="p-1 hover:bg-slate-200 rounded text-slate-600"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-bold w-4 text-center">{qty}</span>
                      <button
                        onClick={() => updateQty(item.id, 1)}
                        className="p-1 hover:bg-slate-200 rounded text-slate-600"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => updateQty(item.id, -qty)}
                        className="p-1 hover:bg-red-100 text-red-600 rounded ml-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Checkout Section */}
          <div className="border-t border-slate-100 pt-4 space-y-3">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span>{new Money(subtotalNum, "GHS").formatSymbol()}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Tax (15% VAT/NHIL)</span>
                <span>{new Money(taxNum, "GHS").formatSymbol()}</span>
              </div>
              <div className="flex justify-between font-extrabold text-slate-900 text-sm pt-1 border-t border-slate-100">
                <span>Grand Total</span>
                <span className="text-blue-600">{new Money(grandTotalNum, "GHS").formatSymbol()}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="block text-[11px] font-semibold text-slate-600">Paid Amount (GHS)</label>
              <input
                type="number"
                placeholder={grandTotalNum > 0 ? grandTotalNum.toFixed(2) : "0.00"}
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-hidden"
              />
            </div>

            <button
              disabled={cart.length === 0}
              onClick={handleCheckout}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <CreditCard className="w-4 h-4" /> Complete Sale & Print Receipt
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
