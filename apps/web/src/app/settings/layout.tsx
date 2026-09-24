import { SettingsNav } from '@/components/SettingsNav';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <SettingsNav />
      <main className="max-w-6xl mx-auto p-6">{children}</main>
    </div>
  );
}
