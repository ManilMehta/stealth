import { AuthForm } from "@/components/AuthForm";
import { login } from "@/lib/auth/actions";

interface LoginPageProps {
  searchParams: Promise<{ error?: string; next?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error, next } = await searchParams;

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <AuthForm
        title="Welcome back"
        subtitle="Sign in to view your CAD risk report."
        action={login}
        submitLabel="Sign in"
        error={error}
        next={next}
        footer={{
          prompt: "New here?",
          href: "/register",
          linkLabel: "Create an account",
        }}
      />
    </main>
  );
}
