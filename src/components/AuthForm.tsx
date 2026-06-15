import Link from "next/link";

interface AuthFormProps {
  title: string;
  subtitle: string;
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
  error?: string;
  next?: string;
  footer: { prompt: string; href: string; linkLabel: string };
}

/** Shared sign-in / sign-up card. Used by both the login and register pages. */
export function AuthForm({
  title,
  subtitle,
  action,
  submitLabel,
  error,
  next,
  footer,
}: AuthFormProps) {
  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>

      <form action={action} className="mt-6 space-y-4">
        {next ? <input type="hidden" name="next" value={next} /> : null}

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Email</span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
            placeholder="you@example.com"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Password</span>
          <input
            type="password"
            name="password"
            required
            minLength={6}
            autoComplete="current-password"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
            placeholder="••••••••"
          />
        </label>

        {error ? (
          <p
            role="alert"
            className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700"
          >
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          className="w-full rounded-lg bg-rose-600 px-4 py-2.5 font-medium text-white transition hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-300"
        >
          {submitLabel}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        {footer.prompt}{" "}
        <Link href={footer.href} className="font-medium text-rose-600 hover:underline">
          {footer.linkLabel}
        </Link>
      </p>
    </div>
  );
}
