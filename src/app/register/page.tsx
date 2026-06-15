import { AuthForm } from "@/components/AuthForm";
import { register } from "@/lib/auth/actions";

interface RegisterPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const { error } = await searchParams;

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <AuthForm
        title="Create your account"
        subtitle="Sign up to screen a genotype file for CAD risk."
        action={register}
        submitLabel="Create account"
        error={error}
        footer={{
          prompt: "Already have an account?",
          href: "/login",
          linkLabel: "Sign in",
        }}
      />
    </main>
  );
}
