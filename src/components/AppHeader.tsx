import Link from "next/link";
import { signOut } from "@/lib/auth/actions";
import { createClient } from "@/lib/supabase/server";

/** Top navigation bar for authenticated pages. */
export async function AppHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-slate-900">
          <span className="text-rose-600">●</span> CardioRisk
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/upload" className="text-slate-600 hover:text-slate-900">
            New screening
          </Link>
          {user?.email ? (
            <span className="hidden text-slate-400 sm:inline">{user.email}</span>
          ) : null}
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-slate-700 transition hover:bg-slate-50"
            >
              Sign out
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
