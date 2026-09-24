import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-slate-950">
      <div className="max-w-3xl space-y-6">
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl">
          AI-BOS <span className="text-emerald-500">Command Centre</span>
        </h1>
        <p className="text-lg text-slate-400">
          Enterprise Business Operating System featuring deterministic multi-tenant financial engines, row-level security isolation, and AI-powered operations.
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <Link
            href="/auth/login"
            className="px-6 py-3 font-semibold text-white bg-emerald-600 rounded-md hover:bg-emerald-500 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/auth/register"
            className="px-6 py-3 font-semibold text-slate-200 bg-slate-800 rounded-md border border-slate-700 hover:bg-slate-700 transition-colors"
          >
            Register Organization
          </Link>
        </div>
      </div>
    </div>
  );
}
