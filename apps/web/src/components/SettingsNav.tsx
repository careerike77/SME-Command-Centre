import Link from 'next/link';

export function SettingsNav() {
  return (
    <div className="border-b border-slate-800 bg-slate-900 px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-emerald-500">AI-BOS</span> Tenant Settings
        </h1>
        <nav className="flex space-x-6 text-sm font-medium">
          <Link href="/settings/tenant" className="text-slate-200 hover:text-emerald-400 transition-colors">
            Tenant Profile
          </Link>
          <Link href="/settings/branches" className="text-slate-200 hover:text-emerald-400 transition-colors">
            Branches
          </Link>
          <Link href="/settings/tax" className="text-slate-200 hover:text-emerald-400 transition-colors">
            Tax & Fiscal
          </Link>
        </nav>
      </div>
    </div>
  );
}
