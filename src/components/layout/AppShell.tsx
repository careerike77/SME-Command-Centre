import React from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  BadgeDollarSign,
  Users,
  UserCheck,
  Bot,
  Settings,
  Building2,
  Wifi,
  WifiOff,
} from "lucide-react";

interface AppShellProps {
  children: React.ReactNode;
  activeModule?: string;
  isOnline?: boolean;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  activeModule = "dashboard",
  isOnline = true,
}) => {
  const navItems = [
    { id: "dashboard", label: "Command Centre", href: "/", icon: LayoutDashboard },
    { id: "pos", label: "Sales / POS", href: "/pos", icon: ShoppingCart },
    { id: "inventory", label: "Inventory", href: "/inventory", icon: Package },
    { id: "finance", label: "Finance", href: "/finance", icon: BadgeDollarSign },
    { id: "crm", label: "CRM", href: "/crm", icon: Users },
    { id: "staff", label: "Staff & Access", href: "/staff", icon: UserCheck },
    { id: "ai", label: "AI Business Assistant", href: "/ai", icon: Bot },
    { id: "settings", label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-100 border-r border-slate-800">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800">
          <div className="p-2 bg-blue-600 rounded-lg text-white font-bold">AB</div>
          <div>
            <h1 className="font-bold text-lg leading-tight">AI-BOSS</h1>
            <p className="text-xs text-slate-400">SME Command Centre</p>
          </div>
        </div>

        {/* Active Tenant Context */}
        <div className="px-6 py-4 bg-slate-950/50 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-400" />
            <div className="text-xs">
              <p className="font-semibold text-slate-200">Accra Wholesale Mart</p>
              <p className="text-slate-400">Ghana (GHS GH₵)</p>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-medium border border-emerald-500/20">
            Active
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Network Status Indicator */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-2">
              {isOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" /> Online Mode
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-400" /> Local Offline Queue
                </>
              )}
            </span>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">v1.0 MVP</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Top Header */}
        <header className="flex md:hidden items-center justify-between px-4 py-3 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-600 rounded text-xs font-bold">AB</div>
            <span className="font-bold text-sm">AI-BOSS Command Centre</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            {isOnline ? (
              <span className="flex items-center gap-1 text-emerald-400">
                <Wifi className="w-3.5 h-3.5" /> Online
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-400">
                <WifiOff className="w-3.5 h-3.5" /> Offline
              </span>
            )}
          </div>
        </header>

        {/* Main Body */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>

        {/* Mobile Navigation Bar */}
        <nav className="flex md:hidden border-t border-slate-200 bg-white px-2 py-2 justify-around">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex flex-col items-center gap-1 text-[10px] font-medium ${
                  isActive ? "text-blue-600" : "text-slate-500"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label.split(" ")[0]}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
